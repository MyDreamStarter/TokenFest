"use client"
import DashboardNav from '@/components/common/Nav/dashboardnav';
import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import MyTokenABI from "@/abi/MyToken.json";

const Page = () => {
    const [connectedNetwork, setConnectedNetwork] = useState<number | null>(null);
    const [contract, setContract] = useState<any>(null);
    const [claimed, setClaimed] = useState<boolean>(false);
    const [walletAddress, setWalletAddress] = useState<string>("");

    useEffect(() => {
        async function connectContract() {
            try {
                // Define the contract ABI
                const contractABI = MyTokenABI;

                // Define the contract address
                const contractAddress = "YOUR_CONTRACT_ADDRESS";

                // Setup a provider (Here, we're using a default provider for the Ethereum mainnet)
                const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY");

                // Connect to the contract
                const contract = new ethers.Contract(contractAddress, contractABI, provider);

                setContract(contract);
                console.log("Contract connected:", contract);
            } catch (error) {
                console.error("Failed to connect to the contract:", error);
            }
        }

        connectContract();
    }, []);

    useEffect(() => {
        async function getNetwork() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const network = await provider.getNetwork();
                setConnectedNetwork(network.chainId);
            } catch (error) {
                console.error("Error fetching network:", error);
            }
        }

        if (window.ethereum) {
            getNetwork();
        }
    }, []);

    const claimTokens = async () => {
        try {
            if (!contract) {
                console.error("Contract not initialized.");
                return;
            }

            await contract.grantRole(
                "YOUR_ROLE_IDENTIFIER",
                walletAddress
            );
            setClaimed(true);

            console.log("Role granted successfully.");
        } catch (error) {
            console.error("Error granting role:", error);
        }
    };

    return (
        <div>
            <DashboardNav />
            <div className='h-[630px]' style={{ background: "#BDE3F0" }}>
                <h1 className='p-6 text-black text-2xl mb-1 font-Raleway'>Your Poaps</h1>
                <div className='flex mx-8 gap-6 my-4'>
                    <div className='h-[400px] w-[350px] p-6 bg-amber-400'>
                        <div className='' style={{
                            backgroundImage: `url('/nft.png')`, backgroundSize: 'cover',
                            height: '260px',
                            width: '300px',
                        }}>
                        </div>
                        <h1 className='text-black font-raleway text-2xl font-semibold leading-normal capitalize py-4'>Your Game Collections</h1>
                        <div>
                            <button className='block mx-auto px-4 py-2 bg-blue-800 text-white rounded-lg mt-2' onClick={claimTokens} disabled={claimed}>
                                {claimed ? "Claimed" : "Claim"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
