import React, { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import { handleApproveAndDeposit, handleWithdrawal } from "../actions/actions";
import VaultsView from "../components/VaultsView";
import { Vault } from "../types/types";
import { VAULT_IDS } from "../constants/index";
import { Address, getContract, prepareContractCall } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { USDC_CONTRACT_ADDRESS } from "../constants";
import { AAVE_USDC_POOL_ADDRESS } from "../constants";
import { sendBatchTransaction } from "thirdweb";
import { smartWallet } from "thirdweb/wallets";
import { getBalance } from "thirdweb/extensions/erc20";

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS
});

const VaultsContainer = () => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

  const handleSuccess = (transactionResult: any) => {
    console.log("Transaction successful:", transactionResult);
    // Handle success logic here
  };

  const handleError = (error: Error) => {
    console.error("Transaction error:", error);
    // Handle error logic here
  };

  const account = useActiveAccount();

  const { data: usdcBalanceResult, isLoading, error } = useReadContract(
    getBalance,
    {
      contract,
      address: userMap[selectedUsername] || ""
    }
  );

  const usdcBalance = isLoading
    ? "Loading..."
    : error
    ? "Error"
    : usdcBalanceResult?.displayValue || "N/A";

  const handleDepositTransaction = async () => {
    try {
      console.log("Depositing to vault...");
      setDepositAmount;
      console.log(depositAmount);
      const result = await handleApproveAndDeposit(
        account,
        depositAmount,
        userMap[selectedUsername] as Address
      );
      console.log(result);
      return result;
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  const handleWithdrawTransaction = async () => {
    try {
      console.log("Withdrawing from vault...");
      let withdrawAmount = "10000";
      const result = await handleWithdrawal(
        account,
        withdrawAmount,
        userMap[selectedUsername] as Address
      );
      console.log(result);
      return result;
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  useEffect(() => {
    async function init() {
      await fetchVaultData(VAULT_IDS).then(data => {
        if (data?.vaultBasics && data?.vaultDatas) {
          const formattedVaults = data.vaultBasics.map((vault, index) => {
            const vaultData = data.vaultDatas.find(v => v.id === vault.id);
            return {
              ...vault,
              chain: "Optimism",
              protocol: [
                "PoolTogether",
                "Exactly Protocol",
                "Exactly Protocol",
                "Aloe",
                "Aloe"
              ][index],
              totalAssets: vaultData
                ? formatTotalAssets(vaultData.totalAssets, vault.decimals)
                : "N/A",
              previewPPS: vaultData ? vaultData.previewPPS : "N/A",
              pricePerVaultShare: vaultData
                ? vaultData.pricePerVaultShare
                : "N/A",
              apy7d: ["13.73%", "12.00%", "6.94%", "0.04%", "0.06%"][index]
            };
          });
          setVaults(formattedVaults);
        }
      });

      await fetchUsersData().then(data => {
        const resolvedUsernames = Object.keys(data);
        const resolvedUserMap = data;

        setUsernames(resolvedUsernames);
        setUserMap(resolvedUserMap);
      });

      setLoading(false);
    }

    init();
  }, []);

  const handleUserChange = (username: string) => {
    setSelectedUsername(username);
    // Logic to display account balances based on the selected user
    // For example, fetch user account details and update active account
    // const userWalletAddress = getUserWalletAddress(username); // Replace with actual method to get address
    // if (userWalletAddress) {
    //   setActiveAccount(userWalletAddress);
    // }
  };

  return (
    <VaultsView
      loading={loading}
      vaults={vaults}
      usernames={usernames}
      selectedUsername={selectedUsername}
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      setSelectedUsername={setSelectedUsername}
      depositTransaction={handleDepositTransaction}
      withdrawTransaction={handleWithdrawTransaction}
      onTransactionConfirmed={handleSuccess}
      onError={handleError}
      usdcBalance={usdcBalance} // Pass USDC balance
    />
  );
};

export default VaultsContainer;
