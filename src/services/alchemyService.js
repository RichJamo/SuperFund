import { Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: 'eth-mainnet',
};

const alchemy = new Alchemy(settings);

export const getSmartWalletDetails = async (address) => {
  return await alchemy.core.getBalance(address);
};
