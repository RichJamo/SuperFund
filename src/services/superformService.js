import { ethers } from 'ethers';
import superformRouterAbi from '../../abi/SuperformRouter.json';

const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_ALCHEMY_API_KEY);
const superformRouter = new ethers.Contract(process.env.REACT_APP_SUPERFORM_ROUTER_ADDRESS, superformRouterAbi, provider);

export const depositToVault = async (investorAddress, vaultAddress, amount) => {
  const tx = await superformRouter.deposit(vaultAddress, amount, { from: investorAddress });
  await tx.wait();
  return tx;
};
