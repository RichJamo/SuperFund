// utils.ts
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
