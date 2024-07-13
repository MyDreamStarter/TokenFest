import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikProps } from "formik";
import Button from "@/components/common/Button";
import { Select, DatePicker } from "antd";
import * as Yup from "yup";
import { useProposal } from "@/ContextProviders/ProposalProvider";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from 'react';
import { createPublicClient, http, Hex } from 'viem';
import { baseSepolia} from 'viem/chains';
import { useAccount, useChainId, useWalletClient } from 'wagmi';
import axios from 'axios';
import nero from '@/components/launch/nero.json'
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

interface FormMessage {
  title: string;
  description: string;
  priceperNFT: number;
  funding_goal: number;
  stable_coin_option: string;
  starting_date: string;
  ending_date: string;
}

const ConvertModal = () => {
  const { proposal } = useProposal();

  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isDeployed, setIsDeployed] = useState(false);

  const initialValues: FormMessage = proposal
    ? {
        title: proposal.title,
        description: proposal.description,
        priceperNFT: proposal.priceperNFT,
        funding_goal: proposal.funding_goal,
        stable_coin_option: "USDC",
        starting_date: "",
        ending_date: "",
      }
    : {
        title: "",
        description: "",
        priceperNFT: 0,
        funding_goal: 0,
        stable_coin_option: "",
        starting_date: "",
        ending_date: "",
      };

  const validationSchema = Yup.object().shape({
    stable_coin_option: Yup.string().required("Required"),
    starting_date: Yup.string().required("Required"),
    ending_date: Yup.string().required("Required"),
  });

  async function verifyContract(
    contractAddress: string,
    contractSourceCode: string,
    contractName: string,
    compilerVersion: string,
    constructorArguments: string,
    licenseType: string
  ) {
    const apiKey = "I4P2814JMQ4JEFNQQR6DCGIVUEW4DMVTIW";

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('module', 'contract');
    params.append('action', 'verifysourcecode');
    params.append('contractaddress', contractAddress);
    params.append('sourceCode', contractSourceCode);
    params.append('codeformat', 'solidity-single-file');
    params.append('contractname', contractName);
    params.append('compilerversion', compilerVersion);
    params.append('optimizationUsed', '0'); // Change to '1' if optimization was used
    params.append('runs', '200'); // Change to the number of runs if optimization was used
    params.append('constructorArguments', constructorArguments);
    params.append('licenseType', licenseType);

    try {
      const response = await axios.post('https://api-amoy.baseSepoliascan.com/api', params.toString());
      console.log(apiKey);
      console.log(contractAddress);
      console.log(contractSourceCode);
      console.log(contractName);
      console.log(compilerVersion);
      if (response.data.status === '1') {
        console.log('Contract verified successfully');
        console.log('Verification response:', response);
        console.log('Verification Guid:', response.data.result);
      } else {
        console.log('Failed to verify contract:', response.data.result);
      }
    } catch (error) {
      console.error('Error verifying contract:', error);
    }
  }

  async function deploy721A() {
    if (!walletClient) {
      throw new Error('Wallet client is not available');
    }

    const hash = await walletClient.deployContract({
      abi: nero.abi,
      bytecode: nero.bytecode as Hex,
      account: userAddress,
    });

    if (!hash) {
      throw new Error('Failed to execute deploy contract transaction');
    }
    console.log("hash", hash)
    const txn = await publicClient.waitForTransactionReceipt({ hash });
    console.log('transaction result is', txn, txn.to);
    setTokenAddress(txn.contractAddress as `0x${string}`);
    setIsDeployed(true);

    return txn.contractAddress;
  }

  const handleDeploy = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      const contractAddress = await deploy721A();
      console.log('Contract deployed at:', contractAddress);
      if (!contractAddress) {
        setError('No contract address found to verify.');
        return;
      }
      const contractSourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenFest {
    // Private state variable to store a number
    uint256 private number;

    // Setter function to set the value of the number
    function setNumber(uint256 _number) public {
        number = _number;
    }

    // Getter function to get the value of the number
    function getNumber() public view returns (uint256) {
        return number;
    }
}`;
try {
  await verifyContract(
    contractAddress as string,
    contractSourceCode,
    'TokenFest', // Contract name
    'v0.8.26+commit.8a97fa7a', 
    '',
    'MIT'
  );
} catch (error) {
  setError('Error verifying contract: ' + error);
  console.error('Error verifying contract:', error);
}
    } catch (error) {
      setError('Error deploying contract: ' + error);
      console.error('Error deploying contract:', error);
    }
  };


  return (
    <div>
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          enqueueSnackbar(`Proposal Converted`, {
            variant: "success",
          });
          actions.setSubmitting(false);
        }}
      >
        {({
          values,
          isSubmitting,
          setFieldValue,
          errors,
        }: FormikProps<FormMessage>) => (
          <Form>
            <div className="">
              <div className="w-[500px]  text-sm  px-4 py-4 flex flex-col gap-4">
                <div className="text-lg font-medium ">{values.title}</div>
                <div>{values.description}</div>
                <div>Price Per NFT: {values.priceperNFT}</div>
                <div>
                  Funding Goal: {values.funding_goal}{" "}
                  {values.stable_coin_option}
                </div>
                <div>
                  <label htmlFor="stable_coin_option" className="block mb-2">
                    StableCoin for the funding :
                  </label>
                  <Select
                    aria-required
                    defaultValue={values.stable_coin_option}
                    className="w-full"
                    onChange={(e) => {
                      setFieldValue("stable_coin_option", e);
                    }}
                    options={[
                      { value: "USDT", label: "USDT" },
                      { value: "USDC", label: "USDC" },
                      { value: "USDC", label: "USDC" },
                    ]}
                  />
                </div>
                <div className="flex gap-6 items-center">
                  <div>
                    <label htmlFor="starting_date" className="block mb-2">
                      Starting Date
                    </label>
                    <DatePicker
                      onChange={(e) => {
                        setFieldValue("starting_date", e);
                      }}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      <ErrorMessage name="ending_date" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ending_date" className="block mb-2">
                      Ending Date
                    </label>
                    <DatePicker
                      onChange={(e) => {
                        setFieldValue("ending_date", e);
                      }}
                    />
                    <div className="text-red-500 text-xs mt-1">
                      <ErrorMessage name="ending_date" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-2">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    className="flex justify-center"
                    onClick={handleDeploy}
                    _isSubmitting={isSubmitting}
                    disabled={isSubmitting}
                    
                  >
                    Launch crowdfunding
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ConvertModal;
