// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./common/IAccessMaster.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error TokenFestCollab__ProposalRejected();
error TokenFestCollab_ClaimedNotPossible();

/**
 * @title TokenFestCollab - A Collaborative Crowdfunding NFT Smart Contract
 * @dev This contract enables the creation of crowdfunding campaigns as NFTs. Each NFT represents a unique crowdfunding opportunity with milestones.
 */
contract TokenFestCollab is Context, ERC721Enumerable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    

    bool public pause; /// @notice if the contract is paused or not 
    bool public isCreatorStaked; /// @notice if creator has staked or not
    bool public isProposalRejected; /// @notice if the Proposal has been rejected or not
    bool public isProposalCleared;/// @notice  if the proposal has cleared the event funding without dispute

    address public immutable proposalCreator; 

    uint256 public immutable crowdFundingGoal;
    uint256 public fundsInReserve; ///@dev to know how much fund is collected still yet before the
    uint256 public fundingActiveTime; /// @notice crowfund start time
    uint256 public fundingEndTime; /// @notice  crowfund end time
    uint256 public salePrice; /// @notice Sale Price of per NFT

    uint8 public numberOfMileStones; /// @notice number of times user has taken out funding

    string public baseURI; /// @notice  for NFT metadata

    string[] public mileStone; /// @notice  store the ipfs hash 
    mapping(uint256 => bool) public refundStatus; /// @dev  if refund has been intiated or not 

    IACCESSMASTER flowRoles;
    IERC20 token;

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "TokenFestCollab: User is not authorized"
        );
        _;
    }

    modifier onlyProposalCreator() {
        require(
            _msgSender() == proposalCreator,
            "TokenFestCollab: User is not proposal creator"
        );
        _;
    }

    modifier onlyWhenProposalIsNotActive() {
        require(
            block.timestamp < fundingActiveTime,
            "TokenFestCollab: Funding has been intiated , action cannot be performed"
        );
        _;
    }
    modifier onlyWhenNotPaused() {
        require(pause == false, "TokenFestCollab: Funding is paused!");
        _;
    }

    /**
     * @dev Event emitted when an NFT ticket is minted.
     */
    event TicketMinted(uint256 tokenID, address indexed creator);

     /**
     * @dev Event emitted when a milestone is submitted.
     */
    event MileStoneSubmitted(string data);

     /**
     * @dev Event emitted when the proposal creator stakes funds.
     */
    event Staked(uint256 indexed amount, bool state);

      /**
     * @dev Event emitted when the proposal creator unstakes funds.
     */
    event Unstaked(uint256 indexed amount, bool state);

     /**
     * @dev Event emitted when funds are withdrawn by the proposal creator.
     */
    event FundWithdrawnByHandler(
        uint8 milestoneNumber,
        uint256 amount,
        address wallet
    );
     /**
     * @dev Event emitted when ERC20 funds are transferred.
     */
    event FundsTransferred(
        address indexed toWallet,
        address indexed fromWallet,
        uint256 indexed amount
    );
      /**
     * @dev Event emitted when a refund is claimed.
     */
    event RefundClaimed(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed amount
    );
    event Validate(
        bool isPaused,
        bool isproposalCleared,
        bool isproposalRejected
    );

    /**
     * @dev Constructor to initialize the contract.
     * @param _proposalCreator - Address of the creator of the proposal.
     * @param proposalName - Name of the NFT representing the crowdfunding campaign.
     * @param proposalSymbol - Symbol of the NFT.
     * @param proposalDetails - Array with the crowdfunding goal (in stablecoin), funding start time, funding end time, and NFT sale price.
     * @param _baseURI - BaseURI for NFT details.
     * @param contractAddr - Array with two addresses: the contract's stablecoin address for receiving funds and the AccessMaster address for the company.
     */
    constructor(
        address _proposalCreator,
        string memory proposalName,
        string memory proposalSymbol,
        uint256[] memory proposalDetails,
        string memory _baseURI,
        address[] memory contractAddr
    ) ERC721(proposalName, proposalSymbol) {
        proposalCreator = _proposalCreator;
        require(
            proposalDetails.length == 4,
            "TokenFest: Invalid Proposal Input"
        );
        crowdFundingGoal = proposalDetails[0];
        fundingActiveTime = block.timestamp + proposalDetails[1];
        fundingEndTime = block.timestamp + proposalDetails[2];
        salePrice = proposalDetails[3];
        baseURI = _baseURI;
        require(
            contractAddr.length == 2,
            "TokenFest: Invalid Contract Input"
        );
        token = IERC20(contractAddr[0]);
        flowRoles = IACCESSMASTER(contractAddr[1]);

        pause = true;
    }

    /** Private/Internal Functions **/

    function _pause() private {
        pause = true;
    }

    function _unpause() private {
        pause = false;
    }

    /// @dev to Reject the Proposal completely by the NFT holders or by operator
    function _proposalRejection() private {
        isProposalRejected = true;
        _pause();
    }

    /// @dev to transfer ERC20 Funds from one address to another
    function _transferFunds(
        address from,
        address to,
        uint256 amount
    ) private returns (bool) {
        uint256 value = token.balanceOf(from);
        require(value >= amount, "TokenFestCollab: Not Enough Funds!");
        bool success;
        if (from == address(this)) {
            success = token.transfer(to, amount);
            require(success, "TokenFestCollab: Transfer failed");
        } else {
            success = token.transferFrom(from, to, amount);
            require(success,"TokenFestCollab: Transfer failed");
        }
        emit FundsTransferred(from, to, amount);
        return success;
    }

    /** PUBLIC/EXTERNAL Function */

    /**
     * @dev Allows the proposal creator to change the funding start time before the funding has started.
     * @param time - New funding start time in UNIX time.
     */
    function setFundingStartTime(
        uint256 time
    ) external onlyProposalCreator onlyWhenProposalIsNotActive {
        fundingActiveTime = block.timestamp + time;
    }

    /**
     * @dev Allows the proposal creator to change the funding end time before the funding has started.
     * @param time - New funding end time in UNIX time.
     */
    function setFundingEndTime(
        uint256 time
    ) external onlyProposalCreator onlyWhenProposalIsNotActive {
        fundingEndTime = block.timestamp + time;
    }

     /**
     * @dev Submits a milestone description as an IPFS hash. Can only be called by the proposal creator.
     * @param data - IPFS hash representing the milestone description.
     */
    function submitMileStoneInfo(
        string memory data
    ) external onlyProposalCreator {
        mileStone.push(data);
        emit MileStoneSubmitted(data);
    }

    /**
     * @dev Initializes the first milestone funding. Can only be called by the creator and only once.
     * This function is used to unpause the funding.
     */
    function intiateProposalFunding() external onlyProposalCreator {
        require(
            fundsInReserve == crowdFundingGoal && numberOfMileStones == 0,
            "TokenFestHolder: Proposal cannot be intiated"
        );
        _unpause();
    }

    /**
     * @dev Initializes the first Proposal Rejection. Can only be called by the creator and only once.
     * This function is used to reject by anyone if funding goal is not reached.
     */
    function intiateRejection() external {
        require(
            block.timestamp > fundingEndTime &&
                fundsInReserve < crowdFundingGoal,
            "TokenFestCollab: Rejection cannot be done"
        );
        _proposalRejection();
        isProposalCleared = true;
    }

    /// @dev user have to stake the 20% of the funding goal as security deposit , if the user doesn't stake
    /// the funding will never start and get Automatically rejected
    function stake(
        uint256 amount
    ) external onlyProposalCreator  {
        uint256 stakingAmount = (crowdFundingGoal * 20) / 100;
        // require(
        //     amount == stakingAmount,
        //     "TokenFestCollab: Funds should be equal to staking amount"
        // );
        // require(
        //     isCreatorStaked == false,
        //     "TokenFest: Proposal Creator already staked"
        // );
        isCreatorStaked = _transferFunds(
            _msgSender(),
            address(this),
            stakingAmount
        );
        emit Staked(stakingAmount, isCreatorStaked);
    }

   
    /**
     * @dev Mints an NFT representing a crowdfunding ticket and collects funds for the campaign.
     * Can only be called when the fundingActiveTime has started and before fundingEndTime is reached.
     *  Can only be called when Proposal is not rejected or Crowfunding goal haven't reached
     * Refunds are possible if the funding goal is not reached or if the proposal is rejected.
     * @return currentTokenID - The ID of the minted NFT.
     */
    function mintTicket() external returns (uint256) {
        require(
            isProposalRejected == false,
            "TokenFestCollab : Proposal is being rejected"
        );
        require(
            block.timestamp >= fundingActiveTime &&
                block.timestamp < fundingEndTime,
            "TokenFestCollab: Funding time has been passed"
        );
        if (isCreatorStaked == false) {
            _proposalRejection();
            revert TokenFestCollab__ProposalRejected();
        }
        require(
            fundsInReserve < crowdFundingGoal,
            "TokenFestCollab: Funding goal has been reached"
        );
        _transferFunds(_msgSender(), address(this), salePrice);
        fundsInReserve += salePrice;
        _tokenIdTracker.increment();
        uint256 currentTokenID = _tokenIdTracker.current();
        _safeMint(_msgSender(), currentTokenID);
        emit TicketMinted(currentTokenID, _msgSender());
        return currentTokenID;
    }

    /**
     * @dev Allows the proposal creator to withdraw funds collected from milestone completions.
     * Can only be called when the contract is not paused and when the proposal is cleared.
     * @param wallet - Address to which funds will be withdrawn.
     * @param amount - Amount to be withdrawn.
     */
    function withdrawFunds(
        address wallet,
        uint256 amount
    ) external onlyProposalCreator onlyWhenNotPaused nonReentrant {
        uint256 val = (crowdFundingGoal * 20) / 100;
        require(
            amount <= val && fundsInReserve > 0,
            "TokenFestCollab: Amount to be collected more than staked"
        );
        require(
            fundsInReserve >= amount,
            "TokenFestCollab: Process cannot proceed , less than reserve fund"
        );
        fundsInReserve -= amount;
        _pause();
        _transferFunds(address(this), wallet, amount);
        numberOfMileStones++;
        emit FundWithdrawnByHandler(numberOfMileStones, amount, wallet);
    }

     /**
     * @dev Validates the proposal, either unpauses or rejects the proposal, and sets the cleared status.
     * Can only be called by operators.
     * @param result - Boolean indicating the validation result.
     * @param proposalRejectedStatus - Boolean indicating if the proposal is rejected.
     */
    function validate(
        bool result,
        bool proposalRejectedStatus
    ) external onlyOperator {
        if (result == true) {
            if (fundsInReserve == 0) {
                isProposalCleared = true;
            } else {
                _unpause();
            }
        } else {
            if (proposalRejectedStatus) {
                _proposalRejection();
            } else {
                _pause();
            }
        }
        emit Validate(result,isProposalCleared,proposalRejectedStatus);
    }

   /**
     * @dev Allows users to claim back the amount they have deposited through purchasing tickets,
     * if either the funding goal is not reached or the proposal is rejected.
     * Refunds are only possible under these conditions.
     * @param tokenId - ID of the NFT representing the ticket to be refunded.
     * @return refundValue - The refunded amount.
     * @return refundStatus[tokenId] - Whether the refund has been claimed for this ticket.
     */
    function claimback(
        uint256 tokenId
    ) external nonReentrant returns (uint256, bool) {
        require(
            ownerOf(tokenId) == _msgSender(),
            "TokenFest: User is not the token owner"
        );
        require(
            refundStatus[tokenId] == false,
            "TokenFest: Refund is already claimed!"
        );
        if (
            fundingEndTime < block.timestamp &&
            fundsInReserve != crowdFundingGoal
        ) {
            uint256 refundValue = salePrice;
            refundStatus[tokenId] = true;
            _transferFunds(address(this), _msgSender(),refundValue);
            emit RefundClaimed(tokenId, _msgSender(), refundValue);
            return (refundValue, refundStatus[tokenId]);
        } else if (isProposalRejected) {
            uint256 value = (crowdFundingGoal * 20) / 100;
            value += fundsInReserve;
            uint256 refundValue = refundAmount(value);
            refundStatus[tokenId] = true;
            _transferFunds(address(this), _msgSender(), refundValue);
            emit RefundClaimed(tokenId, _msgSender(), refundValue);
            return (refundValue, refundStatus[tokenId]);
        } else {
            revert TokenFestCollab_ClaimedNotPossible();
        }
    }

      /**
     * @dev Allows the proposal creator to unstake their funds if the proposal is cleared.
     * The funds were initially staked as a security deposit.
     * @return amount - The amount unstaked by the proposal creator.
     */
    function unStake() external onlyProposalCreator returns (uint256 amount) {
        require(
            isProposalCleared == true && isCreatorStaked == true,
            "TokenFest: User cannot withdraw funds"
        );
        amount = (crowdFundingGoal * 20) / 100;
        isCreatorStaked = false;
        _transferFunds(address(this), proposalCreator, amount);
    }


    ///////////////////////////////////////////////////
    /** OPERATOR FUNCTIONS */
    /// @dev if unsupported tokens or accidently someone send some tokens to the contract to withdraw that
    function withdrawFundByOperator(
        address wallet,
        uint256 amount,
        address tokenAddr
    ) external onlyOperator returns (bool status) {
        status = IERC20(tokenAddr).transferFrom(address(this), wallet, amount);
    }

    /// @dev forcefull unpause or pause by operator if situations comes
    function unpauseOrPauseByOperator(bool state) external onlyOperator {
        if (state) {
            _pause();
        } else _unpause();
    }

    /// @dev intiated rejection if the something fishy happens
    function intiateRejectionByOperator() external onlyOperator {
        _proposalRejection();
    }

    function reverseRejection(bool state) external onlyOperator{
        isProposalRejected = state;
    }

    function stakeRefundByOperator() external onlyOperator  returns (uint256 stakingAmount) {
        stakingAmount = (crowdFundingGoal * 20) / 100; 
        _transferFunds(address(this),proposalCreator,stakingAmount);
        isCreatorStaked = false;
    }

    function setFundingStartTimeOperator(
        uint256 time
    ) external onlyOperator {
        fundingActiveTime = block.timestamp + time;
    }

    function setFundingEndTimeOperator(
        uint256 time
    ) external  onlyOperator {
        fundingEndTime = block.timestamp + time;
    }

    function setData(bool a, bool b,bool c , bool d) external onlyOperator{
        pause = a; 
        isCreatorStaked = b;  
        isProposalRejected =  c; 
        isProposalCleared = d;
    }

    ///////////////////////////////////////////////////

    /** Getter Functions **/
    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "TokenFestCollab: Non-Existent Asset");
        return baseURI;
    }

    function refundAmount(
        uint256 amount
    ) public view returns (uint256 refundValue) {
        refundValue = amount / totalSupply();
    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
