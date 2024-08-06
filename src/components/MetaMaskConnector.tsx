// src/MetaMaskConnector.tsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MetaMaskConnector: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', () => window.location.reload());
      // Automatically try to connect if an account is already available
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            handleAccountChange(accounts[0]);
          }
        });
    }
  }, []);

  const handleAccountChange = async (account: string) => {
    setAccount(account);
    // Fetch the balance for the connected account
    const provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_PROJECT_ID}`
    );
    const balance = await provider.getBalance(account);
    setBalance(ethers.formatEther(balance));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        handleAccountChange(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div className="mb-4">
      {account ? (
        <div>
          <p className="text-lg font-semibold">Connected Account: {account}</p>
          <p className="text-lg">Balance: {balance} ETH</p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Connect to MetaMask
        </button>
      )}
    </div>
  );
};

export default MetaMaskConnector;
