import React, { useState } from "react";
import usersData from "./data/users.json";
import NewUserModal from "./NewUserModal";
import { getContract } from "thirdweb";
import { optimism } from "thirdweb/chains";
import { client } from "./client";
import { useReadContract } from "thirdweb/react";

const USDC_CONTRACT_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";

const contract = getContract({
  client,
  chain: optimism,
  address: USDC_CONTRACT_ADDRESS,
  abi: [
    {
      type: "function",
      name: "balanceOf",
      inputs: [{ type: "address", name: "account" }],
      outputs: [{ type: "uint256", name: "balance" }],
      stateMutability: "view"
    }
  ]
});

function useBalanceOfContract(walletAddress: string | undefined) {
  const { data, isLoading } = useReadContract({
    contract,
    method: "balanceOf",
    params: [walletAddress || ""], // Wrap in an array
    queryOptions: { enabled: !!walletAddress } // Enable query if account is defined
  });

  return { data, isLoading };
}

export default function MyClients() {
  const [usernames, setUsernames] = useState<string[]>(
    usersData.map(user => user.username)
  );
  const [userMap, setUserMap] = useState<{ [key: string]: string }>(
    usersData.reduce((map: { [key: string]: string }, user) => {
      map[user.username] = user.walletAddress;
      return map;
    }, {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = (username: string, walletAddress: string) => {
    setUsernames(prev => [...prev, username]);
    setUserMap(prev => ({ ...prev, [username]: walletAddress }));
    setIsModalOpen(false);
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-4">My Clients</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Username</th>
            <th className="py-2 px-4 border-b">Wallet Address</th>
            <th className="py-2 px-4 border-b">USDC Balance</th>
          </tr>
        </thead>
        <tbody>
          {usernames.map(username => {
            const walletAddress = userMap[username];
            const { data, isLoading } = useBalanceOfContract(walletAddress);

            return (
              <tr key={username}>
                <td className="py-2 px-4 border-b">{username}</td>
                <td className="py-2 px-4 border-b">{walletAddress}</td>
                <td className="py-2 px-4 border-b">
                  {isLoading ? "Loading..." : data ? data.toString() : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-green-500 text-white rounded mt-4"
      >
        New Client
      </button>
      <NewUserModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </>
  );
}
