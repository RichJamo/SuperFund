import { Address, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { USDC_CONTRACT_ADDRESS, AAVE_USDC_POOL_ADDRESS, SUPERFORM_ROUTER_ADDRESS, PERMIT2_CONTRACT_ADDRESS } from "../constants";
import { Account, smartWallet } from "thirdweb/wallets";
import { getBalance } from "thirdweb/extensions/erc20";
import { sendBatchTransaction, readContract } from "thirdweb";

const connectClientSmartAccount = async (EOAaccount: Account, ClientSmartAccountAddress: Address) => {
  const wallet = smartWallet({
    chain: optimism,
    sponsorGas: true,
    overrides: {
      accountAddress: ClientSmartAccountAddress // specify account address of client
    }
  });
  if (!EOAaccount) {
    throw new Error("No active EOAaccount found");
  }
  await wallet.connect({
    client: client,
    personalAccount: EOAaccount
  });
  let smartAccount = wallet.getAccount();
  if (!smartAccount) {
    throw new Error("No smart account found");
  }
  return smartAccount;
}

export const handleapprovePermit2 = async (EOAaccount: Account, clientSmartAccountAddress:Address ) => {
  let contract = getContract({
    client,
    chain: optimism,
    address: PERMIT2_CONTRACT_ADDRESS
  });
  const expiration = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now
  const amount = 1000000000n;

  const approveTx = prepareContractCall({
    contract,
    method: "function approve(address token, address spender, uint160 amount, uint48 expiration)",
    params: [USDC_CONTRACT_ADDRESS, SUPERFORM_ROUTER_ADDRESS, amount, expiration]
  });
  let smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  console.log("Approving");
  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: approveTx
  });
  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
}

export const handleApprove = async (EOAaccount: Account, clientSmartAccountAddress: Address ) => {
  let contract = getContract({
    client,
    chain: optimism,
    address: USDC_CONTRACT_ADDRESS
  });
  const amount = 1000000000n;

  const approveTx = prepareContractCall({
    contract,
    method: "function approve(address spender, uint256 amount)",
    params: [SUPERFORM_ROUTER_ADDRESS, amount]
  });
  const smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  
  console.log("Approving");
  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: approveTx
  });

  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
}

export const handleDeposit = async (vaultId: Address, EOAaccount: Account, transactionAmount: bigint, clientSmartAccountAddress: Address) => {
  let contract = getContract({
    client,
    chain: optimism,
    address: vaultId
  });
  const poolAddress = await readContract({
    contract: contract,
    method: 'function POOL() view returns (address pool)'
  });
  console.log(poolAddress);

  contract = getContract({
    client,
    chain: optimism,
    address: USDC_CONTRACT_ADDRESS
  });
  const approveTx = prepareContractCall({
    contract,
    method: "function approve(address to, uint256 value)",
    params: [poolAddress, transactionAmount]
  });
  contract = getContract({
    client,
    chain: optimism,
    address: poolAddress
  });
  const supplyTx = prepareContractCall({
    contract,
    method:
      "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
    params: [USDC_CONTRACT_ADDRESS, transactionAmount, clientSmartAccountAddress, 0] // use a referral code?
  });
  const smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  if (!smartAccount) {
    throw new Error("No smart account found");
  }
  console.log(smartAccount);
  console.log("Approving and depositing...");
  const waitForReceiptOptions = await sendBatchTransaction({
    account: smartAccount,
    transactions: [approveTx, supplyTx]
  });
  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
};

export const handleWithdrawal = async (vaultId: Address, EOAaccount: Account, withdrawAmount: bigint, clientSmartAccountAddress: Address) => { //vaultId: string
  let contract = getContract({
    client,
    chain: optimism,
    address: vaultId
  });
  const poolAddress = await readContract({
    contract: contract,
    method: 'function POOL() view returns (address pool)'
  });
  contract = getContract({
    client,
    chain: optimism,
    address: poolAddress
  });
  const withdrawTx = prepareContractCall({
    contract,
    method:
      "function withdraw(address asset, uint256 amount, address to)",
    params: [USDC_CONTRACT_ADDRESS, BigInt(withdrawAmount), clientSmartAccountAddress] // what amount should I set here? Get balance first?
  });
  
  let smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  if (!smartAccount) {
    throw new Error("No smart account found");
  }
  console.log(smartAccount);
  console.log("Withdrawing...");
  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: withdrawTx
  });

  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
};

export const fetchUserVaultBalance = async (clientSmartAccountAddress: Address, vaultAddress: Address) => {
  const contract = getContract({
    client,
    chain: optimism,
    address: vaultAddress
  });
  console.log(clientSmartAccountAddress)
  const balance = await getBalance({
    contract,
    address: clientSmartAccountAddress
  });
  console.log(balance)
  return balance?.displayValue;
}
