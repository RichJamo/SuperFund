const getWallet = async (userId:string) => {
  try {
    const personalWallet = new LocalWallet()
    await personalWallet.generate()
    const config = {
      chain: PolygonAmoyTestnet,
      factoryAddress: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS) as string,
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      gasless: true,
      personalWallet: personalWallet
    }
    const wallet = new SmartWallet(config)
    await wallet.connect({
      personalWallet,
    })
    const walletAddress = await wallet.getAddress()
    console.log("wallet", walletAddress)
    const userData = new TextEncoder().encode(userId)
    const sdk = await ThirdwebSDK.fromWallet(wallet, PolygonAmoyTestnet)
    const contract = await sdk.getContract(config.factoryAddress)
    const account = await contract.call("createAccount", [walletAddress, userData])
    console.log("Conta criada:", account)
  } catch (error) {
    console.log(error)
  }
}