import React, { useState, useEffect } from 'react';
import { getSigner } from './utils/ethers'; // Adjust the path if needed
import { depositToVault, withdrawFromVault } from './utils/superform'; // Adjust the path if needed

const VaultList = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vault data from the subgraph and set it in state
    fetchVaultData();
  }, []);

  const fetchVaultData = async () => {
    setLoading(true);
    const response = await fetch(
      'https://api.goldsky.com/api/public/project_cl94kmyjc05xp0ixtdmoahbtu/subgraphs/superform-v1-10/1.1.2/gn',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        `,
        }),
      }
    );

    const { data } = await response.json();
    // Combine vaultBasics and vaultDatas as needed
    setVaults(
      data.vaultBasics.map((vault, index) => ({
        ...vault,
        totalAssets: data.vaultDatas[index].totalAssets,
      }))
    );
    setLoading(false);
  };

  const handleDeposit = async (vaultId: string) => {
    try {
      const signer = await getSigner();
      await depositToVault(vaultId, '1.0', signer); // Replace '1.0' with the actual amount you want to deposit
      alert('Deposit successful');
    } catch (error) {
      console.error('Error depositing:', error);
      alert('Failed to deposit');
    }
  };

  const handleWithdraw = async (vaultId: string) => {
    try {
      const signer = await getSigner();
      await withdrawFromVault(vaultId, '1.0', signer); // Replace '1.0' with the actual amount you want to withdraw
      alert('Withdrawal successful');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Failed to withdraw');
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Symbol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Assets
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vaults.map((vault) => (
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VaultList;
