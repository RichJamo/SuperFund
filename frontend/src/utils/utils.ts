import { ParseEventLogsResult } from "thirdweb";
import { TransactionResult } from "../types/types"

export const formatTotalAssets = (totalAssets: string, decimals: number): string => {
  const value = Number(totalAssets) // / Math.pow(10, decimals); - don't need to divide by decimals since the subgraph gives a dollar amount
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export const getWalletAddressOnceCreated = (
  eventLog: ParseEventLogsResult<any, boolean> | undefined,
  transactionResult: TransactionResult | undefined,
  updatePrevTransaction: (transaction: TransactionResult | null) => void
): string | null => {
  if (transactionResult) {
    // Call the callback to update the previous transaction
    updatePrevTransaction(transactionResult);
    
    if (eventLog && eventLog.length > 0) {
      const latestEvent = eventLog[eventLog.length - 1];
      if (latestEvent && latestEvent.topics[1]) {
        return formatAddress(latestEvent.topics[1]);
      }
    }
  }
  return null;
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
