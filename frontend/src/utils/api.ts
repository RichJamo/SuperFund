import { AAVE_OPTIMISM_SUBGRAPH_URL } from "../constants/urls";
import { UserMap } from "../types/types";

export const fetchUsersData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/users'); // Adjust URL based on your backend server
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const addNewUserData = async (username: string, walletAddress: string, managerAddress: string ) => {
  try {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, walletAddress, managerAddress }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  } catch (error) {
    console.error("Error adding new user:", error);
    throw error;
  }
};




export const fetchVaultData = async (vaultIds: string[]): Promise<any> => {
  const vaultIdsString = vaultIds.map(id => `"${id.toLowerCase()}"`).join(",");

  try {
    const response = await fetch(
      AAVE_OPTIMISM_SUBGRAPH_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            {
              markets(where: {id_in: [${vaultIdsString}]}) {
                id
                name
                inputToken {
                  symbol
                  decimals
                }
                totalValueLockedUSD
                rates {
                  id
                  rate
                  type
                }
              }
            }
          `
        })
      }
    );

    const data = await response.json();
    if (data.errors) {
      console.error("Error fetching data:", data.errors);
      return null;
    }

    const result = data.data.markets;
    return result;

  } catch (error) {
    console.error("Error fetching Aave data:", error);
    throw error;
  }
};
