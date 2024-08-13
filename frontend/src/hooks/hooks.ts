import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareEvent, prepareContractCall } from "thirdweb";
import { optimism } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";
import { DEFAULT_ACCOUNT_FACTORY } from "../constants";
import { stringToBytes32 } from "../utils/stringToBytes32";

const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID as string;

const client = createThirdwebClient({
  clientId: clientId
});

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS,
  abi: [
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ type: "address", name: "account" }],
      outputs: [{ type: "uint256", name: "balance" }],
      stateMutability: "view"
    }
  ]
});

export function useContractBalance(userMap: { [key: string]: string }) {
  // This can be further adjusted to accommodate individual calls for each user
  const walletAddress = Object.values(userMap)[0];
  const { data, isLoading } = useReadContract({
    contract,
    method: "balanceOf",
    params: [walletAddress || ""],
    queryOptions: { enabled: !!walletAddress }
  });
  return { data, isLoading };
}

export const useContractSetup = () => {
  const contract = getContract({
    client,
    chain: optimism,
    address: DEFAULT_ACCOUNT_FACTORY
  });

  const myEvent = prepareEvent({
    signature:
      "event AccountCreated(address indexed account, address indexed accountAdmin)"
  });

  return { contract, myEvent };
};


export const useCreateAccount = (contract: any, activeAccount: any) => {
  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const createAccount = (username: string) => {
    if (!activeAccount) throw new Error("Wallet not initialized");

    const createAccountTx = prepareContractCall({
      contract,
      method: "function createAccount(address _admin, bytes calldata _data)",
      params: [activeAccount.address, stringToBytes32(username)]
    });

    sendTx(createAccountTx);
  };

  return { createAccount, transactionResult };
};