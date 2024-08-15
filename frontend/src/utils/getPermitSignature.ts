import { ethers } from 'ethers';
import { USDC_CONTRACT_ADDRESS } from '../constants';
import { SUPERFORM_ROUTER_ADDRESS } from '../constants';
import { PERMIT2_CONTRACT_ADDRESS } from '../constants';

const hardcoded_user_address = '0xe9d7736e4e4b9db6d9dd6f25dbe34e1a0c3e1100';

// Define your variables
const provider = new ethers.providers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
const tokenAddress = USDC_CONTRACT_ADDRESS;
const spenderAddress = SUPERFORM_ROUTER_ADDRESS;
const chainId = 10;

const PERMIT2_ABI = [
  'function nonceBitmap(address owner, uint256 wordPos) view returns (uint256)',
];

const permit2Contract = new ethers.Contract(PERMIT2_CONTRACT_ADDRESS, PERMIT2_ABI, provider);

async function getNextNonce(userAddress: string): Promise<number> {
  // For the sake of this example, we assume the nonce is in the first 256 bits
  const wordPos = 0; // The bit mask is represented as a single 256-bit word
  const nonceBitmap = await permit2Contract.nonceBitmap(userAddress, wordPos);

  // Find the lowest unused nonce
  let nonce = 0;
  while ((nonceBitmap & (1 << nonce)) !== 0) {
    nonce++;
  }
  return nonce;
}

const next_valid_nonce = await getNextNonce(hardcoded_user_address);

// Define the PermitSingle structure
const PERMIT_EXPIRATION = Math.floor((Date.now() + 1000 * 60 * 60 * 24 * 30) / 1000); // 30 days
const PERMIT_SIG_EXPIRATION = Math.floor((Date.now() + 1000 * 60 * 30) / 1000); // 30 minutes

const permitSingle = {
  details: {
    token: tokenAddress,
    amount: ethers.constants.MaxUint256.toString(),
    expiration: PERMIT_EXPIRATION,
    nonce: next_valid_nonce,
  },
  spender: spenderAddress,
  sigDeadline: PERMIT_SIG_EXPIRATION,
};

// Define TypeScript interfaces
interface PermitSingle {
  details: {
    token: string;
    amount: string;
    expiration: number;
    nonce: number;
  };
  spender: string;
  sigDeadline: number;
}

interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

// Sign the PermitSingle data
async function signPermitData(permitSingle: PermitSingle): Promise<string> {
  const domain: Domain = {
    name: 'Permit2',
    version: '1',
    chainId: chainId,
    verifyingContract: PERMIT2_CONTRACT_ADDRESS,
  };

  const types = {
    PermitSingle: [
      { name: 'details', type: 'PermitDetails' },
      { name: 'spender', type: 'address' },
      { name: 'sigDeadline', type: 'uint256' },
    ],
    PermitDetails: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'expiration', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
    ],
  };

  const value = {
    details: permitSingle.details,
    spender: permitSingle.spender,
    sigDeadline: permitSingle.sigDeadline,
  };

  const signer = provider.getSigner();
  const signature = await signer._signTypedData(domain, types, value);
  return signature;
}

// Example of signing permit data
signPermitData(permitSingle).then((signature) => {
  console.log('Signature:', signature);
}).catch((error) => {
  console.error('Error signing permit data:', error);
});
