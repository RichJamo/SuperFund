import React, { useState, useEffect } from "react";
import { depositToVault, withdrawFromVault } from "./utils/superform";
import { generatePrefilledData } from "./utils/prefilledData";
import Dropdown from "./Dropdown";
import usersData from "./data/users.json";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "./client";
import { optimism } from "thirdweb/chains";
import { smartWallet } from "thirdweb/wallets";
import { sendBatchTransaction } from "thirdweb";
import { approve, transferFrom } from "thirdweb/extensions/erc20";

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const SUPERFORM_ROUTER_ADDRESS = "0xa195608C2306A26f727d5199D5A382a4508308DA";
const AAVE_USDC_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";

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
      alert("Approval successful");
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
