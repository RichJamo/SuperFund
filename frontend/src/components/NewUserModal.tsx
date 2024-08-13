import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { client } from "../utils/client";
import { useSendTransaction } from "thirdweb/react";
import { optimism } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { useContractEvents } from "thirdweb/react";
import { prepareEvent } from "thirdweb";
import { stringToBytes32 } from "../utils/stringToBytes32";

const DEFAULT_ACCOUNT_FACTORY = "0x85e23b94e7F5E9cC1fF78BCe78cfb15B81f0DF00";

function formatAddress(rawAddress: string): string {
  // Ensure the address starts with '0x'
  if (!rawAddress.startsWith("0x")) {
    rawAddress = "0x" + rawAddress;
  }

  // Remove leading zeros from the address
  const formattedAddress = "0x" + rawAddress.slice(-40);

  return formattedAddress;
}

const myEvent = prepareEvent({
  signature:
    "event AccountCreated(address indexed account, address indexed accountAdmin)"
});

const contract = getContract({
  client,
  chain: optimism,
  address: DEFAULT_ACCOUNT_FACTORY
});
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
  const { mutate: sendTx, data: transactionResult } = useSendTransaction();

  const activeAccount = useActiveAccount();
  if (!activeAccount) {
    throw new Error("Wallet not initialized");
  }
  console.log("address", activeAccount?.address);

  const {
    data: eventLog,
    isLoading: isEventLoading,
    error
  } = useContractEvents({
    contract,
    events: [myEvent] // ({ accountAdmin: activeAccount?.address })
  });
  console.log("contractEvents", eventLog);

  const handleCreateAccount = async () => {
    try {
      if (!activeAccount) {
        throw new Error("Wallet not initialized");
      }
      console.log("activeAccount", activeAccount?.address);
      console.log(stringToBytes32(username));
      const createAccountTx = prepareContractCall({
        contract,
        method: "function createAccount(address _admin, bytes calldata _data)",
        params: [activeAccount?.address, stringToBytes32(username)]
      });
      console.log("createAccountTx", createAccountTx);
      sendTx(createAccountTx);
      console.log("sent tx");
    } catch (error) {
      console.error("Error creating new account:", error);
      alert("Failed to create new account");
    }
  };

  const prevTransactionRef = useRef<any | null>(null);
  console.log("prev Tx", prevTransactionRef.current);

  useEffect(() => {
    if (transactionResult && transactionResult !== prevTransactionRef.current) {
      console.log("tx conditional passed", transactionResult);
      prevTransactionRef.current = transactionResult;
      if (eventLog && eventLog.length > 0) {
        console.log("event conditional passed");
        console.log("Received events:", eventLog);
        const latestEvent = eventLog[eventLog.length - 1];
        console.log("latestEvent", latestEvent);
        if (latestEvent && latestEvent.topics[1]) {
          onAddUser(username, formatAddress(latestEvent.topics[1]));
          onRequestClose();
        }
      }
    }
  }, [eventLog, transactionResult]);

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
            onClick={handleCreateAccount}
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

// useEffect(() => {
//   if (transactionResult && data) {
//     console.log("transactionResult", transactionResult);
//     alert("Transaction succeeded");
//     // if (!activeAccount) {
//     //   throw new Error("Wallet not initialized");
//     // }
//     // const contract = getContract({
//     //   client,
//     //   address: DEFAULT_ACCOUNT_FACTORY,
//     //   chain: optimism
//     // });

//     // const { data, isLoading: isContractLoading } = useReadContract({
//     //   contract,
//     //   method:
//     //     "function getAddress(address _adminSigner, bytes32 data) public view returns (address)",
//     //   params: [activeAccount?.address, `0x${username}`]
//     // });
//     // console.log("data", data);
//     // if (!data) {
//     //   throw new Error("Wallet address not returned");
//     // }
//     if (!data) {
//       throw new Error("Wallet address not returned");
//     }
//     onAddUser(username, data); // Pass username and wallet address to parent component
//   }
// }, [transactionResult, data]);

// const connectToSmartAccount = async () => {
//   try {
//     setIsLoading(true);
//     // Ensure the wallet is initialized before using it
//     if (!adminWallet) {
//       throw new Error("Wallet not initialized");
//     }
//     const smartWallet2 = await adminWallet.connect({
//       client,
//       chain: optimism
//     });
//     console.log(smartWallet2);
//     onAddUser(username, "TBD"); // Pass username and wallet address to parent component
//   } catch (error) {
//     console.error("Error connecting to smart account:", error);
//   } finally {
//     setIsLoading(false);
//   }
// };
