import React, { useState, useEffect } from "react";
import { depositToVault, withdrawFromVault } from "./utils/superform";
import { generatePrefilledData } from "./utils/prefilledData";
import Dropdown from "./Dropdown";
import usersData from "./data/users.json";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "./client";
import { optimism } from "thirdweb/chains";

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS
  // abi: [
  //   {
  //     type: "function",
  //     name: "balanceOf",
  //     inputs: [{ type: "address", name: "account" }],
  //     outputs: [{ type: "uint256", name: "balance" }],
  //     stateMutability: "view"
  //   }
  // ]
});

// const { mutate: sendTx, data: transactionResult } = useSendTransaction();

// const onClick = () => {
//   const transaction = prepareContractCall({
//       contract,
//       method: "function approve(address to, uint256 value)",
//       params: ["0x000000000022D473030F116dDEE9F6B43aC78BA3", 1000000n],
//     }),
//   sendTx(transaction);
// };

// console.log(sendTx);

const VaultList = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  // State for usernames, selected username, and userMap for wallet addresses
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

  const { mutate: sendTx } = useSendTransaction();

  useEffect(() => {
    fetchVaultData();
    resolveUsernamesAndAddresses();
  }, []);

  // Resolve both usernames and wallet addresses
  const resolveUsernamesAndAddresses = () => {
    const resolvedUsernames = usersData.map(user => user.username);
    const resolvedUserMap = usersData.reduce((map, user) => {
      map[user.username] = user.walletAddress;
      return map;
    }, {} as { [key: string]: string });

    setUsernames(resolvedUsernames);
    setUserMap(resolvedUserMap);
  };

  const fetchVaultData = async () => {
    setLoading(true);
    const response = await fetch(
      "https://api.goldsky.com/api/public/project_cl94kmyjc05xp0ixtdmoahbtu/subgraphs/superform-v1-10/1.1.2/gn",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
          {
            vaultBasics(first: 5) {
              id
              name
              symbol
              decimals
            }
            vaultDatas(first: 5) {
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

    const { data } = await response.json();
    setVaults(
      data.vaultBasics.map((vault, index) => ({
        ...vault,
        totalAssets: formatTotalAssets(
          data.vaultDatas[index].totalAssets,
          data.vaultBasics[index].decimals
        ),
        previewPPS: data.vaultDatas[index].previewPPS,
        pricePerVaultShare: data.vaultDatas[index].pricePerVaultShare
      }))
    );
    setLoading(false);
  };

  const handleDeposit = async (vaultId: string) => {
    try {
      // const prefilledData = generatePrefilledData();

      // const userData = {
      //   amount: depositAmount,
      //   outputAmount
      // };
      // console.log(userData);
      // const superformData = [prefilledData];
      // const { mutate: sendTx } = useSendTransaction();

      const transaction = prepareContractCall({
        contract,
        method: "function approve(address to, uint256 value)",
        params: ["0x000000000022D473030F116dDEE9F6B43aC78BA3", 1000000n]
      });
      sendTx(transaction);

      // await depositToVault(superformData, signer);

      alert("Deposit successful");
    } catch (error) {
      console.error("Error depositing:", error);
      alert("Failed to deposit");
    }
  };

  const handleWithdraw = async (vaultId: string) => {
    try {
      const signer = await getSigner();
      await withdrawFromVault(vaultId, "1.0", signer);
      alert("Withdrawal successful");
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Failed to withdraw");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Selected Client</h2>
      <Dropdown
        usernames={usernames}
        selectedUsername={selectedUsername}
        onSelect={username => setSelectedUsername(username)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Assets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vaults.map(vault => (
              <tr key={vault.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vault.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vault.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vault.totalAssets}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleDeposit(vault.id)}
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
                      className="border mt-2 p-2 rounded"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Helper function to format the total assets value
function formatTotalAssets(totalAssets, decimals) {
  const formattedValue = Number(totalAssets) / Math.pow(10, decimals);
  return formattedValue.toFixed(2);
}

export default VaultList;
