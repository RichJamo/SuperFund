// FundManager.tsx
import React from "react";
import { useActiveAccount } from "thirdweb/react";

const FundManager: React.FC = () => {
  const account = useActiveAccount();

  if (!account) {
    return <div>Please connect your wallet to view this page.</div>;
  }

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <VaultList /> {/* Replace this with actual implementation */}
      </div>
    </main>
  );
};

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-6 text-zinc-100">
        Fund Manager
      </h1>
    </header>
  );
}

// Dummy VaultList component - replace with your actual implementation
const VaultList: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Your Vaults</h2>
      {/* Add logic to display vaults */}
    </div>
  );
};

export default FundManager;
