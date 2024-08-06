// src/utils/superform.ts
import { ethers } from 'ethers';
import superformRouterABI from '../abis/SuperformRouter.json'; // Adjust the path as necessary

// Replace with your SuperformRouter contract address
const SUPERFORM_ROUTER_ADDRESS = '0xa195608C2306A26f727d5199D5A382a4508308DA';

// Create a function to get the SuperformRouter contract instance
export const getSuperformRouterContract = (signer: ethers.Signer) => {
  return new ethers.Contract(SUPERFORM_ROUTER_ADDRESS, superformRouterABI, signer);
};

// Example function to deposit into a vault
export const depositToVault = async (vaultAddress: string, amount: string, signer: ethers.Signer) => {
  const contract = getSuperformRouterContract(signer);
  const tx = await contract.deposit(vaultAddress, ethers.parseUnits(amount, 'ether'));
  await tx.wait(); // Wait for the transaction to be mined
  return tx;
};

// Example function to withdraw from a vault
export const withdrawFromVault = async (vaultAddress: string, amount: string, signer: ethers.Signer) => {
  const contract = getSuperformRouterContract(signer);
  const tx = await contract.withdraw(vaultAddress, ethers.parseUnits(amount, 'ether'));
  await tx.wait(); // Wait for the transaction to be mined
  return tx;
};
