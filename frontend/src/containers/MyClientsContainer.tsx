import { useState, useEffect } from "react";
import MyClientsView from "../components/MyClientsView";
import { fetchUsersData } from "../utils/api";
import { UserMap } from "../types/types";
import { useActiveAccount } from "thirdweb/react";
import { getContract } from "thirdweb";
import { USDC_CONTRACT_ADDRESS } from "../constants";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { getBalance } from "thirdweb/extensions/erc20";

interface Balances {
  [username: string]: string;
}

function MyClientsContainer() {
  const [usernames, setUsernames] = useState<string[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState<Balances>({});

  const activeAccount = useActiveAccount();
  if (!activeAccount) {
    throw new Error("No active wallet found");
  }

  const contract = getContract({
    client,
    chain: optimism,
    address: USDC_CONTRACT_ADDRESS
  });

  useEffect(() => {
    const getUsers = async () => {
      try {
        const userData: UserMap = await fetchUsersData();
        const managerAddress = activeAccount.address;

        const filteredUserMap = Object.fromEntries(
          Object.entries(userData).filter(
            ([_, user]) => user.managerAddress === managerAddress
          )
        );

        setUsernames(Object.keys(filteredUserMap));
        setUserMap(filteredUserMap);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };

    getUsers();
  }, [activeAccount]);

  useEffect(() => {
    const fetchBalances = async () => {
      const newBalances: Balances = {};
      try {
        for (const name of usernames) {
          const walletAddress = userMap[name]?.walletAddress || "";
          const balance = await getBalance({
            contract,
            address: walletAddress
          });
          newBalances[name] = `$${balance?.displayValue || "N/A"}`;
        }
        setBalances(newBalances);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [userMap]);

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
      balances={balances}
    />
  );
}

export default MyClientsContainer;
