import { useState, useEffect } from "react";
import MyClientsView from "../components/MyClientsView";
import { fetchUsersData } from "../utils/api";
import { getUSDCBalance } from "../hooks/hooks";
import { UserData } from "../types/types";

// Define a type for the user data map
type UserMap = { [key: string]: string };

function MyClientsContainer() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: balanceData, isLoading } = getUSDCBalance(userMap);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData: UserData = await fetchUsersData();
        const usersArray = Object.entries(userData).map(
          ([username, address]) => ({
            username,
            address
          })
        );

        setUsernames(usersArray.map(user => user.username));
        setUserMap(
          usersArray.reduce((map, user) => {
            map[user.username] = user.address;
            return map;
          }, {} as UserMap)
        );
      } catch (error) {
        console.error("Error fetching users data:", error);
        // Optionally set an error state here
      }
    };

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
      balanceData={balanceData}
      isLoading={isLoading}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      handleAddUser={handleAddUser}
    />
  );
}

export default MyClientsContainer;
