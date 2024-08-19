import React, { useState, useEffect, useCallback } from "react";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import NewUserModalView from "../components/NewUserModalView";
import { useContractSetup, useCreateAccount } from "../hooks/hooks";
import { getWalletAddressOnceCreated } from "../utils/utils";
import { NewUserModalProps, TransactionResult } from "../types/types";

const NewUserModalContainer: React.FC<NewUserModalProps> = ({
  isOpen,
  onRequestClose,
  onAddUser
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { contract, myEvent } = useContractSetup();
  const activeAccount = useActiveAccount();
  if (!activeAccount) {
    throw new Error("No active account found");
  }

  const { createAccount, transactionResult } = useCreateAccount(
    contract,
    activeAccount
  );

  const { data: eventLog } = useContractEvents({
    contract,
    events: [myEvent]
  });

  const [
    prevTransaction,
    setPrevTransaction
  ] = useState<TransactionResult | null>(null);

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

  const updatePrevTransaction = useCallback(
    (newTransaction: TransactionResult | null) => {
      setPrevTransaction(newTransaction);
    },
    []
  );

  useEffect(() => {
    const walletAddress = getWalletAddressOnceCreated(
      eventLog,
      transactionResult,
      updatePrevTransaction
    );
    if (walletAddress) {
      onAddUser(username, walletAddress);
      onRequestClose();
    }
  }, [eventLog, transactionResult, updatePrevTransaction]);

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
