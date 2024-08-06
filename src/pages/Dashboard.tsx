import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import provider from '../utils/ethers';
import { depositToVault } from '../utils/superform.ts';

const Dashboard: React.FC = () => {
  const [vaults, setVaults] = useState<any[]>([]); // Replace `any` with a proper type if possible
  const [selectedVault, setSelectedVault] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const getSigner = async () => {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const signer = provider.getSigner();
      setSigner(signer);
    };

    getSigner();
  }, []);

  const handleDeposit = async () => {
    if (!selectedVault || !amount || !signer) return;

    try {
      const tx = await depositToVault(selectedVault, amount, signer);
      console.log('Transaction successful:', tx);
    } catch (error) {
      console.error('Error making deposit:', error);
    }
  };

  return (
    <div>
      <h1>Vault Dashboard</h1>
      <select
        onChange={(e) => setSelectedVault(e.target.value)}
        value={selectedVault}
      >
        {vaults.map((vault) => (
          <option key={vault.address} value={vault.address}>
            {vault.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleDeposit}>Deposit</button>
    </div>
  );
};

export default Dashboard;
