const fs = require("fs")
const { ethers, run, network } = require("hardhat")

const scripts = `scripts/launch/launch.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)

let contractAddress
let blockNumber
let Verified = false

async function TokenFestHolderDeploy() {
    const constructorParam = jsonContent.constructorParams

    const TokenFestHolderFactory = await hre.ethers.getContractFactory("TokenFestHolder")
    const TokenFestHolder = await TokenFestHolderFactory.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6,
        constructorParam.param7
    )

    await TokenFestHolder.deployed()
    console.log("TokenFestHolder Deployed to: ", TokenFestHolder.address)

    contractAddress = TokenFestHolder.address
    blockNumber = TokenFestHolder.provider._maxInternalBlockNumber
    
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await TokenFestHolder.deployTransaction.wait(6)
        await verify(TokenFestHolder.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6,
            constructorParam.param7
        ])
    }
}

async function TokenFestCollabDeploy() {
    const constructorParam = jsonContent.constructorParams
    const TokenFestCollabFactory = await hre.ethers.getContractFactory("TokenFestCollab")
    const TokenFestCollab = await TokenFestCollabFactory.deploy(
        constructorParam.param1,
        constructorParam.param2,
        constructorParam.param3,
        constructorParam.param4,
        constructorParam.param5,
        constructorParam.param6
    )
    await TokenFestCollab.deployed()
    console.log("TokenFestCollab Deployed to:", TokenFestCollab.address)
    contractAddress = TokenFestCollab.address
    blockNumber = TokenFestCollab.provider._maxInternalBlockNumber
    /// VERIFY
    if (hre.network.name != "hardhat") {
        await TokenFestCollab.deployTransaction.wait(6)
        await verify(TokenFestCollab.address, [
            constructorParam.param1,
            constructorParam.param2,
            constructorParam.param3,
            constructorParam.param4,
            constructorParam.param5,
            constructorParam.param6
        ])
    }
}

async function Token() {
    const TokenFactory = await hre.ethers.getContractFactory("MyToken")
    const token = await TokenFactory.deploy()

    await token.deployed()

    console.log("Token Deployed to:", token.address)
    contractAddress = token.address
    blockNumber = token.provider._maxInternalBlockNumber

    /// VERIFY
    if (hre.network.name != "hardhat") {
        await token.deployTransaction.wait(6)
        await verify(token.address, [])
    }
}

async function main() {
    //TokenFestHolder
    if (jsonContent.contractName == "TokenFestHolder") {
        await TokenFestHolderDeploy()
    }
    /// TokenFestCollab CONTRACT
    if (jsonContent.contractName == "TokenFestCollab") {
        await TokenFestCollabDeploy()
    }

    /// ERC20 
    if (jsonContent.contractName == "Token") {
        await Token()
    }

    let chainId

    if (network.config.chainId != undefined) {
        chainId = network.config.chainId
    } else {
        chainId = network.config.networkId
    }

    console.log(`The chainId is ${chainId}`)
    const data = { chainId, contractAddress, Verified, blockNumber }
    const jsonString = JSON.stringify(data)
    // Log the JSON string
    console.log(jsonString)
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        Verified = true
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
