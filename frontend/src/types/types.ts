import { ThirdwebClient } from "thirdweb";
import { ChainOptions } from "thirdweb/chains";
export interface Vault {
  id: string;
  chain: string;
  protocol: string;
  name: string;
  totalAssets: string;
  apy7d: string;
  userBalance?: string; // Add userBalance field for optional data
}

export interface NewUserModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddUser: (username: string, walletAddress: string) => void;
  username?: string; // Optional if you want to pass the username directly to the view
  isLoading?: boolean; // Optional if you want to pass the loading state to the view
  onChangeUsername?: (username: string) => void; // Optional if you want to pass the handler to update the username
  onCreateAccount?: () => void; // Optional if you want to pass the handler to create the account
}

export interface PermitSingle {
  details: {
    token: string;
    amount: string;
    expiration: number;
    nonce: number;
  };
  spender: string;
  sigDeadline: number;
}

export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}
export interface Rate {
  id: string;
  type: string;
  rate: string;
}

export interface VaultData {
  id: string;
  inputToken: {
    symbol: string;
    decimals: number;
  };
  name: string;
  rates: Rate[];
  totalValueLockedUSD: string;
}

export interface FormattedVault {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  protocol: string;
  totalAssets: string;
  previewPPS: string;
  pricePerVaultShare: string;
  apy7d: string;
  userBalance: string;
}
// Define the shape of individual user data
export interface User {
  walletAddress: string;
  managerAddress: string;
}

// Define a map where the key is a string and the value is a User
export type UserMap = { [username: string]: User };

export interface TransactionResult {
  readonly transactionHash: `0x${string}`;
  client: ThirdwebClient;
  chain: Readonly<ChainOptions & { rpc: string }>;
  maxBlocksWaitTime?: number;
}