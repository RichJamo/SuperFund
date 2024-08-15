import React, { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import {
  handleApprove,
  handleDeposit,
  handleWithdrawal,
  fetchUserVaultBalance
} from "../actions/actions";
import VaultsView from "../components/VaultsView";
import { Vault } from "../types/types";
import { VAULT_IDS } from "../constants/index";
import { Address, getContract, prepareContractCall } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { USDC_CONTRACT_ADDRESS } from "../constants";
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

  const EOAaccount = useActiveAccount();
  if (!EOAaccount) {
    throw new Error("No active account found");
  }
  console.log("EOAaccount", EOAaccount);

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

  const handleApproveTransaction = async () => {
    try {
      console.log("Approving...");
      const result = await handleApprove(
        EOAaccount,
        userMap[selectedUsername] as Address
      );
      return result;
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  const handleDepositTransaction = async () => {
    try {
      console.log("Depositing to vault...");
      setDepositAmount;
      console.log(depositAmount);
      const result = await handleDeposit(
        EOAaccount,
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
        EOAaccount,
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
      try {
        const data = await fetchVaultData(VAULT_IDS);
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
              apy7d: ["13.73%", "12.00%", "6.94%", "0.04%", "0.06%"][index],
              userBalance: "N/A" // Initialize with "N/A"
            };
          });

          setVaults(formattedVaults);
        }

        const userData = await fetchUsersData();
        const resolvedUsernames = Object.keys(userData);
        const resolvedUserMap = userData;

        setUsernames(resolvedUsernames);
        setUserMap(resolvedUserMap);
        if (resolvedUsernames.length > 0 && !selectedUsername) {
          setSelectedUsername(resolvedUsernames[0]); // Set default user only if none is selected
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []); // Run only on component mount

  useEffect(() => {
    async function updateUserVaultBalances() {
      if (!selectedUsername || !userMap[selectedUsername]) return;

      const updatedVaults = [...vaults];

      for (const vault of updatedVaults) {
        try {
          const balance = await fetchUserVaultBalance(
            userMap[selectedUsername] as Address,
            vault.id as Address
          );
          vault.userBalance = balance;
        } catch (error) {
          console.error(`Error fetching balance for vault ${vault.id}:`, error);
          vault.userBalance = "Error";
        }
      }
      setVaults(updatedVaults);
    }
    updateUserVaultBalances();
  }, [selectedUsername, userMap]); // Run whenever selectedUsername or userMap changes

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
