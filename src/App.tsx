import React, { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import thirdwebIcon from "./thirdweb.svg";
import { client } from "./client";
import VaultList from "./VaultList";
import Dropdown from "./Dropdown";
import NewUserModal from "./NewUserModal";
import usersData from "./data/users.json";
import Modal from "react-modal";

// Set the root element where your app is rendered
Modal.setAppElement("#root");

export function App() {
  const account = useActiveAccount();
  const [usernames, setUsernames] = useState<string[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize usernames and userMap from data file
    const usernameList = usersData.map(user => user.username);
    const walletMap = usersData.reduce(
      (map: { [key: string]: string }, user) => {
        map[user.username] = user.walletAddress;
        return map;
      },
      {}
    );

    setUsernames(usernameList);
    setUserMap(walletMap);
  }, []);

  const handleAddUser = (username: string, walletAddress: string) => {
    setUsernames(prev => [...prev, username]);
    setUserMap(prev => ({ ...prev, [username]: walletAddress }));
    setIsModalOpen(false);
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <Header />
        <div className="flex flex-col items-center mb-20">
          {!account ? (
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example app",
                url: "https://example.com"
              }}
            />
          ) : (
            <>
              <Dropdown
                usernames={usernames}
                selectedUsername={selectedUsername}
                onSelect={username => setSelectedUsername(username)}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 bg-green-500 text-white rounded mt-4"
              >
                New Client
              </button>
              <NewUserModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onAddUser={handleAddUser}
              />
              <div className="mt-4">
                {selectedUsername && (
                  <div>
                    <h2>Details for {selectedUsername}</h2>
                    <p>Wallet Address: {userMap[selectedUsername]}</p>
                    {/* Display more details as needed */}
                  </div>
                )}
              </div>
              <VaultList className="mt-8" />
            </>
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
