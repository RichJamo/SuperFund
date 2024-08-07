// src/utils/superform.ts
import { ethers } from 'ethers';
import superformRouterABI from '../abis/SuperformRouter.json'; // Adjust the path as necessary

const SUPERFORM_ROUTER_ADDRESS = '0xa195608C2306A26f727d5199D5A382a4508308DA';

// Get SuperformRouter contract instance
export const getSuperformRouterContract = (signer: ethers.Signer) => {
  return new ethers.Contract(SUPERFORM_ROUTER_ADDRESS, superformRouterABI, signer);
};

// Example function to deposit into a vault using singleDirectSingleVaultDeposit
export const depositToVault = async (
  superformData: any, // You need to structure this object according to the ABI
  signer: ethers.Signer
) => {
  const contract = getSuperformRouterContract(signer);
  console.log(contract)
  const tx = await contract.singleDirectSingleVaultDeposit((superformData));
  await tx.wait(); // Wait for the transaction to be mined
  return tx;
};

// Example function to withdraw from a vault using singleDirectSingleVaultWithdraw
export const withdrawFromVault = async (
  req: any, // You need to structure this object according to the ABI
  signer: ethers.Signer
) => {
  const contract = getSuperformRouterContract(signer);
  
  const tx = await contract.singleDirectSingleVaultWithdraw(req, {
    value: ethers.parseUnits(req.amount, 'ether'), // Provide the correct value if required
  });
  await tx.wait(); // Wait for the transaction to be mined
  return tx;
};
