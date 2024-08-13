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
