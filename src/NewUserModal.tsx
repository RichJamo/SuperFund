import React, { useState } from "react";
import Modal from "react-modal";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";
import { client } from "./client";
import { smartWallet, createWallet } from "thirdweb/wallets";
import { Sepolia } from "@thirdweb-dev/chains";

// Initialize Thirdweb SDK
const sdk = new ThirdwebSDK("optimism");

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

  const handleAddClick = async () => {
    if (username) {
      setIsLoading(true);
      try {
        const wallet = createWallet("io.metamask");
        console.log(wallet);
        // connect the wallet, this returns a promise that resolves to the connected account
        const account = await wallet.connect({
          // pass the client you created with `createThirdwebClient()`
          client
        });
        console.log(account);
        // Configure the smart wallet
        const newSmartWallet = smartWallet({
          chain: Sepolia,
          sponsorGas: true
        });
        console.log(newSmartWallet);
        // Connect the smart wallet
        const smartAccount = await newSmartWallet.connect({
          client,
          account
        });

        // Add the new user with the newly created wallet address
        onAddUser(username, smartWallet.address);

        // Close the modal
        onRequestClose();
      } catch (error) {
        console.error("Error creating wallet or adding user:", error);
        alert("Failed to create wallet or add user.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please enter a username");
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
            onClick={handleAddClick}
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
