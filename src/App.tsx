import React from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";
import VaultList from "./VaultList";

export function App() {
  const account = useActiveAccount();

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <div className="flex justify-center mb-20">
          {!account ? (
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example app",
                url: "https://example.com"
              }}
            />
          ) : (
            <VaultList />
          )}
        </div>
      </div>
    </main>
  );
}

function Header() {
  const account = useActiveAccount();

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <img
        src={thirdwebIcon}
        alt=""
        className="size-[150px] md:size-[150px]"
        style={{
          filter: "drop-shadow(0px 0px 24px #a726a9a8)"
        }}
      />

      <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-6 text-zinc-100">
        SuperFund
      </h1>

      <p className="text-zinc-300 text-base">
        {account
          ? "Here are your vaults."
          : "Please connect your wallet to get started."}
      </p>
    </header>
  );
}
