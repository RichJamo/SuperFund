import { Address, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { USDC_CONTRACT_ADDRESS, AAVE_USDC_POOL_ADDRESS, SUPERFORM_ROUTER_ADDRESS, PERMIT2_CONTRACT_ADDRESS } from "../constants";
import { Account, smartWallet } from "thirdweb/wallets";
import { getBalance } from "thirdweb/extensions/erc20";
import { generatePrefilledData } from "../utils/prefilledData";

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
  let smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  
  console.log("Approving");
  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: approveTx
  });

  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
}

export const handleDeposit = async (EOAaccount: Account, depositAmount: BigInt, clientSmartAccountAddress: Address) => {
  let smartAccount = await connectClientSmartAccount(EOAaccount, clientSmartAccountAddress);
  if (!smartAccount) {
    throw new Error("No smart account found");
  }
  console.log(smartAccount);

  const contract = getContract({
    client,
    chain: optimism,
    address: SUPERFORM_ROUTER_ADDRESS
  });

  const depositTuple = generatePrefilledData();
  console.log(depositTuple);

  const supplyTx = prepareContractCall({
    contract,
    method: "function singleDirectSingleVaultDeposit(struct)",
    params: [depositTuple]
  });

  console.log("supplyTx", supplyTx);

  console.log("Depositing...");

  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: supplyTx
  });

  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
};



// export const handleDeposit = async (EOAaccount: Account, depositAmount: string, clientSmartAccountAddress: Address) => { //vaultId: string - TODO add this as an input
//   console.log("got here")
//   let contract = getContract({
//     client,
//     chain: optimism,
//     address: USDC_CONTRACT_ADDRESS
//   });
//   const approveTx = prepareContractCall({
//     contract,
//     method: "function approve(address to, uint256 value)",
//     params: [AAVE_USDC_POOL_ADDRESS, BigInt(depositAmount)]
//   });
//   contract = getContract({
//     client,
//     chain: optimism,
//     address: AAVE_USDC_POOL_ADDRESS
//   });
//   const supplyTx = prepareContractCall({
//     contract,
//     method:
//       "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
//     params: [USDC_CONTRACT_ADDRESS, BigInt(depositAmount), clientSmartAccountAddress, 0]
//   });
//   const wallet = smartWallet({
//     chain: optimism,
//     sponsorGas: true, // enable sponsored transactions
//     overrides: {
//       accountAddress: clientSmartAccountAddress // override account address
//     }
//   });
//   if (!EOAaccount) {
//     throw new Error("No active account found");
//   }
//   await wallet.connect({
//     client: client,
//     personalAccount: EOAaccount
//   });
//   let smartAccount = wallet.getAccount();
//   if (!smartAccount) {
//     throw new Error("No smart account found");
//   }
//   console.log(smartAccount);
//   console.log("Approving and depositing...");
//   const waitForReceiptOptions = await sendBatchTransaction({
//     account: smartAccount,
//     transactions: [approveTx, supplyTx]
//   });

//   console.log("Transaction successful:", waitForReceiptOptions);
//   return waitForReceiptOptions;
// };

export const handleWithdrawal = async (EOAaccount: Account, withdrawAmount: string, clientSmartAccountAddress: Address) => { //vaultId: string
  const contract = getContract({
    client,
    chain: optimism,
    address: AAVE_USDC_POOL_ADDRESS
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
  const balance = await getBalance({
    contract,
    address: clientSmartAccountAddress
  });
  return balance?.displayValue;
}
