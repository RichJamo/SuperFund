import { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import {
  handleApprove,
  handleDeposit,
  handleWithdrawal,
  fetchUserVaultBalance
} from "../actions/actions";
import VaultsView from "../components/VaultsView";
import { FormattedVault, UserMap, VaultData } from "../types/types";
import { VAULT_IDS, USDC_CONTRACT_ADDRESS } from "../constants/index";
import { Address, getContract } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { getBalance } from "thirdweb/extensions/erc20";
import { Account } from "thirdweb/wallets";

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS
});

const VaultsContainer = () => {
  const [vaults, setVaults] = useState<FormattedVault[]>([]);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  const handleSuccess = (transactionResult: any) => {
    console.log("Transaction successful:", transactionResult);
    // Handle success logic here
  };

  const handleError = (error: Error) => {
    console.error("Transaction error:", error);
    // Handle error logic here
  };

  const EOAaccount = useActiveAccount();
  useEffect(() => {
    if (EOAaccount) {
      setActiveAccount(EOAaccount);
    } else {
      setActiveAccount(null);
    }
  }, [EOAaccount]);
  if (!EOAaccount) {
    throw new Error("No active account found");
  }
  console.log("EOAaccount", EOAaccount);

  const handleApproveTransaction = async () => {
    if (!selectedUsername || !userMap[selectedUsername]?.walletAddress) {
      console.error("No wallet address available for approval");
      return;
    }

    try {
      console.log("Approving...");
      const result = await handleApprove(
        EOAaccount,
        userMap[selectedUsername].walletAddress as Address
      );
      return result;
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  const handleDepositTransaction = async (vaultId: Address) => {
    if (!selectedUsername || !userMap[selectedUsername]?.walletAddress) {
      console.error("No wallet address available for approval");
      return;
    }

    try {
      console.log("Depositing to vault...");
      setTransactionAmount;
      const result = await handleDeposit(
        vaultId,
        EOAaccount,
        BigInt(transactionAmount),
        userMap[selectedUsername].walletAddress as Address
      );
      console.log(result);
      return result;
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  const handleWithdrawTransaction = async (vaultId: Address) => {
    if (!selectedUsername || !userMap[selectedUsername]?.walletAddress) {
      console.error("No wallet address available for approval");
      return;
    }

    try {
      console.log("Withdrawing from vault...");
      setTransactionAmount;
      const result = await handleWithdrawal(
        vaultId,
        EOAaccount,
        BigInt(transactionAmount),
        userMap[selectedUsername].walletAddress as Address
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
        const data: VaultData[] = await fetchVaultData(VAULT_IDS);

        // Assuming data is an array of objects with the new structure
        const formattedVaults: FormattedVault[] = data.map(vaultData => {
          const {
            id,
            inputToken,
            name,
            rates,
            totalValueLockedUSD
          } = vaultData;

          // Find specific rate types within the rates array
          const lenderVariableRate = rates.find(
            rate => rate.type === "VARIABLE" && rate.id.startsWith("LENDER")
          );
          const borrowerVariableRate = rates.find(
            rate => rate.type === "VARIABLE" && rate.id.startsWith("BORROWER")
          );

          return {
            id,
            name: name || "Unnamed Vault",
            symbol: inputToken.symbol || "N/A",
            chain: "Optimism", // Adjust if needed
            protocol: "Aave", // Assuming the protocol is Aave based on the context
            totalAssets: totalValueLockedUSD
              ? formatTotalAssets(totalValueLockedUSD, inputToken.decimals)
              : "N/A",
            previewPPS: lenderVariableRate
              ? `${parseFloat(lenderVariableRate.rate).toFixed(2)}%`
              : "N/A",
            pricePerVaultShare: borrowerVariableRate
              ? `${parseFloat(borrowerVariableRate.rate).toFixed(2)}%`
              : "N/A",
            apy7d: lenderVariableRate
              ? `${parseFloat(lenderVariableRate.rate).toFixed(2)}%`
              : "N/A",
            userBalance: "N/A" // Placeholder until you fetch actual user balances
          };
        });

        setVaults(formattedVaults);

        // Fetch all users
        const allUsersData: UserMap = await fetchUsersData();
        console.log("allUsersData: ", allUsersData);

        // Filter users based on the connected manager's address
        const filteredUserMap = Object.fromEntries(
          Object.entries(allUsersData).filter(
            ([username, user]) => user.managerAddress === EOAaccount.address
          )
        );
        const filteredUsernames = Object.keys(filteredUserMap);

        setUsernames(filteredUsernames);
        setUserMap(filteredUserMap);
        if (filteredUsernames.length > 0) {
          setSelectedUsername(filteredUsernames[0]);
        } else {
          setSelectedUsername("");
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    }
    if (activeAccount) {
      init();
    }
  }, [activeAccount]); // Run only on component mount

  console.log("selectedUsername", selectedUsername);
  const walletAddress = selectedUsername
    ? userMap[selectedUsername]?.walletAddress
    : "";
  const { data: usdcBalanceResult, isLoading, error } = useReadContract(
    getBalance,
    {
      contract,
      address: walletAddress
    }
  );

  const usdcBalance = isLoading
    ? "Loading..."
    : error
    ? "Error"
    : usdcBalanceResult?.displayValue || "N/A";

  useEffect(() => {
    async function updateUserVaultBalances() {
      if (!selectedUsername || !userMap[selectedUsername]) return;

      const updatedVaults = [...vaults];

      for (const vault of updatedVaults) {
        try {
          const balance = await fetchUserVaultBalance(
            userMap[selectedUsername].walletAddress as Address,
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
  };

  return (
    <VaultsView
      loading={loading}
      vaults={vaults}
      usernames={usernames}
      selectedUsername={selectedUsername}
      transactionAmount={transactionAmount}
      setTransactionAmount={setTransactionAmount}
      setSelectedUsername={setSelectedUsername}
      depositTransaction={handleDepositTransaction}
      withdrawTransaction={handleWithdrawTransaction}
      onTransactionConfirmed={handleSuccess}
      onError={handleError}
      usdcBalance={usdcBalance}
    />
  );
};

export default VaultsContainer;
