import React from "react";
import Dropdown from "./Dropdown";
import { TransactionButton } from "thirdweb/react";
interface Vault {
  id: string;
  chain: string;
  protocol: string;
  name: string;
  totalAssets: string;
  apy7d: string;
}

interface VaultsViewProps {
  loading: boolean;
  vaults: Vault[];
  usernames: string[];
  selectedUsername: string;
  depositAmount: string;
  setDepositAmount: (value: string) => void;
  setSelectedUsername: (value: string) => void;
  handleWithdraw: (vaultId: string) => void;
  transaction: () => Promise<any>;
  onTransactionConfirmed: (result: any) => void;
  onError: (error: Error) => void;
}

const VaultsView: React.FC<VaultsViewProps> = ({
  loading,
  vaults,
  usernames,
  selectedUsername,
  depositAmount,
  setDepositAmount,
  setSelectedUsername,
  handleWithdraw,
  transaction,
  onTransactionConfirmed,
  onError
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-zinc-100">Selected Client</h2>
      <Dropdown
        usernames={usernames}
        selectedUsername={selectedUsername}
        onSelect={setSelectedUsername}
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
                  7d APY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {vaults.map(vault => (
                <tr key={vault.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{vault.chain}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vault.protocol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{vault.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vault.totalAssets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{vault.apy7d}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TransactionButton
                      transaction={transaction}
                      onTransactionConfirmed={onTransactionConfirmed}
                      onError={onError}
                    >
                      Deposit
                    </TransactionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4 text-zinc-100">Deposit</h2>
        <input
          type="number"
          value={depositAmount}
          onChange={e => setDepositAmount(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded mb-2"
        />
      </div>
    </div>
  );
};

export default VaultsView;
