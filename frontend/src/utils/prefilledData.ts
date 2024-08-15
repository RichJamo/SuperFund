// Define the nested tuple type for LiqRequest
type LiqRequestTuple = [
  `0x${string}`,  // txData
  string,         // token
  string,         // interimToken
  number,         // bridgeId
  bigint,         // liqDstChainId
  bigint          // nativeAmount
];

// Define the main tuple type for SingleVaultSFData
type DepositTuple = [
  bigint,             // superformId
  bigint,             // amount
  bigint,             // outputAmount
  bigint,             // maxSlippage
  LiqRequestTuple,    // liqRequest
  `0x${string}`,      // permit2data
  boolean,            // hasDstSwap
  boolean,            // retain4626
  string,             // receiverAddress
  string,             // receiverAddressSP
  `0x${string}`       // extraFormData
];


const generatePrefilledData = (): DepositTuple => {
  const data = {
    superformId: BigInt('62771017356365985756211735927334141877121434214133924007974'),
    amount: BigInt(10000),
    outputAmount: BigInt(10000),
    maxSlippage: BigInt(100),
    liqRequest: {
      txData: '0x' as `0x${string}`, // Use template literal for fixed string types
      token: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      interimToken: '0x0000000000000000000000000000000000000000',
      bridgeId: 1,
      liqDstChainId: BigInt(0),
      nativeAmount: BigInt(0),
    },
    permit2data: '0x' as `0x${string}`,
    hasDstSwap: false,
    retain4626: false,
    receiverAddress: '0xe9d7736e4e4b9db6d9dd6f25dbe34e1a0c3e1100',
    receiverAddressSP: '0xe9d7736e4e4b9db6d9dd6f25dbe34e1a0c3e1100',
    extraFormData: '0x' as `0x${string}`,
  };

  // Flatten the data into a tuple
  const depositTuple: DepositTuple = [
    data.superformId,
    data.amount,
    data.outputAmount,
    data.maxSlippage,
    [
      data.liqRequest.txData,
      data.liqRequest.token,
      data.liqRequest.interimToken,
      data.liqRequest.bridgeId,
      data.liqRequest.liqDstChainId,
      data.liqRequest.nativeAmount
    ],
    data.permit2data,
    data.hasDstSwap,
    data.retain4626,
    data.receiverAddress,
    data.receiverAddressSP,
    data.extraFormData
  ];

  return depositTuple;
};

// Example usage
export const depositTuple = generatePrefilledData();
