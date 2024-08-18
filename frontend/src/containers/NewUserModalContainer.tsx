import React, { useState, useEffect, useRef } from "react";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import NewUserModalView from "../components/NewUserModalView";
import { useContractSetup, useCreateAccount } from "../hooks/hooks";
import { getWalletAddressOnceCreated } from "../utils/utils";
import { NewUserModalProps } from "../types/types";

const NewUserModalContainer: React.FC<NewUserModalProps> = ({
  isOpen,
  onRequestClose,
  onAddUser
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { contract, myEvent } = useContractSetup();
  const activeAccount = useActiveAccount();

  const { createAccount, transactionResult } = useCreateAccount(
    contract,
    activeAccount
  );

  const { data: eventLog } = useContractEvents({
    contract,
    events: [myEvent]
  });
  console.log("EventLog:", eventLog);

  const prevTransactionRef = useRef<any | null>(null);
  console.log(transactionResult);

  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      createAccount(username);
    } catch (error) {
      console.error("Error creating new account:", error);
      alert("Failed to create new account");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const walletAddress = getWalletAddressOnceCreated(
      eventLog,
      transactionResult,
      prevTransactionRef
    );
    if (walletAddress) {
      onAddUser(username, walletAddress);
      onRequestClose();
    }
  }, [eventLog, transactionResult]);

  return (
    <NewUserModalView
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      username={username}
      isLoading={isLoading}
      onChangeUsername={setUsername}
      onCreateAccount={handleCreateAccount}
      onAddUser={onAddUser}
    />
  );
};

export default NewUserModalContainer;
