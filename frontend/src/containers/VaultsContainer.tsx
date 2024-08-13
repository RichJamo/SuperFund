import React, { useState, useEffect } from "react";
import { fetchUsersData, fetchVaultData } from "../utils/api";
import { formatTotalAssets } from "../utils/utils";
import { handleApprove, handleWithdraw } from "../actions/actions";
import VaultsView from "../components/VaultsView";
import { Vault } from "../types/types";

const vaultIds = [
  "0x03D3CE84279cB6F54f5e6074ff0F8319d830dafe",
  "0x6926B434CCe9b5b7966aE1BfEef6D0A7DCF3A8bb",
  "0x81C9A7B55A4df39A9B7B5F781ec0e53539694873",
  "0x462654Cc90C9124A406080EadaF0bA349eaA4AF9",
  "0x7708386e23B0d00cE2a05aF4200d80948fEfb9bE"
];

const VaultsContainer = () => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function init() {
      await fetchVaultData(vaultIds).then(data => {
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
