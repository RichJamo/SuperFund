// actions.ts
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const AAVE_USDC_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

export const handleApprove = async (depositAmount: string) => {
  const { mutate: sendTx } = useSendTransaction();

  try {
    const contract = getContract({
      client,
      chain: optimism,
      address: USDC_CONTRACT_ADDRESS,
    });

    const approveTx = prepareContractCall({
      contract,
      method: "function approve(address to, uint256 value)",
      params: [AAVE_USDC_POOL_ADDRESS, BigInt(depositAmount)],
    });

    sendTx(approveTx);
  } catch (error) {
    console.error("Error approving:", error);
    throw error;
  }
};

export const handleWithdraw = async (vaultId: string) => {
  try {
    const signer = await getSigner();
    await withdrawFromVault(vaultId, "1.0", signer);
  } catch (error) {
    console.error("Error withdrawing:", error);
    throw error;
  }
};
