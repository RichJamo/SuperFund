import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { optimism } from "thirdweb/chains";
// import ERC20ABI from "./ERC20ABI.json"
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
console.log(CLIENT_ID)
export const client = createThirdwebClient({
  clientId: CLIENT_ID as string,
});

export const chain = defineChain(optimism);

const usdcAddress = '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'; // USDC contract address on Optimism mainnet
    // Minimal ERC-20 ABI, just enough to get the balanceOf function
const ERC20ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "implementationContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "previousAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "AdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "implementation",
        "type": "address"
      }
    ],
    "name": "Upgraded",
    "type": "event"
  },
  { "stateMutability": "payable", "type": "fallback" },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newAdmin", "type": "address" }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "implementation",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      }
    ],
    "name": "upgradeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newImplementation",
        "type": "address"
      },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "upgradeToAndCall",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

// export const CONTRACT = getContract({
//   client: client,
//   chain: chain,
//   address: usdcAddress,
//   abi: ERC20ABI
// })