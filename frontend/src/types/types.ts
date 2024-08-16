// types.ts
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

export interface UserData {
  [username: string]: string;
}