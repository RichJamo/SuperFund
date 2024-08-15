// utils.ts
import { readContract } from "thirdweb";
import { PERMIT2_CONTRACT_ADDRESS, SUPERFORM_ROUTER_ADDRESS, USDC_CONTRACT_ADDRESS } from "../constants";
import { PermitSingle, Domain } from "../types/types";
import { signTypedData } from "thirdweb/utils";
import { getContract} from "thirdweb";
import { client } from "./client"; 
import { optimism } from "thirdweb/chains";

export const formatTotalAssets = (totalAssets: string, decimals: number): string => {
  const value = Number(totalAssets) / Math.pow(10, decimals);
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export const handleEventLog = (
  eventLog: any,
  transactionResult: any,
  prevTransactionRef: React.MutableRefObject<any>,
  onAddUser: (username: string, walletAddress: string) => void,
  onRequestClose: () => void,
  username: string
) => {
  if (transactionResult && transactionResult !== prevTransactionRef.current) {
    prevTransactionRef.current = transactionResult;
    if (eventLog && eventLog.length > 0) {
      const latestEvent = eventLog[eventLog.length - 1];
      if (latestEvent && latestEvent.topics[1]) {
        onAddUser(username, formatAddress(latestEvent.topics[1]));
        onRequestClose();
      }
    }
  }
};

export function formatAddress(rawAddress: string): string {
  // Ensure the address starts with '0x'
  if (!rawAddress.startsWith("0x")) {
    rawAddress = "0x" + rawAddress;
  }

  // Remove leading zeros from the address
  const formattedAddress = "0x" + rawAddress.slice(-40);

  return formattedAddress;
}

export async function getNextNonce(userAddress: string): Promise<number> {
  const contract = getContract({
    client,
    chain: optimism,
    address: PERMIT2_CONTRACT_ADDRESS
  });
  console.log("got here 3");

  // Assuming readContract returns a tuple [bigint, number, number]
  const [allowance, expiration, nonce] = await readContract({
    contract: contract,
    method: 'function allowance(address owner, address token, address spender) view returns (uint160 amount, uint48 expiration, uint48 nonce)',
    params: [userAddress, USDC_CONTRACT_ADDRESS, SUPERFORM_ROUTER_ADDRESS],
  });

  let next_nonce = Number(nonce) + 1;

  return next_nonce;
}

export async function signPermitData(permitSingle: PermitSingle, chainId): Promise<string> {
  const domain: Domain = {
    name: 'Permit2',
    version: '1',
    chainId: chainId,
    verifyingContract: PERMIT2_CONTRACT_ADDRESS,
  };

  const types = {
    PermitSingle: [
      { name: 'details', type: 'PermitDetails' },
      { name: 'spender', type: 'address' },
      { name: 'sigDeadline', type: 'uint256' },
    ],
    PermitDetails: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiration', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const value = {
    details: permitSingle.details,
    spender: permitSingle.spender,
    sigDeadline: permitSingle.sigDeadline,
  };

  const signature = signTypedData(domain, types, value);
  return signature;
}