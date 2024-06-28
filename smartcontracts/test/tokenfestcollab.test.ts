import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect , assert } from "chai"
import { ethers , network} from "hardhat"
import { TokenFestCollab , MyToken , AccessMaster} from "../typechain-types"
import exp from "constants"
import { Address } from "cluster"

    describe("DreamStarter Collab,Without Staking", () => {
                                        
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner,creator, creator2, buyer, operator] = await ethers.getSigners()
            
        })

        let accessmaster : AccessMaster
        let dreamstarter: TokenFestCollab
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

            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestCollab")
            dreamstarter = await DreamStarterFactory.deploy(owner.address , "My Event","EVE",proposalDetails,"www.xyz",Addr)
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
                expect(dreamstarter.setFundingStartTime(10)).to.be.revertedWith("TokenFestCollab: Funding has been intiated , action cannot be performed")
                /// end time
                expect(dreamstarter.setFundingEndTime(10)).to.be.revertedWith("TokenFestCollab: Funding has been intiated , action cannot be performed")

                // Stake and mintTicket
                expect(dreamstarter.mintTicket()).to.be.revertedWith("TokenFestCollab__ProposalRejected()");
             
                expect(dreamstarter.mintTicket()).to.be.revertedWith("TokenFestCollab: Proposal is being rejected")

                // expect(await dreamstarter.isProposalRejected()).to.be.true

            })
        })
    })

    describe("DreamStarter Collab ,WithStaking Without Crowfunding Goal Reached", () => {
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
            
        })

        let accessmaster : AccessMaster
        let dreamstarter: TokenFestCollab
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

            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestCollab")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,"www.xyz",Addr)
            
        

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

                await network.provider.send("hardhat_mine", ["0x400"]);

                let val = await dreamstarter.salePrice()
                // for buyer
                await token.connect(buyer).approve(dreamstarter.address,val)
                /// for owner
                await token.approve(dreamstarter.address,val)
                 
                await dreamstarterBuyer.mintTicket()
                /// for owner
                await dreamstarter.mintTicket()

                expect(await dreamstarter.balanceOf(buyer.address)).to.be.equal(1)
                expect(await dreamstarter.ownerOf(1)).to.be.equal(buyer.address)
        
        })
        it("Intiate Proposal rejection",async() => {
            await network.provider.send("hardhat_mine", ["0x100"]);
            expect(dreamstarter.claimback(1)).to.be.reverted
            expect(dreamstarter.claimback(2)).to.be.revertedWith("TokenFestCollab_ClaimedNotPossible()")
            expect(dreamstarter.mintTicket()).to.be.revertedWith("TokenFestCollabd: Funding time has been passed")

            await dreamstarter.connect(buyer).intiateRejection()

            expect(await dreamstarter.isProposalRejected()).to.be.true
            expect(await dreamstarter.isProposalCleared()).to.be.true

        })  
        it("claimback",async () =>{
            let amount =  await dreamstarter.salePrice()
            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback(1)
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

    describe("DreamStarter Collab ,WithStaking with CrowFunding Goal Reaches", () => {
        let [owner, creator, creator2, buyer, operator ]: SignerWithAddress[] = new Array(5)
        before(async () => {
            [owner, operator, creator, creator2, buyer] = await ethers.getSigners()
            
        })

        let accessmaster : AccessMaster
        let dreamstarter: TokenFestCollab
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

            let  DreamStarterFactory = await ethers.getContractFactory("TokenFestCollab")
            dreamstarter = await DreamStarterFactory.deploy(creator.address , "My Event","EVE",proposalDetails,"www.xyz",Addr)
            
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
        it("Funding Goal Reached",async()=>{
            const accounts = await ethers.getSigners()

            await network.provider.send("hardhat_mine", ["0x400"]);
            let val = await dreamstarter.salePrice()
            for (let i = 3; i < 13; i++) {
                await token.connect(accounts[i]).mint(mintAmount)
                await token.connect(accounts[i]).approve(dreamstarter.address,val)
                await dreamstarter.connect(accounts[i]).mintTicket()
            }
            let fundsInReserve = await dreamstarter.fundsInReserve()
            expect(await dreamstarter.crowdFundingGoal()).to.be.equal(fundsInReserve)
            console.log(`total supply ${await dreamstarter.totalSupply()}`)
            await token.connect(buyer).approve(dreamstarter.address,val)
            expect(dreamstarter.mintTicket()).to.be.reverted

            /// Rejection when funding has been reached 
            expect(dreamstarter.intiateRejection()).to.be.reverted;

            expect(await dreamstarter.isProposalRejected()).to.be.false
            expect(await dreamstarter.isProposalCleared()).to.be.false

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
        it("Claimback when Proposal is  rejected and staked is taken",async () => {
            await dreamstarter.validate(true,false)
            expect(await dreamstarter.pause()).to.be.false
            await dreamstarter.validate(false,false)
            expect(await dreamstarter.pause()).to.be.true

            await dreamstarter.validate(false,true)
            expect(await dreamstarter.isProposalRejected()).to.be.true

            let val = await dreamstarter.crowdFundingGoal()
            val = (val.mul(20)).div(100)
            let fundsInReserve = await dreamstarter.fundsInReserve()
            let refundValue =  val.add(fundsInReserve)

            let amount  = await dreamstarter.refundAmount(refundValue)

            let prevBalance =  await token.balanceOf(buyer.address)
            await dreamstarter.connect(buyer).claimback(2)
            let afterBalance = await token.balanceOf(buyer.address)
            let diff = afterBalance.sub(prevBalance)
            expect(diff).to.be.equal(amount)
            ///Once claimed Back cannot be refunded 
            expect(dreamstarter.connect(buyer).claimback(2)).to.be.reverted
        })
        
    })

