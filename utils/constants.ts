import { createThirdwebClient, defineChain } from "thirdweb";
import { optimism } from "thirdweb/chains";

const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
console.log(CLIENT_ID)
export const client = createThirdwebClient({
  clientId: CLIENT_ID as string,
});

export const chain = defineChain(optimism);