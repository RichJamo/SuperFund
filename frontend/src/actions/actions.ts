// actions.ts
import { Address, getContract, prepareContractCall } from "thirdweb";
import { client } from "../utils/client";
import { optimism } from "thirdweb/chains";
import { USDC_CONTRACT_ADDRESS } from "../constants";
import { AAVE_USDC_POOL_ADDRESS } from "../constants";
import { SUPERFORM_ROUTER_ADDRESS } from "../constants";
import { Account, smartWallet } from "thirdweb/wallets";
import { sendBatchTransaction, sendTransaction } from "thirdweb";
import { getBalance } from "thirdweb/extensions/erc20";
import { depositTuple } from "../utils/prefilledData";


export const handleApproveAndDeposit = async (account: Account, depositAmount: string, clientAddress: Address) => { //vaultId: string - TODO add this as an input
  console.log("got here")
  let contract = getContract({
    client,
    chain: optimism,
    address: USDC_CONTRACT_ADDRESS
  });
  const approveTx = prepareContractCall({
    contract,
    method: "function approve(address to, uint256 value)",
    params: [SUPERFORM_ROUTER_ADDRESS, BigInt(depositAmount)]
  });
  console.log("approveTx", approveTx);
  contract = getContract({
    client,
    chain: optimism,
    address: SUPERFORM_ROUTER_ADDRESS
  });
  // console.log("prefilled data", generatePrefilledData());
  console.log(depositTuple)
  const supplyTx = prepareContractCall({
    contract,
    method:
      "function singleDirectSingleVaultDeposit((uint256,uint256,uint256,uint256,(bytes,address,address,uint8,uint64,uint256),bytes,bool,bool,address,address,bytes))",
    params: [(depositTuple)]
  });
  console.log("supplyTx", supplyTx);
  const wallet = smartWallet({
    chain: optimism,
    sponsorGas: true, // enable sponsored transactions
    overrides: {
      accountAddress: clientAddress // override account address
    }
  });
  if (!account) {
    throw new Error("No active account found");
  }
  await wallet.connect({
    client: client,
    personalAccount: account
  });
  let smartAccount = wallet.getAccount();
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




// export const handleApproveAndDeposit = async (account: Account, depositAmount: string, clientAddress: Address) => { //vaultId: string - TODO add this as an input
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
//     params: [USDC_CONTRACT_ADDRESS, BigInt(depositAmount), clientAddress, 0]
//   });
//   const wallet = smartWallet({
//     chain: optimism,
//     sponsorGas: true, // enable sponsored transactions
//     overrides: {
//       accountAddress: clientAddress // override account address
//     }
//   });
//   if (!account) {
//     throw new Error("No active account found");
//   }
//   await wallet.connect({
//     client: client,
//     personalAccount: account
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

export const handleWithdrawal = async (account: Account, withdrawAmount: string, clientAddress: Address) => { //vaultId: string
  const contract = getContract({
    client,
    chain: optimism,
    address: AAVE_USDC_POOL_ADDRESS
  });
  const withdrawTx = prepareContractCall({
    contract,
    method:
      "function withdraw(address asset, uint256 amount, address to)",
    params: [USDC_CONTRACT_ADDRESS, BigInt(withdrawAmount), clientAddress] // what amount should I set here? Get balance first?
  });
  const wallet = smartWallet({
    chain: optimism,
    sponsorGas: true, // enable sponsored transactions
    overrides: {
      accountAddress: clientAddress // override account address
    }
  });
  if (!account) {
    throw new Error("No active account found");
  }
  await wallet.connect({
    client: client,
    personalAccount: account
  });
  let smartAccount = wallet.getAccount();
  if (!smartAccount) {
    throw new Error("No smart account found");
  }
  console.log(smartAccount);
  console.log("Approving and depositing...");
  const waitForReceiptOptions = await sendTransaction({
    account: smartAccount,
    transaction: withdrawTx
  });

  console.log("Transaction successful:", waitForReceiptOptions);
  return waitForReceiptOptions;
};

export const fetchUserVaultBalance = async (clientAddress: Address, vaultAddress: Address) => {
  const contract = getContract({
    client,
    chain: optimism,
    address: vaultAddress
  });
  const balance = await getBalance({
    contract,
    address: clientAddress
  });
  return balance?.displayValue;
}
