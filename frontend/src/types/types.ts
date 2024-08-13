// types.ts
export interface Vault {
  id: string;
  chain: string;
  protocol: string;
  name: string;
  totalAssets: string;
  apy7d: string;
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
