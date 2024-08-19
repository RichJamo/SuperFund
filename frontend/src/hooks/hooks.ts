import { useReadContract, useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract, prepareEvent, prepareContractCall, PrepareContractCallOptions, PreparedTransaction } from "thirdweb";
import { optimism } from "thirdweb/chains";
import { DEFAULT_ACCOUNT_FACTORY } from "../constants/index";
import { stringToBytes32 } from "../utils/stringToBytes32";
import { sendTransaction } from "thirdweb";
import { Account } from "thirdweb/wallets";
import { USDC_CONTRACT_ADDRESS } from "../constants/index";
import { balanceOf, getBalance } from "thirdweb/extensions/erc20";

const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID as string;

const client = createThirdwebClient({
  clientId: clientId
});


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

export function getUSDCBalance(userMap: { [key: string]: string }) {
  // This can be further adjusted to accommodate individual calls for each user
  const contract = getContract({
    client,
    chain: optimism,
    address: USDC_CONTRACT_ADDRESS
  });
  const walletAddress = Object.values(userMap)[2];
  console.log("walletAddress", walletAddress);
  const { data, isLoading, error, isError } = useReadContract(balanceOf, { contract, address: walletAddress });

  console.log("data", data);
  if (isError) {
    console.error("Error fetching balance:", error);
  }
  const formattedData: bigint | null = data ? BigInt(data as bigint) : null;
  return { data: formattedData, isLoading };
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


export  const  useCreateAccount  = (contract: any, activeAccount: Account)  => {
  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const createAccount = (username: string) => {
    if (!activeAccount) throw new Error("Wallet not initialized");
    console.log(username)
    console.log(activeAccount.address)
    console.log(contract)
    const createAccountTx: PreparedTransaction = prepareContractCall({
      contract,
      method: "function createAccount(address _admin, bytes calldata _data)",
      params: [activeAccount.address, stringToBytes32(username)]
    });

    sendTx(createAccountTx);
  };

  return { createAccount, transactionResult };
};