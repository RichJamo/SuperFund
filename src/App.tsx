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
  const [activeSection, setActiveSection] = useState<"vaults" | "clients">(
    "vaults"
  );

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

  // Mock function to fetch USDC balance (replace with actual logic)
  const fetchUSDCBalance = (walletAddress: string) => {
    return "1000 USDC"; // Replace with actual balance retrieval logic
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex container max-w-screen-lg mx-auto">
      {account && (
        <nav className="w-3/8 bg-gray-800 text-white p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tighter text-zinc-100">
              SuperFund
            </h1>
          </div>
          <ul className="space-y-4">
            <li
              className={`cursor-pointer ${
                activeSection === "clients" ? "font-bold" : ""
              }`}
              onClick={() => setActiveSection("clients")}
            >
              My Clients
            </li>
            <li
              className={`cursor-pointer ${
                activeSection === "vaults" ? "font-bold" : ""
              }`}
              onClick={() => setActiveSection("vaults")}
            >
              Vaults
            </li>
          </ul>
        </nav>
      )}
      <div className="flex-1 py-20 pl-6">
        {!account && <Header />}
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
              {activeSection === "clients" && (
                <>
                  <h2 className="text-xl font-bold mb-4">My Clients</h2>
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Username</th>
                        <th className="py-2 px-4 border-b">Wallet Address</th>
                        <th className="py-2 px-4 border-b">USDC Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usernames.map(username => (
                        <tr key={username}>
                          <td className="py-2 px-4 border-b">{username}</td>
                          <td className="py-2 px-4 border-b">
                            {userMap[username]}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {fetchUSDCBalance(userMap[username])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                </>
              )}
              {activeSection === "vaults" && (
                <>
                  <h2 className="text-xl font-bold mb-4">Selected Client</h2>
                  <Dropdown
                    usernames={usernames}
                    selectedUsername={selectedUsername}
                    onSelect={username => setSelectedUsername(username)}
                  />
                  <VaultList className="mt-8" />
                </>
              )}
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
        Please connect your wallet to get started.
      </p>
    </header>
  );
}
