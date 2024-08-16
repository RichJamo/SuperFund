import {UserData} from "../types/types";

export const fetchUsersData = async (): Promise<UserData> => {
  try {
    const response = await fetch("http://localhost:4000/api/users");
    if (!response.ok) throw new Error("Failed to fetch users");

    const data: UserData = await response.json(); // Explicitly type the data
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const fetchVaultData = async (vaultIds: string[]) => {
  const vaultIdsLowercase = vaultIds.map(id => id.toLowerCase());
  const vaultIdsString = vaultIdsLowercase.map(id => `"${id}"`).join(",");

  try {
    const response = await fetch(
      "https://api.goldsky.com/api/public/project_cl94kmyjc05xp0ixtdmoahbtu/subgraphs/superform-v1-10/1.1.2/gn",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            {
              vaultBasics(where: { id_in: [${vaultIdsString}] }) {
                id
                name
                symbol
                decimals
              }
              vaultDatas(where: { id_in: [${vaultIdsString}] }) {
                id
                totalAssets
                formBalance
                previewPPS
                pricePerVaultShare
              }
            }
          `
        })
      }
    );

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching vault data:", error);
    throw error;
  }
};
