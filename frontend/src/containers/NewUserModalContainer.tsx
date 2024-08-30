import React, { useState, useEffect, useCallback } from "react";
import { useActiveAccount, useContractEvents } from "thirdweb/react";
import NewUserModalView from "../components/NewUserModalView";
import { useContractSetup, useCreateAccount } from "../hooks/hooks";
import { getWalletAddressOnceCreated } from "../utils/utils";
import { NewUserModalProps, TransactionResult } from "../types/types";

const NewUserModalContainer: React.FC<NewUserModalProps> = ({
  isOpen,
  onRequestClose,
  onAddUser,
}) => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [prevTransaction, setPrevTransaction] =
    useState<TransactionResult | null>(null);

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
    events: [myEvent],
  });

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
    const address = getWalletAddressOnceCreated(
      eventLog,
      transactionResult,
      prevTransaction,
      updatePrevTransaction
    );
    if (address) {
      console.log("1st effect for creating wallet address");
      setWalletAddress(address);
    }
  }, [eventLog, transactionResult, updatePrevTransaction, walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      console.log("2nd effect for creating wallet address");
      onAddUser(username, walletAddress);
      onRequestClose();
    }
  }, [walletAddress]);

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
