import React, { useState, useEffect, useRef } from "react";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import NewUserModalView from "../components/NewUserModalView";
import { useContractSetup } from "../hooks/hooks";
import { useCreateAccount } from "../hooks/hooks";
import { handleEventLog } from "../utils/utils";
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

  const prevTransactionRef = useRef<any | null>(null);

  useEffect(() => {
    handleEventLog(
      eventLog,
      transactionResult,
      prevTransactionRef,
      onAddUser,
      onRequestClose,
      username
    );
  }, [eventLog, transactionResult]);

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

  return (
    <NewUserModalView
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      username={username}
      isLoading={isLoading}
      onChangeUsername={setUsername}
      onCreateAccount={handleCreateAccount}
    />
  );
};

export default NewUserModalContainer;
