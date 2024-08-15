// Define the nested tuple type for LiqRequest
type LiqRequestTuple = [
  `0x${string}`,  // txData - bytes
  string,         // token - address
  string,         // interimToken - address
  number,         // bridgeId - uint8
  bigint,         // liqDstChainId - uint64
  bigint          // nativeAmount - uint256
];

// Define the main tuple type for SingleVaultSFData
type DepositTuple = [[
  bigint,             // superformId - uint256
  bigint,             // amount - uint256
  bigint,             // outputAmount - uint256
  bigint,             // maxSlippage - uint256
  LiqRequestTuple,    // liqRequest
  `0x${string}`,      // permit2data - bytes
  boolean,            // hasDstSwap - bool
  boolean,            // retain4626 - bool
  string,             // receiverAddress - address
  string,             // receiverAddressSP - address
  `0x${string}`       // extraFormData - bytes
]];

export const generatePrefilledData = (): DepositTuple => {
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
    permit2data: "0x" as `0x${string}`,
    hasDstSwap: false,
    retain4626: true,
    receiverAddress: '0xAB75E66C63307396FE8456Ea7c42CBBF3CF36298',
    receiverAddressSP: '0xAB75E66C63307396FE8456Ea7c42CBBF3CF36298',
    extraFormData: '0x' as `0x${string}`,
  };

  // Flatten the data into a tuple
  const depositTuple: DepositTuple =[[
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
  ]];

  return depositTuple;
};


