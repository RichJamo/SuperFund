import { useState, useEffect } from "react";
import MyClientsView from "../components/MyClientsView";
import { fetchUsersData } from "../utils/api";
import { UserMap } from "../types/types";
import { useActiveAccount } from "thirdweb/react";

function MyClientsContainer() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeAccount = useActiveAccount();
  if (!activeAccount) {
    throw new Error("No active wallet found");
  }

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData: UserMap = await fetchUsersData();
        const managerAddress = activeAccount.address;

        // Filter users based on the managerAddress
        const filteredUserMap = Object.fromEntries(
          Object.entries(userData).filter(
            ([_, user]) => user.managerAddress === managerAddress
          )
        );

        setUsernames(Object.keys(filteredUserMap));
        setUserMap(filteredUserMap);
      } catch (error) {
        console.error("Error fetching users data:", error);
        // Optionally set an error state here
      }
    };

    getUsers();
  }, [activeAccount]);

  const handleAddUser = async (username: string, walletAddress: string) => {
    try {
      const managerAddress = activeAccount?.address;

      const response = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          walletAddress,
          managerAddress
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      // Update local state with the new user
      setUsernames(prev => [...prev, username]);
      setUserMap(prev => ({
        ...prev,
        [username]: { walletAddress, managerAddress }
      }));
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
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      handleAddUser={handleAddUser}
    />
  );
}

export default MyClientsContainer;
