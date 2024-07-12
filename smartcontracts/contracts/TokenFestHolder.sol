// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./common/IAccessMaster.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./common/ERC721A/ERC721A.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

   
error TokenFestHolder__ProposalRejected();
error TokenFestHolder_ClaimedNotPossible();
error TokenFestHolder_NotEnoughFunds();

contract TokenFestHolder is Context, ERC721A , ReentrancyGuard {
 

    bool public pause ;
    bool public isCreatorStaked;
    bool public isYieldReturned;
    bool public isProposalRejected;
    bool public isProposalCleared;
    bool public ifOperatorApproveRefund;

    address public immutable proposalCreator;

    uint256 public immutable crowdFundingGoal;
    uint256 public fundsInReserve;///@dev to know how much fund is collected still yet before the
    uint256 public fundingActiveTime;
    uint256 public fundingEndTime;
    uint256 public salePrice;
    uint256 public stakingAmount;

    uint256 public immutable maxSupply; /// @notice Max supply  of tokens can minted . Calculated CrowdfundingGoal / SalePrice
    uint256 public immutable yeildToBeRecieved;/// @notice the value of yield to be submitted by proposalCreator
    
    uint8 public numberOfMileStones;
    uint8 public immutable yieldBasisPoints; /// @notice the percentage of yield the proposal creator will submit

    string public baseURI;

    string[] public mileStone;
    mapping (address => bool) public refundStatus;

    IACCESSMASTER flowRoles;
    IERC20 token;

    modifier onlyOperator() {
        require(
            flowRoles.isOperator(_msgSender()),
            "TokenFestHolder: User is not authorized"
        );
        _;
    }
    
    modifier onlyProposalCreator {
        require(_msgSender() == proposalCreator,"TokenFestHolder: User is not proposal creator");
        _;      
    }

    modifier onlyWhenProposalIsNotActive {
        require(
            block.timestamp < fundingActiveTime,"TokenFestHolder: Funding has been intiated , action cannot be performed"
        );
        _;
    }
    modifier onlyWhenNotPaused {
        require(
            pause == false ,"TokenFestHolder: Funding is paused!"
        );
        _;
    }

    event TicketMinted(
        uint256 indexed previousSupply,
        uint256 indexed currentSupply,
        address indexed creator
    );

    event MileStoneSubmitted(
        string data
    );

    event Staked(
        uint256 indexed amount,
        bool state
    );

    event Unstaked(
        uint256 indexed amount,
        bool state
    );

    event FundWithdrawnByHandler(
        uint8 milestoneNumber,
        uint256 amount,
        address wallet
    );

    event FundsTransferred(
        address indexed toWallet,
        address indexed fromWallet,
        uint256 indexed amount
    );

    event RefundClaimed(
        uint256 indexed quantity,
        address indexed owner,
        uint256 indexed amount
    );

    event YieldSubmitted(
        bool state,
        uint256 amount
    );

    event Validate(
        bool isPaused,
        bool isproposalCleared,
        bool isproposalRejected
    );


    /**
     * 
     * @param _proposalCreator - who is  creating the proposal
     * @param proposalName - Name of the event as well as NFT token Name
     * @param proposalSymbol - Symbol of the event as well as the NFT token symbol
     * @param proposalDetails - First parameter crowdfunding goal which should be in stablecoin ,
     * Second parameter is the starting time of proposal, third parameter is endingTime of the proposal
     * fourth parameter is the Price of the NFT
     * @param yieldRate - It is predefined rate of Returns the event organisor will give 
     * to the Token Holders after the event is finished
     * @param _baseURI - BaseURI  of  NFT for it's details
     * @param contractAddr  - first parameter is the contract stableCoin Address for recieving funds and 
     * second parameter is Accessmaster Address  for the company
     */

    constructor(
        address _proposalCreator,
        string memory proposalName,
        string memory proposalSymbol,
        uint256 []  memory proposalDetails,
        uint8 yieldRate,
        string memory _baseURI,
        address [] memory contractAddr
    ) ERC721A(proposalName, proposalSymbol) {
        proposalCreator = _proposalCreator;

        require(proposalDetails.length == 4,"TokenFestHolder: Invalid Proposal Input");
        crowdFundingGoal = proposalDetails[0];
        fundingActiveTime = block.timestamp + proposalDetails[1];
        fundingEndTime = block.timestamp + proposalDetails[2];
        salePrice = proposalDetails[3];
        yieldBasisPoints = yieldRate;
        baseURI = _baseURI;
        
        require(contractAddr.length == 2,"TokenFestHolder: Invalid Contract Input");
        token = IERC20(contractAddr[0]);
        flowRoles = IACCESSMASTER(contractAddr[1]);

        uint256 amount = (crowdFundingGoal * yieldBasisPoints) / 100; 
        yeildToBeRecieved = crowdFundingGoal + amount;
        maxSupply = crowdFundingGoal / salePrice;
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
     function _proposalRejection() private{
        isProposalRejected = true;
        _pause();
        
    }

    /// @dev to transfer ERC20 Funds from one address to another
    function _transferFunds(address from,address to,uint256 amount) private  returns(bool){
        uint256 value = token.balanceOf(from);
        require(value >= amount, "TokenFestCollab: Not Enough Funds!");
        bool success;
        if (from == address(this)) {
            success = token.transfer(to, amount);
            require(success, "TokenFestCollab: Transfer failed");
        } else {
            success = token.transferFrom(from, to, amount);
            require(success, "TokenFestCollab: Transfer failed");
        }
        emit FundsTransferred(from, to, amount);
        return success; 
    }

      /** PUBLIC/EXTERNAL Function */

     ///@dev the function will be called only by proposal Creator to change the funding start time ,
    /// only when funding hasn't started
    /// @param time - it is in UNIX time 
    function setFundingStartTime(
        uint256 time
    )external onlyProposalCreator onlyWhenProposalIsNotActive {
        fundingActiveTime = block.timestamp + time;
     }

    
    ///@dev the function will be called only by proposal Creator to change the funding end time ,
    /// only when funding hasn't started
    /// @param time - it is in UNIX time
    function setFundingEndTime(
        uint256 time
    )external onlyProposalCreator onlyWhenProposalIsNotActive {
        fundingEndTime = block.timestamp + time;
     }


     /// @dev to submit the milestone as a ipfs hash
    function submitMileStoneInfo(string memory data)external onlyProposalCreator {
        mileStone.push(data);
        emit MileStoneSubmitted(data);
    }

    ///@dev this function can be called only once for the intialization of first milestone funding, only by creator
    function intiateProposalFunding()external onlyProposalCreator {
        require(
            fundsInReserve == crowdFundingGoal && numberOfMileStones == 0,
            "TokenFestHolder: Proposal cannot be intiated"
        );
        _unpause();
    }


    /// @dev Users must utilize this tool to reject the proposal in order to get their money back 
    /// if the crowdfunding campaign is not finished in the allotted period.
    /// And it is accessible to everybody.
    function intiateRejection()  external {
        if( block.timestamp > fundingEndTime && fundsInReserve < crowdFundingGoal){
            _proposalRejection();
            isProposalCleared = true;
        }
    }

      /// @dev user have to stake the 20% of the funding goal as security deposit , if the user doesn't stake 
    /// the funding will never start and get Automatically rejected
    function stake(uint256 amount) external onlyProposalCreator onlyWhenProposalIsNotActive{
        stakingAmount = (crowdFundingGoal * 20) / 100;
         require(
            amount == stakingAmount,
            "TokenFestCollab: Funds should be equal to staking amount"
        );
        require(
            isCreatorStaked == false,
            "TokenFest: Proposal Creator already staked"
        );
        isCreatorStaked = _transferFunds(_msgSender(),address(this),stakingAmount);
        emit Staked(stakingAmount,isCreatorStaked);
    }

    
    /// @dev this function is for purchasing NFT and minting 
    /// it will be start when fundingActiveTime is reached, it will end when fundingEndTime is reached
    /// funding will be only work until crowfunding goal is reached , even before fundingEndTime
    function mintTicket(uint256 quantity)external returns (uint256 prevQuntity,uint256 currentQuantity) {
        require(
            isProposalRejected == false,
            "TokenFestCollab : Proposal is being rejected"
        );
        require(
            totalSupply() + quantity <= maxSupply,
            "TokenFestHolder: Amount cannot be minted!"
        );
        require(block.timestamp >= fundingActiveTime && block.timestamp < fundingEndTime,"TokenFestHolder: Funding cannot be done"); 
        /// if the creator didn't staked the proposal will be rejected and users can claimback
        if(isCreatorStaked == false){
                _proposalRejection();
                revert TokenFestHolder__ProposalRejected();        
        }
        prevQuntity = totalSupply();
        uint256 amount = quantity * salePrice;
        _transferFunds(_msgSender(),address(this),amount);
        fundsInReserve += amount;
        _safeMint(_msgSender(), quantity);
        emit TicketMinted(prevQuntity,totalSupply() ,_msgSender());
        currentQuantity = totalSupply();
    }

    /// @notice only Proposal Creator  can withdraw the funds collected
    function withdrawFunds(address wallet, uint256 amount) external onlyProposalCreator onlyWhenNotPaused nonReentrant{
        require(
            amount <= stakingAmount && fundsInReserve > 0,
            "TokenFestHolder: Amount to be collected more than staked"
        );
         require(
            fundsInReserve >= amount,
            "TokenFestCollab: Process cannot proceed , more than reserve fund"
        );

        fundsInReserve -= amount;
        _pause();
        _transferFunds(address(this),wallet,amount);
        numberOfMileStones ++;
        emit FundWithdrawnByHandler(numberOfMileStones,amount,wallet);
    }

    /// validate() -> To unpause  or Reject or  to set if proposal is all cleared or not

      function validate(bool result,bool proposalRejectedStatus) external onlyOperator {
        if(result == true){
            if(fundsInReserve == 0){
                isProposalCleared = true;
            }
            else{
                _unpause();
            }
        }
        else{
            if(proposalRejectedStatus){
                _proposalRejection();
            }
            else{
                _pause();
            }
        }
       emit Validate(result,isProposalCleared,proposalRejectedStatus);
    }
    
     /// @dev the users can claimback the amount they have deposited through purchasing 
    /// if either funding Goal is not reached or  Proposal Is rejected
    /// If the Profit is submitted by the Proposal Creator
    function claimback() external nonReentrant returns(uint256 ,bool) {
       uint nftBalance = balanceOf(_msgSender());
       uint256 amountToClaim ;
       uint256 refundValue;
       require(nftBalance > 0,"TokenFestHolder: User cannot claimback");
       require(refundStatus[_msgSender()] == false,"TokenFestHolder: Refund is already claimed!");
       if(fundingEndTime < block.timestamp && fundsInReserve != crowdFundingGoal){   
            refundValue = refundAmount(fundsInReserve);
            refundStatus[_msgSender()] = true;
            amountToClaim = nftBalance * refundValue;
            _transferFunds(address(this),_msgSender(),refundValue);
            emit RefundClaimed(nftBalance,_msgSender(),refundValue);
            return (refundValue,refundStatus[_msgSender()]);
       }
       else if(isProposalRejected){
            uint256 value = (crowdFundingGoal * 20) / 100;
            value += fundsInReserve;
            refundValue = refundAmount(value);
            refundStatus[_msgSender()] = true;
            amountToClaim = nftBalance * refundValue;
           _transferFunds(address(this),_msgSender(),amountToClaim);
            emit RefundClaimed(nftBalance,_msgSender(),amountToClaim);
            return (refundValue,refundStatus[_msgSender()]);
       }
       else if(isYieldReturned){
            refundValue = refundAmount(yeildToBeRecieved);
            refundStatus[_msgSender()] = true;
            amountToClaim = nftBalance * refundValue;
           _transferFunds(address(this),_msgSender(),amountToClaim);
           emit RefundClaimed(nftBalance,_msgSender(),amountToClaim);
           return (refundValue,refundStatus[_msgSender()]);
       }
       else if(ifOperatorApproveRefund){
            uint256 value = token.balanceOf(address(this));
            refundValue = refundAmount(value);
            refundStatus[_msgSender()] = true;
            amountToClaim = nftBalance * refundValue;
           _transferFunds(address(this),_msgSender(),amountToClaim);
           emit RefundClaimed(nftBalance,_msgSender(),amountToClaim);
           return (refundValue,refundStatus[_msgSender()]);
       }
       else{
            revert TokenFestHolder_ClaimedNotPossible();
       }
    }   


    /// @dev the proposal creator will submit there funds through this 
    /// if proposal creator address have less than the yeild it should
    /// it would be taken from staking amount
    function yieldSubmission() external onlyProposalCreator{
        require(isYieldReturned == false,"TokenFestHolder: Action cannot be proceeded");
        uint256 balanceOfCreator = token.balanceOf(proposalCreator);
        if(balanceOfCreator >=  yeildToBeRecieved){
            _transferFunds(_msgSender(),address(this),yeildToBeRecieved);
            isYieldReturned = true;
            emit YieldSubmitted(true,yeildToBeRecieved);
        }
        else{
            uint256 deficit = yeildToBeRecieved - balanceOfCreator;
            if(deficit <= stakingAmount){
                _transferFunds(_msgSender(),address(this),balanceOfCreator);
                stakingAmount -= deficit;
                isYieldReturned = true;
                emit YieldSubmitted(true,yeildToBeRecieved);
            }
            else{
                revert TokenFestHolder_NotEnoughFunds();
            }
       }

    }

    /// @dev if everything is cleared for the Proposal creator , the user can  unstake their funds 
    function unStake() external onlyProposalCreator  returns(uint256) {
        require(
            isProposalCleared == true && isCreatorStaked == true,
            "TokenFestHolder: User cannot withdraw funds");
        require(stakingAmount > 0,"TokenFestHolder: Not Enough Staking Funds");
        if(fundsInReserve == 0){
            require(isYieldReturned == true,"TokenFestHolder: Yield is not submitted");
        }
        isCreatorStaked = false;
        _transferFunds(address(this),proposalCreator,stakingAmount);   
        return stakingAmount;     
    }


    /** OPERATOR FUNCTIONS */
      /// @dev if unsupported tokens or accidently someone send some tokens to the contract to withdraw that 
    function withdrawFundByOperator(
            address wallet,
            uint256 amount ,
            address tokenAddr
        )external onlyOperator returns(bool status){
           status = IERC20(tokenAddr).transferFrom(address(this),wallet,amount);
    }

     /// @dev forcefull unpause or pause by operator if situations comes
    function unpauseOrPauseByOperator(bool state) external onlyOperator{
        if(state){
            _pause();
        }
        else _unpause();
    }

     /// @dev forcefull unpause or pause by operator if situations comes
    function OperatorApproveRefund(bool state) external onlyOperator{
        ifOperatorApproveRefund = state;
    }

     /// @dev intiated rejection if the something fishy happens
    function intiateRejectionByOperator()external onlyOperator {
         _proposalRejection();
    }

     function setFundingStartTimeOperator(
        uint256 time
    ) external onlyProposalCreator onlyOperator {
        fundingActiveTime = block.timestamp + time;
    }

    function setFundingEndTimeOperator(
        uint256 time
    ) external onlyProposalCreator onlyOperator {
        fundingEndTime = block.timestamp + time;
    }

    /** Getter Functions **/

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(_exists(tokenId), "TokenFestHolder: Non-Existent Asset");
        return baseURI;
    }

    function refundAmount(uint256 amount)public view  returns (uint256 refundValue) {
         refundValue  = amount / totalSupply();

    }
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721A) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
