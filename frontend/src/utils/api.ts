import { AAVE_OPTIMISM_SUBGRAPH_URL, OPTIMISM_SUBGRAPH_URL } from "../constants/urls";
import { UserMap } from "../types/types";

export const fetchUsersData = async (): Promise<UserMap> => {
  try {
    const response = await fetch("http://localhost:4000/api/users");
    if (!response.ok) throw new Error("Failed to fetch users");

    const data: UserMap = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
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
