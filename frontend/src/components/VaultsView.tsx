import React from "react";
import Dropdown from "./Dropdown";
import { TransactionButton } from "thirdweb/react";
import { Vault } from "../types/types";
import { Address } from "thirdweb";

interface VaultsViewProps {
  loading: boolean;
  vaults: Vault[];
  usernames: string[];
  selectedUsername: string;
  transactionAmount: string;
  setTransactionAmount: (value: string) => void;
  setSelectedUsername: (value: string) => void;
  depositTransaction: (value: Address) => Promise<any>;
  withdrawTransaction: (value: Address) => Promise<any>;
  onTransactionConfirmed: (result: any) => void;
  onError: (error: Error) => void;
  usdcBalance: string;
}

const VaultsView: React.FC<VaultsViewProps> = ({
  loading,
  vaults,
  usernames,
  selectedUsername,
  transactionAmount,
  setTransactionAmount,
  setSelectedUsername,
  depositTransaction,
  withdrawTransaction,
  onTransactionConfirmed,
  onError,
  usdcBalance
}) => {
  const isClientSelected = selectedUsername !== "";

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-zinc-100">Selected Client</h2>
      <div className="flex items-center mb-4">
        <Dropdown
          usernames={usernames}
          selectedUsername={selectedUsername}
          onSelect={setSelectedUsername}
        />
        {isClientSelected && (
          <span className="ml-4 text-zinc-100">
            Free USDC Balance: ${usdcBalance}
          </span>
        )}
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-black text-zinc-100">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Chain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Protocol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Vault
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Total Assets
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  7d APY
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  User Balance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-300 tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {vaults.map(vault => (
                <tr key={vault.id}>
                  <td className="px-4 py-4 whitespace-nowrap">{vault.chain}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {vault.protocol}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{vault.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {vault.totalAssets}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{vault.apy7d}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {vault.userBalance || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <TransactionButton
                        transaction={() =>
                          depositTransaction(vault.id as Address)
                        }
                        onTransactionConfirmed={onTransactionConfirmed}
                        onError={onError}
                        disabled={!isClientSelected}
                        className={`${
                          !isClientSelected
                            ? "bg-gray-600 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        Deposit
                      </TransactionButton>
                      <TransactionButton
                        transaction={() =>
                          withdrawTransaction(vault.id as Address)
                        }
                        onTransactionConfirmed={onTransactionConfirmed}
                        onError={onError}
                        disabled={!isClientSelected}
                        className={`${
                          !isClientSelected
                            ? "bg-gray-600 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        Withdraw
                      </TransactionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isClientSelected && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-4 text-zinc-100">
            Amount to Deposit/Withdraw
          </h2>
          <input
            type="number"
            value={transactionAmount}
            onChange={e => setTransactionAmount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded mb-2"
          />
        </div>
      )}
    </div>
  );
};

export default VaultsView;
