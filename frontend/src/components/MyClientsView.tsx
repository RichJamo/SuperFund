import React from "react";
import NewUserModalContainer from "../containers/NewUserModalContainer";
import { useReadContract } from "thirdweb/react";
import { balanceOf } from "thirdweb/extensions/erc20";
import { getContract } from "thirdweb";
import { USDC_CONTRACT_ADDRESS } from "../constants";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { formatUSDCBalance } from "../utils/utils";

interface MyClientsViewProps {
  usernames: string[];
  userMap: { [key: string]: string };
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  handleAddUser: (username: string, walletAddress: string) => void;
}

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS
});

const MyClientsView: React.FC<MyClientsViewProps> = ({
  usernames,
  userMap,
  isModalOpen,
  setIsModalOpen,
  handleAddUser
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 text-zinc-100"></h2>
      <div className="overflow-hidden rounded-lg">
        <table className="min-w-full bg-black text-zinc-100">
          <thead className="bg-gray-800">
            <tr>
              <th className="py-2 px-4 border-b text-zinc-300">Username</th>
              <th className="py-2 px-4 border-b text-zinc-300">
                Wallet Address
              </th>
              <th className="py-2 px-4 border-b text-zinc-300">USDC Balance</th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-700">
            {usernames.map(username => {
              const walletAddress = userMap[username];
              const { data: balanceData, isLoading } = useReadContract(
                balanceOf,
                {
                  contract,
                  address: walletAddress
                }
              );
              const displayBalance = isLoading
                ? "Loading..."
                : balanceData !== null && balanceData !== undefined
                ? formatUSDCBalance(balanceData.toString())
                : "N/A";
              return (
                <tr key={username}>
                  <td className="py-2 px-4 border-b text-white">{username}</td>
                  <td className="py-2 px-4 border-b text-gray-400">
                    {walletAddress}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-400  text-right">
                    {displayBalance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-green-500 text-white rounded mt-4"
      >
        New Client
      </button>
      <NewUserModalContainer
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </>
  );
};

export default MyClientsView;
