export const generatePrefilledData = () => {
  return {
    superformId: '62771017356365985756211735927334141877121434214133924007974',
    amount: 1000000,
    outputAmount: 1000000,
    maxSlippage: 50,
    liqRequest: {
      txData: '0x',
      token: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      interimToken: '0x0000000000000000000000000000000000000000',
      bridgeId: 1,
      liqDstChainId: 0,
      nativeAmount: 0,
    },
    permit2data: '0x', //this is not zero in my example?
    hasDstSwap: false,
    retain4626: false,
    receiverAddress: '0xDd704A44866AE9C387CfC687fa642a222b84f0D3',
    receiverAddressSP: '0xDd704A44866AE9C387CfC687fa642a222b84f0D3',
    extraFormData: '0x',
  };
};
