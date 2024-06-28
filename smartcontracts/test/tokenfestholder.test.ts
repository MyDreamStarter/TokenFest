import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { TokenFestHolder , MyToken , AccessMaster} from "../typechain-types"
import exp from "constants"
import { Address } from "cluster"
import { Console } from "console"

    describe("DreamStarter Holder,Without Staking", () => {
                                        
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner,creator, creator2, buyer, operator] = await ethers.getSigners()
            
        })

        let accessmaster : AccessMaster
        let dreamstarter: TokenFestHolder
        let token : MyToken

        const proposalDetails = [
            "10000000000000000000",
            600,
            1200,
            "1000000000000000000"
        ]

        let Addr;

    
        before(async () => {

            const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
            accessmaster = await AccessMasterFactory.deploy()

            const TokenFactory = await ethers.getContractFactory("MyToken")
            token = await TokenFactory.deploy()

            Addr = [token.address,accessmaster.address]

            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestHolder")
            dreamstarter = await DreamStarterFactory.deploy(owner.address , "My Event","EVE",proposalDetails,20,"www.xyz",Addr)
        })

        describe("Without Staking ",async () =>{
            it("Should return the right info of the token",async () =>{
                expect(await dreamstarter.crowdFundingGoal()).to.equal(proposalDetails[0])
                expect(await dreamstarter.salePrice()).to.equal(proposalDetails[3])
                expect(await dreamstarter.pause()).to.true

            })
            it("Set Time By Proposal Creator and Stake",async() =>{
                /// Testing set Funding End is changing or not
                let prev  = await dreamstarter.fundingActiveTime()
                await dreamstarter.setFundingStartTime(1200)
                expect(await dreamstarter.fundingActiveTime()).to.not.equal(prev)
            
                /// Testing setFunding End time is changing or not
                let prevEnd =  await dreamstarter.fundingEndTime()
                await dreamstarter.setFundingEndTime(2400)

                expect(await dreamstarter.fundingEndTime()).to.not.equal(prevEnd)

                await dreamstarter.setFundingStartTime(0)
                /// start time
                expect(dreamstarter.setFundingStartTime(10)).to.be.revertedWith("DreamStarterCollab: Funding has been intiated , action cannot be performed")
                /// end time
                expect(dreamstarter.setFundingEndTime(10)).to.be.revertedWith("DreamStarterCollab: Funding has been intiated , action cannot be performed")

                // Stake and mintTicket
                expect(dreamstarter.mintTicket(1)).to.be.revertedWith("DreamStarterCollab__ProposalRejected()");
             
                expect(dreamstarter.mintTicket(1)).to.be.revertedWith("DreamStarterCollab: Proposal is being rejected")

                // expect(await dreamstarter.isProposalRejected()).to.be.true

            })
        })
    })

    describe("DreamStarter Holder ,With Staking Without Crowfunding Goal Reached", () => {
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
            
        })
        let accessmaster : AccessMaster
        let dreamstarter: TokenFestHolder
        let token : MyToken

        const proposalDetails = [
            "10000000000000000000",
            600,
            1200,
            "1000000000000000000"
        ]

        let Addr;

        let mintAmount = "100000000000000000000"
    
        before(async () => {

            const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
            accessmaster = await AccessMasterFactory.deploy()

            const TokenFactory = await ethers.getContractFactory("MyToken")
            token = await TokenFactory.deploy()

            Addr = [token.address,accessmaster.address]
            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestHolder")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,20,"www.xyz",Addr)

            await token.mint(mintAmount)
            await token.connect(creator).mint(mintAmount)
            await token.connect(buyer).mint(mintAmount)
        })
        it("stake",async() =>{
                let dreamstarterCreator = dreamstarter.connect(creator)
                let val = await dreamstarter.crowdFundingGoal()
                val = (val.mul(20)).div(100)
                await token.connect(creator).approve(dreamstarter.address,val)
                expect(dreamstarter.stake(val)).to.be.reverted
                await dreamstarterCreator.stake(val)
                expect(await dreamstarter.isCreatorStaked()).to.be.true;
        })
        it("mint Ticket",async() =>{
                let dreamstarterCreator = dreamstarter.connect(creator)
                let dreamstarterBuyer = dreamstarter.connect(buyer)
                /// Forwarding the time
                await network.provider.send("hardhat_mine", ["0x400"]);
                let val = await dreamstarter.salePrice()
                // for buyer
                await token.connect(buyer).approve(dreamstarter.address,val)
                /// for owner
                await token.approve(dreamstarter.address,val)
                await dreamstarterBuyer.mintTicket(1)
                /// for owner
                await dreamstarter.mintTicket(1)
                expect(await dreamstarter.balanceOf(buyer.address)).to.be.equal(1)
                expect(await dreamstarter.ownerOf(1)).to.be.equal(buyer.address)
        
        })
        it("Intiate Proposal rejection",async() => {
            await network.provider.send("hardhat_mine", ["0x100"]);
            expect(dreamstarter.claimback()).to.be.reverted
            expect(dreamstarter.claimback()).to.be.revertedWith("DreamStarterCollab_ClaimedNotPossible()")
            expect(dreamstarter.mintTicket(1)).to.be.revertedWith("DreamStarterCollab: Funding time has been passed")
            /// If intiate rejection working or not
            await dreamstarter.connect(buyer).intiateRejection()
            expect(await dreamstarter.isProposalRejected()).to.be.true
            expect(await dreamstarter.isProposalCleared()).to.be.true
        })  
        it("claimback",async () =>{
            let amount =  await dreamstarter.salePrice()
            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback()
            let afterBalance = await token.balanceOf(buyer.address)
            let diff = afterBalance.sub(prevBalance)
            /// previous balance of Buyer have the difference with  After balance exactly the Price Per NFT  multiply quantity
            expect(diff).to.be.equal(amount)
            ///To check if the FUnding can be intiated by proposal creator even after Proposal rejected
            expect(dreamstarter.connect(creator).intiateProposalFunding()).to.be.reverted
        })
        it("Unstake", async() =>{
            let amount = await dreamstarter.crowdFundingGoal()
            amount = (amount.mul(20)).div(100)
            let prevBalance =  await token.balanceOf(creator.address)
            await dreamstarter.connect(creator).unStake()
            let afterBalance = await token.balanceOf(creator.address)
            let diff = afterBalance.sub(prevBalance)
            /// previous balance of Buyer have the difference with  After balance exactly the Price Per NFT  multiply quantity
            expect(diff).to.be.equal(amount)
            expect(dreamstarter.connect(creator).unStake()).to.be.revertedWith
        })

    })

    describe("DreamStarter Holder ,With Staking With CrowFunding Goal Reaches", () => {
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner,creator, creator2, buyer,operator] = await ethers.getSigners()    
        })
        let accessmaster : AccessMaster
        let dreamstarter: TokenFestHolder
        let token : MyToken

        const proposalDetails = [
            "10000000000000000000",
            600,
            1200,
            "1000000000000000000"
        ]

        let Addr;
        let mintAmount = "100000000000000000000"
        let withdrawAmount =  "500000000000000000"
    
        before(async () => {

            const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
            accessmaster = await AccessMasterFactory.deploy()

            const TokenFactory = await ethers.getContractFactory("MyToken")
            token = await TokenFactory.deploy()

            Addr = [token.address,accessmaster.address]

            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestHolder")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,20,"www.xyz",Addr)
            
            /// MINT ERC20 TOkens
            await token.mint(mintAmount)
            await token.connect(creator).mint(mintAmount)
            await token.connect(buyer).mint(mintAmount)

            /// STAKE
            let dreamstarterCreator = dreamstarter.connect(creator)
            let val = await dreamstarter.crowdFundingGoal()
            val = (val.mul(20)).div(100)
            await token.connect(creator).approve(dreamstarter.address,val)
            await dreamstarterCreator.stake(val)
        })
        it("To check if Funding Goal Reached, Minting cannot be done",async()=>{
            await network.provider.send("hardhat_mine", ["0x400"]);
            let val = await dreamstarter.salePrice()
            val = val.mul(8)
            /// Buyer will mint 8 tokens
            await token.connect(buyer).approve(dreamstarter.address,val)
            await dreamstarter.connect(buyer).mintTicket(8)
            /// Owner will buy 2 more tokens
            await token.approve(dreamstarter.address,val)
            await dreamstarter.mintTicket(2)
            /// To check if the funds collected  is equal to Crowd Fund Goal
            let fundsInReserve = await dreamstarter.fundsInReserve()
            expect(await dreamstarter.crowdFundingGoal()).to.be.equal(fundsInReserve)
            //// To check if they can buy more than  Max Supply 
            expect(dreamstarter.mintTicket(1)).to.be.reverted
            /// Rejection when funding has been reached 
            expect(dreamstarter.intiateRejection()).to.be.reverted;
        })
        it("Intiate Funding",async() =>{
            /// to check onlyProposalCreator()
            expect(dreamstarter.withdrawFunds(creator.address,withdrawAmount)).to.be.reverted
            /// to check onlyWhenNotPaused()
            expect(dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)).to.be.reverted
            /// Intiate Funding
            await dreamstarter.connect(creator).intiateProposalFunding()
            expect(await dreamstarter.pause()).to.be.false
        })
        it("withdraw funds by creator and submit milestone",async() => {
            let prevBalance =  await token.balanceOf(creator.address)
            await dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount) 
            let afterBalance = await token.balanceOf(creator.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(withdrawAmount)
            expect(await dreamstarter.pause()).to.be.true
            expect(await dreamstarter.numberOfMileStones()).to.be.equal(1)
            /// Milestone Submition
            let milestone = "www.xyz.com"
            await dreamstarter.connect(creator).submitMileStoneInfo(milestone)
            let a = await dreamstarter.mileStone(0)
            expect(a).to.be.equal(milestone)
        })  
        it("Claimback when Proposal is  rejected and if stake can be withdrawn",async () => {
            /// To check if the unpause is working or not
            await dreamstarter.validate(true,false)
            expect(await dreamstarter.pause()).to.be.false
            /// To check if the pause is working or not
            await dreamstarter.validate(false,false)
            expect(await dreamstarter.pause()).to.be.true
            //// To check if Proposal is rejected is rejected or not
            await dreamstarter.validate(false,true)
            expect(await dreamstarter.isProposalRejected()).to.be.true
            //// TO check if after 1 withdrawal will the users get claimback,and will it work properly
            const numberOfNFTs = await dreamstarter.balanceOf(buyer.address)
            let val = await dreamstarter.stakingAmount()
            let fundsInReserve = await dreamstarter.fundsInReserve()
            let refundValue =  val.add(fundsInReserve)
            let amount  = await dreamstarter.refundAmount(refundValue)
            amount = amount.mul(numberOfNFTs)
            // to check the balance difference of user
            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback()
            let afterBalance = await token.balanceOf(buyer.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(amount)
        })
    })
    describe("DreamStarter Holder ,Validation & Yield Submission", () => {
        let [owner, creator, creator2, buyer, buyer2 ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner,creator, creator2, buyer,buyer2] = await ethers.getSigners()    
        })
        let accessmaster : AccessMaster
        let dreamstarter: TokenFestHolder
        let token : MyToken

        const proposalDetails = [
            "10000000000000000000",
            600,
            1200,
            "1000000000000000000"
        ]
        let Addr;
        let mintAmount = "100000000000000000000"
        before(async () => {
            const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
            accessmaster = await AccessMasterFactory.deploy()
            const TokenFactory = await ethers.getContractFactory("MyToken")

            token = await TokenFactory.deploy()
            Addr = [token.address,accessmaster.address]
            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestHolder")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,20,"www.xyz",Addr)
            /// MINT ERC20 TOkens
            await token.mint(mintAmount)
            await token.connect(creator).mint(mintAmount)
            await token.connect(buyer).mint(mintAmount)
            await token.connect(buyer2).mint(mintAmount)
            /// STAKE
            let dreamstarterCreator = dreamstarter.connect(creator)
            let val = await dreamstarter.crowdFundingGoal()
            val = (val.mul(20)).div(100)
            await token.connect(creator).approve(dreamstarter.address,val)
            await dreamstarterCreator.stake(val)
        })
        it("Validation",async()=>{
            await network.provider.send("hardhat_mine", ["0x400"]);
            let val = await dreamstarter.salePrice()
            val = val.mul(8)
            /// Buyer will mint 8 tokens
            await token.connect(buyer).approve(dreamstarter.address,val)
            await dreamstarter.connect(buyer).mintTicket(8)
            /// Buyer2 will buy 2 more tokens
            await token.connect(buyer2).approve(dreamstarter.address,val)
            await dreamstarter.connect(buyer2).mintTicket(2)
            /// Intiate Funding
            await dreamstarter.connect(creator).intiateProposalFunding()
            let withdrawAmount = await dreamstarter.stakingAmount();
            /// Withdraw first round
            await dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)
            for (let i = 0; i < 3; i++) {
                expect(await dreamstarter.validate(true,false)).to.emit(dreamstarter,"Validate").withArgs(true,false,false)
                await dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)
            }
            expect(await dreamstarter.numberOfMileStones()).to.be.equal(4)
            /// TO check if somehow unpause can the event organisor take more than funds in Reserve
            await dreamstarter.validate(true,false)
            await dreamstarter.connect(creator).withdrawFunds(creator.address,"1000000000000000000")
            await dreamstarter.validate(true,false)
            expect(dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)).to.be.revertedWith("DreamStarterCollab: Process cannot proceed , more than reserve fund")
            await dreamstarter.connect(creator).withdrawFunds(creator.address,"1000000000000000000")
            await dreamstarter.validate(true,false)
            await dreamstarter.unpauseOrPauseByOperator(false)
            expect(dreamstarter.connect(creator).withdrawFunds(creator.address,"1000000000000000000")).to.be.reverted
        })
        it("Claimback && Yield Submission",async() =>{
            expect(dreamstarter.connect(creator).unStake()).to.be.revertedWith("TokenFestHolder: User cannot withdraw funds")
            let value = await dreamstarter.yeildToBeRecieved()

            await token.connect(creator).approve(dreamstarter.address,value)
            
            expect(await dreamstarter.connect(creator).yieldSubmission()).to.emit(dreamstarter,"YieldSubitted").withArgs(true,value)

            //// CLAIMBACK AFTER YIELD IS SUBMITTED
            const numberOfNFTs = await dreamstarter.balanceOf(buyer.address)
            let val = await dreamstarter.totalSupply()
            let refundValue =  value.div(val)
            let amount  = refundValue.mul(numberOfNFTs)
            // to check the balance difference of user
            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback()
            let afterBalance = await token.balanceOf(buyer.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(amount)
            /// UNSTAKE
            let amount1  = await dreamstarter.stakingAmount()
            let prevBalance1 =  await token.balanceOf(creator.address)
            await dreamstarter.connect(creator).unStake()
            let afterBalance1 = await token.balanceOf(creator.address)
            let diff1 = afterBalance1.sub(prevBalance1)
            expect(diff1).to.be.equal(amount1)
        })
    })
     describe("DreamStarter Holder ,Yield Submission When Yiled Fund not sufficient", () => {
        let [owner, creator, creator2, buyer, buyer2 ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner,creator, creator2, buyer,buyer2] = await ethers.getSigners()    
        })
        let accessmaster : AccessMaster
        let dreamstarter: TokenFestHolder
        let token : MyToken

        const proposalDetails = [
            "10000000000000000000",
            600,
            1200,
            "1000000000000000000"
        ]
        let Addr;
        let mintAmount = "100000000000000000000"
        before(async () => {
            const AccessMasterFactory = await ethers.getContractFactory("AccessMaster")
            accessmaster = await AccessMasterFactory.deploy()
            const TokenFactory = await ethers.getContractFactory("MyToken")

            token = await TokenFactory.deploy()
            Addr = [token.address,accessmaster.address]
            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestHolder")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,20,"www.xyz",Addr)


            let dreamstarterCreator = dreamstarter.connect(creator)
            let val = await dreamstarter.crowdFundingGoal()
            val = (val.mul(20)).div(100)
            /// MINT ERC20 TOkens
            await token.mint(mintAmount)
            await token.connect(creator).mint(val)
            await token.connect(buyer).mint(mintAmount)
            /// STAKE
            await token.connect(creator).approve(dreamstarter.address,val)
            await dreamstarterCreator.stake(val)
        })
        it("Claimback if Event Organisor don't have yield fund",async()=>{
             await network.provider.send("hardhat_mine", ["0x400"]);
            let val = await dreamstarter.salePrice()
            val = val.mul(8)
            /// Buyer will mint 8 tokens
            await token.connect(buyer).approve(dreamstarter.address,val)
            await dreamstarter.connect(buyer).mintTicket(8)
            /// Buyer2 will buy 2 more tokens
            await token.approve(dreamstarter.address,val)
            await dreamstarter.mintTicket(2)
      
            await dreamstarter.connect(creator).intiateProposalFunding()
            let withdrawAmount = await dreamstarter.stakingAmount();
            await dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)
            /// Withdraw first round
            for (let i = 0; i < 4; i++) {
                expect(await dreamstarter.validate(true,false)).to.emit(dreamstarter,"Validate").withArgs(true,false,false)
                await dreamstarter.connect(creator).withdrawFunds(creator.address,withdrawAmount)
            }
            expect(await dreamstarter.numberOfMileStones()).to.be.equal(5)
            expect(await dreamstarter.fundsInReserve()).to.be.equal(0)

            let fundToRecieve = await dreamstarter.yeildToBeRecieved()
            await token.connect(creator).approve(dreamstarter.address,fundToRecieve)
            await dreamstarter.connect(creator).yieldSubmission()


            //// CLAIMBACK AFTER YIELD IS SUBMITTED
            const numberOfNFTs = await dreamstarter.balanceOf(buyer.address)
            let supply = await dreamstarter.totalSupply()
            let refundValue =  fundToRecieve.div(supply)
            let amountToClaim  = refundValue.mul(numberOfNFTs)
            // to check the balance difference of user
            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback()
            let afterBalance = await token.balanceOf(buyer.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(amountToClaim)
            
            await dreamstarter.validate(true,false)

            expect(dreamstarter.connect(creator).unStake()).to.be.revertedWith("TokenFestHolder: Not Enough Staking Funds")

        })
       
    })

