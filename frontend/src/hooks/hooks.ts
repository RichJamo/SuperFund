import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { optimism } from "thirdweb/chains";
import { createThirdwebClient } from "thirdweb";

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
