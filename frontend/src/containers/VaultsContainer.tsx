import React, { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import { handleApprove, handleWithdraw } from "../actions/actions";
import VaultsView from "../components/VaultsView";
import { Vault } from "../types/types";
import { VAULT_IDS } from "../constants/index";

const VaultsContainer = () => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

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

  return (
    <VaultsView
      loading={loading}
      vaults={vaults}
      usernames={usernames}
      selectedUsername={selectedUsername}
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      setSelectedUsername={setSelectedUsername}
      handleApprove={() => handleApprove(depositAmount)}
      handleWithdraw={handleWithdraw}
    />
  );
};

export default VaultsContainer;
