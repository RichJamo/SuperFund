import { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import {
  executeDeposit,
  executeWithdrawal,
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

  const handleDepositTransaction = async (vaultId: Address) => {
    if (!selectedUsername || !userMap[selectedUsername]?.walletAddress) {
      console.error("No wallet address available for approval");
      return;
    }
    try {
      setTransactionAmount;
      await executeDeposit(
        vaultId,
        EOAaccount,
        BigInt(transactionAmount),
        userMap[selectedUsername].walletAddress as Address
      );
      refetch();
      updateUserVaultBalances();
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
      setTransactionAmount;
      await executeWithdrawal(
        vaultId,
        EOAaccount,
        BigInt(transactionAmount),
        userMap[selectedUsername].walletAddress as Address
      );
      refetch();
      updateUserVaultBalances();
    } catch (error) {
      throw new Error("Transaction failed");
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const data: VaultData[] = await fetchVaultData(VAULT_IDS);

        const formattedVaults: FormattedVault[] = data.map(vaultData => {
          const {
            id,
            inputToken,
            name,
            rates,
            totalValueLockedUSD
          } = vaultData;

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
            chain: "Optimism",
            protocol: "Aave",
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
            userBalance: "N/A"
          };
        });

        setVaults(formattedVaults);

        const allUsersData: UserMap = await fetchUsersData();

        if (!EOAaccount) {
          throw new Error("No active account found");
        }
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
  }, [activeAccount]);

  const walletAddress = selectedUsername
    ? userMap[selectedUsername]?.walletAddress
    : "";
  const {
    data: usdcBalanceResult,
    isLoading,
    error,
    refetch
  } = useReadContract(getBalance, {
    contract,
    address: walletAddress
  });

  const usdcBalance = isLoading
    ? "Loading..."
    : error
    ? "Error"
    : usdcBalanceResult?.displayValue || "N/A";

  useEffect(() => {
    updateUserVaultBalances();
  }, [selectedUsername, userMap]);

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
      usdcBalance={usdcBalance}
    />
  );
};

export default VaultsContainer;
