import React from "react";
import NewUserModalContainer from "../containers/NewUserModalContainer";

interface MyClientsViewProps {
  usernames: string[];
  userMap: { [key: string]: string };
  balanceData: bigint | null;
  isLoading: boolean | undefined;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  handleAddUser: (username: string, walletAddress: string) => void;
}

const MyClientsView: React.FC<MyClientsViewProps> = ({
  usernames,
  userMap,
  balanceData,
  isLoading,
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
              return (
                <tr key={username}>
                  <td className="py-2 px-4 border-b text-white">{username}</td>
                  <td className="py-2 px-4 border-b text-gray-400">
                    {walletAddress}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-400">
                    {isLoading
                      ? "Loading..."
                      : balanceData
                      ? balanceData.toString()
                      : "N/A"}
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
