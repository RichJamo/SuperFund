import React, { useState } from "react";
import Modal from "react-modal";
import { client } from "./client";
import { useActiveWallet, useConnect, useDisconnect } from "thirdweb/react";
import { optimism } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import { useActiveAccount } from "thirdweb/react";

interface NewUserModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddUser: (username: string, walletAddress: string) => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({
  isOpen,
  onRequestClose,
  onAddUser
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const activeAccount = useActiveAccount();
  console.log("address", activeAccount?.address);

  const { connect } = useConnect({
    client,
    // account abstraction options
    accountAbstraction: {
      chain: optimism,
      sponsorGas: true,
      overrides: {
        accountSalt: username
      }
    }
  });

  const { disconnect } = useDisconnect();

  console.log("starting");
  // const smartWallet = createWallet("smart", {
  //   chain: optimism,
  //   sponsorGas: true,
  //   overrides: {
  //     accountSalt: "123456"
  //   }
  // });

  const adminWallet = useActiveWallet();

  const connectToSmartAccount = async () => {
    try {
      setIsLoading(true);
      // Ensure the wallet is initialized before using it
      if (!adminWallet) {
        throw new Error("Wallet not initialized");
      }
      const smartWallet2 = await adminWallet.connect({
        client,
        chain: optimism
      });
      console.log(smartWallet2);
      onAddUser(username, "TBD"); // Pass username and wallet address to parent component
    } catch (error) {
      console.error("Error connecting to smart account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          padding: "20px",
          backgroundColor: "#ffffff"
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }
      }}
    >
      <h2 className="text-lg font-bold mb-4 text-gray-900">Add New Client</h2>
      <div className="flex flex-col space-y-4">
        <label className="flex flex-col text-gray-800">
          <span className="mb-2 text-gray-900">Username</span>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </label>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onRequestClose}
            className="p-2 bg-gray-500 text-white rounded"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={connectToSmartAccount}
            className="p-2 bg-green-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewUserModal;
