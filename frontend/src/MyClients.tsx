import React, { useState, useEffect } from "react";
import usersData from "./data/users.json";
import NewUserModal from "./NewUserModal";
import { getContract } from "thirdweb";
import { optimism } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { sha256 } from "thirdweb/utils";

const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID as string;

const client = createThirdwebClient({
  clientId: clientId
});

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

async function fetchUsersData() {
  try {
    const response = await fetch("http://localhost:4000/api/users");
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

function MyClients() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function getUsers() {
      const data = await fetchUsersData();

      // Convert object to array if needed
      const usersArray = Object.entries(data).map(([username, address]) => ({
        username,
        address
      }));

      setUsernames(usersArray.map(user => user.username));
      setUserMap(
        usersArray.reduce((map, user) => {
          map[user.username] = user.address;
          return map;
        }, {})
      );
    }

    getUsers();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = async (username: string, walletAddress: string) => {
    try {
      // Send a POST request to the backend to add the new user
      const response = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, address: walletAddress }) // Adjust to match the backend structure
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      // If the user is successfully added, update the state on the frontend
      setUsernames(prev => [...prev, username]);
      setUserMap(prev => ({ ...prev, [username]: walletAddress }));
      setIsModalOpen(false); // Close the modal after the user is added
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user");
    }
  };

  const fetchBalances = (walletAddress: string | undefined) => {
    return useReadContract({
      contract,
      method: "balanceOf",
      params: [walletAddress || ""],
      queryOptions: { enabled: !!walletAddress }
    });
  };

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
              const data = 1000;
              const isLoading = false;
              return (
                <tr key={username}>
                  <td className="py-2 px-4 border-b text-white">{username}</td>
                  <td className="py-2 px-4 border-b text-gray-400">
                    {walletAddress}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-400">
                    {isLoading ? "Loading..." : data ? data.toString() : "N/A"}
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
      <NewUserModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </>
  );
}

export default MyClients;
