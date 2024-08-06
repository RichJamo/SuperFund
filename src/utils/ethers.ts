import { ethers } from 'ethers';

// Detect MetaMask and connect to it
const provider = new ethers.BrowserProvider(window.ethereum as any);

let signer: ethers.Signer;

const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed.');
  }
  // Request account access if needed
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  signer = provider.getSigner();
  return signer;
};

export { provider, getSigner };
