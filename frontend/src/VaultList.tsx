import React, { useState, useEffect } from "react";
import { depositToVault, withdrawFromVault } from "./utils/superform";
import Dropdown from "./Dropdown";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "./client";
import { optimism } from "thirdweb/chains";

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const SUPERFORM_ROUTER_ADDRESS = "0xa195608C2306A26f727d5199D5A382a4508308DA";
const AAVE_USDC_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
const vaultIds = [
  "0x03D3CE84279cB6F54f5e6074ff0F8319d830dafe",
  "0x6926B434CCe9b5b7966aE1BfEef6D0A7DCF3A8bb",
  "0x81C9A7B55A4df39A9B7B5F781ec0e53539694873",
  "0x462654Cc90C9124A406080EadaF0bA349eaA4AF9",
  "0x7708386e23B0d00cE2a05aF4200d80948fEfb9bE"
];

const VaultList = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  // State for usernames, selected username, and userMap for wallet addresses
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const personalAccount = useActiveAccount();

  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  // Fetch user data from the backend and update state
  const fetchUsersData = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();

      // Convert the data (object) to the desired format
      const resolvedUsernames = Object.keys(data);
      const resolvedUserMap = data;

      setUsernames(resolvedUsernames);
      setUserMap(resolvedUserMap);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchVaultData(vaultIds);
    fetchUsersData(); // Call to fetch user data
  }, []);

  const fetchVaultData = async vaultIds => {
    setLoading(true);

    // Convert vaultIds array to lowercase and format for GraphQL
    const vaultIdsLowercase = vaultIds.map(id => id.toLowerCase());
    const vaultIdsString = vaultIdsLowercase.map(id => `"${id}"`).join(",");

    try {
      const response = await fetch(
        "https://api.goldsky.com/api/public/project_cl94kmyjc05xp0ixtdmoahbtu/subgraphs/superform-v1-10/1.1.2/gn",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              {
                vaultBasics(where: { id_in: [${vaultIdsString}] }) {
                  id
                  name
                  symbol
                  decimals
                }
                vaultDatas(where: { id_in: [${vaultIdsString}] }) {
                  id
                  totalAssets
                  formBalance
                  previewPPS
                  pricePerVaultShare
                }
              }
            `
          })
        }
      );

      const result = await response.json();

      // Debugging: Log the result to check its structure
      console.log("GraphQL Response:", result);

      const { data } = result;

      // Check if data is defined and contains the expected properties
      if (data && data.vaultBasics && data.vaultDatas) {
        setVaults(
          data.vaultBasics.map((vault, index) => {
            const vaultData = data.vaultDatas.find(v => v.id === vault.id);
            // Define the hardcoded values
            const protocolValues = [
              "PoolTogether",
              "Exactly Protocol",
              "Exactly Protocol",
              "Aloe",
              "Aloe"
            ];
            const apyValues = ["13.73%", "12.00%", "6.94%", "0.04%", "0.06%"];
            return {
              ...vault,
              chain: "Optimism",
              protocol: protocolValues[index], // Assign the protocol based on index
              totalAssets: vaultData
                ? formatTotalAssets(vaultData.totalAssets, vault.decimals)
                : "N/A",
              previewPPS: vaultData ? vaultData.previewPPS : "N/A",
              pricePerVaultShare: vaultData
                ? vaultData.pricePerVaultShare
                : "N/A",
              apy7d: apyValues[index] // Assign the APY 7D based on index
            };
          })
        );
      } else {
        console.error("Data structure is not as expected:", data);
        setVaults([]);
      }
    } catch (error) {
      console.error("Error fetching vault data:", error);
      setVaults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const userData = {
        amount: depositAmount
      };
      const contract = getContract({
        client,
        chain: optimism,
        address: USDC_CONTRACT_ADDRESS
      });
      const approveTx = prepareContractCall({
        contract,
        method: "function approve(address to, uint256 value)",
        params: [AAVE_USDC_POOL_ADDRESS, BigInt(userData.amount)]
      });
      sendTx(approveTx);
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve");
    }
  };

  const handleDeposit = async (vaultId: string) => {
    try {
      // console.log(personalAccount);
      // const newSmartWallet = new smartWallet(config);
      // console.log(newSmartWallet);
      // const smartAccount = await newSmartWallet.connect({
      //   client,
      //   personalAccount
      // });
      // console.log(smartAccount);
      // const contract1 = getContract({
      //   client,
      //   chain: optimism,
      //   address: AAVE_USDC_POOL_ADDRESS
      // });
      // const contract2 = getContract({
      //   client,
      //   chain: optimism,
      //   address: AAVE_USDC_POOL_ADDRESS
      // });
      // const transactions = [
      //   approve({
      //     contract1,
      //     spender: AAVE_USDC_POOL_ADDRESS,
      //     value: 100
      //   }),
      //   transferFrom({
      //     contract2,
      //     from: "0x...",
      //     to: "0x...",
      //     amount: 100
      //   })
      // ];
      // await sendBatchTransaction({
      //   transactions,
      //   account: smartAccount
      // });
      // // const prefilledData = generatePrefilledData();
      // const userData = {
      //   amount: depositAmount
      // };
      // // console.log(userData);
      // // const superformData = prefilledData;
      // // console.log(superformData);
      // console.log(contract);
      // const depositTx = prepareContractCall({
      //   contract,
      //   method:
      //     "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
      //   params: [
      //     USDC_CONTRACT_ADDRESS,
      //     BigInt(userData.amount),
      //     "0xDd704A44866AE9C387CfC687fa642a222b84f0D3",
      //     0
      //   ]
      // });
      // console.log(depositTx);
      // sendTx(depositTx);
      // await depositToVault(superformData, signer);
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Failed to deposit");
    }
  };

  const handleWithdraw = async (vaultId: string) => {
    try {
      const signer = await getSigner();
      await withdrawFromVault(vaultId, "1.0", signer);
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Failed to withdraw");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-zinc-100">Selected Client</h2>
      <Dropdown
        usernames={usernames}
        selectedUsername={selectedUsername}
        onSelect={username => setSelectedUsername(username)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-lg">
          <table className="min-w-full bg-black text-zinc-100">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Chain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Protocol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Vault
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Total Assets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  APY 7D
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-gray-700">
              {vaults.map(vault => (
                <tr key={vault.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {vault.chain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {vault.protocol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {vault.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {vault.totalAssets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {vault.apy7d}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleApprove()}
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => handleWithdraw(vault.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Withdraw
                    </button>
                    <div>
                      <input
                        type="text"
                        placeholder="Amount"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-500 mt-2 p-2 rounded"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function formatTotalAssets(totalAssets, decimals) {
  const value = Number(totalAssets) / Math.pow(10, decimals);
  const formattedValue = value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return formattedValue;
}

export default VaultList;
