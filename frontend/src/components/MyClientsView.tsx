import React from "react";
import NewUserModalContainer from "../containers/NewUserModalContainer";
import { User } from "../types/types";
interface MyClientsViewProps {
  usernames: string[];
  userMap: { [key: string]: User };
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  handleAddUser: (username: string, walletAddress: string) => void;
  balances: { [key: string]: string };
}

const MyClientsView: React.FC<MyClientsViewProps> = ({
  usernames,
  userMap,
  isModalOpen,
  setIsModalOpen,
  handleAddUser,
  balances
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
            {usernames.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-2 px-4 border-b text-center text-white"
                >
                  No clients have been added yet!
                </td>
              </tr>
            ) : (
              usernames.map(username => {
                const walletAddress = userMap[username]?.walletAddress;
                const displayBalance = balances[username] || "N/A";

                return (
                  <tr key={username}>
                    <td className="py-2 px-4 border-b text-white">
                      {username}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-400">
                      {walletAddress || "N/A"}{" "}
                      {/* Handle possible undefined walletAddress */}
                    </td>
                    <td className="py-2 px-4 border-b text-gray-400 text-right">
                      {displayBalance}
                    </td>
                  </tr>
                );
              })
            )}
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
