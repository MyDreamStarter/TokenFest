# Token Fest Function Docs

## TokenFest Collab Contract
The TokenFest Collab Contract facilitates crowdfunding for projects and uses ERC721 NFTs for ticket sales and participation. There are 11 key functions within this contract to be interacted by Frontend:

1. `setFundingStartTime()`
    - *Description*: This function allows the proposal creator to change the funding start time, but only when funding hasn't started.

2. `setFundingEndTime()`
    - *Description*: The proposal creator can use this function to change the funding end time, but only when funding hasn't started.

3. `submitMileStoneInfo()`
    - *Description*: Submit milestones as IPFS hashes, providing transparency and documentation of project progress.

4. `initiateProposalFunding()`
    - *Description*: This function can be called only once for the initialization of first milestone funding and is exclusively available to the creator.

5. `initiateRejection()`
    - *Description*: Users can utilize this function to reject the proposal and reclaim their contributions if the crowdfunding campaign doesn't finish within the allotted period. This function is accessible to everyone.

6. `stake()`
    - *Description*: Users are required to stake 20% of the funding goal as a security deposit. If the user doesn't stake, the funding process will not start and will be automatically rejected.

7. `mintTicket()`
    - *Description*: This function allows users to purchase NFTs and mint them. It becomes active when the fundingActiveTime is reached and ends when fundingEndTime is reached. Crowdfunding will only proceed until the funding goal is reached, even before fundingEndTime.

8. `withdrawFunds()`
    - *Description*: Only the proposal creator can withdraw the funds collected through this function, provided that the contract is unpaused.

9. `validate()`
    - *Description*: This function is used to unpause, reject, or mark a proposal as cleared or not.

10. `claimback()`
    - *Description*: Users can claim back their deposited amounts if either the funding goal is not reached or the proposal is rejected.

11. `unstake()`
    - *Description*: If everything is cleared for the proposal creator, users can unstake their funds.

## TokenFest Holder Contract
The TokenFest Holder Contract is similar to the TokenFest Collab Contract with four key differences:

1. Constructor - It accepts yield returns from participants.

2. `mintTicket`
    - *Description*: Users can mint as many NFTs as they want until the funding goal is reached.

3. `claimback`
    - *Description*: There are three conditions for claiming back funds.

4. `yieldSubmission()`
    - *Description*: This function allows users to submit profits.

This Crowdfunding Smart Contract, powered by ERC721 NFTs and ERC721A NFTs, provides a robust platform for crowdfunding, transparency, and security for both project creators and participants. It enables project creators to fundraise effectively and participants to engage with NFTs and profit-sharing.

