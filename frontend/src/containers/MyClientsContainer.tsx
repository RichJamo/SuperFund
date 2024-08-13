import React, { useState, useEffect } from "react";
import MyClientsView from "../components/MyClientsView";
import { fetchUsersData } from "../utils/api"; // Refactor API call
import { useContractBalance } from "../hooks/hooks"; // Refactor contract balance logic

function MyClientsContainer() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading } = useContractBalance(userMap);

  useEffect(() => {
    async function getUsers() {
      const data = await fetchUsersData();
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

  const handleAddUser = async (username: string, walletAddress: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, address: walletAddress })
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      setUsernames(prev => [...prev, username]);
      setUserMap(prev => ({ ...prev, [username]: walletAddress }));
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add user");
    }
  };

  return (
    <MyClientsView
      usernames={usernames}
      userMap={userMap}
      data={data}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      handleAddUser={handleAddUser}
    />
  );
}

export default MyClientsContainer;
