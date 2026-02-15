// Etherlink Shadownet Testnet Configuration

export const ETHERLINK_RPC = "https://node.shadownet.etherlink.com";

export const ETHERLINK_NETWORK = {
  chainId: "0x1F34F", // 127823 in hex (Etherlink Shadownet Testnet)
  chainName: "Etherlink Shadownet Testnet",
  nativeCurrency: {
    name: "Tez",
    symbol: "XTZ",
    decimals: 18,
  },
  rpcUrls: [ETHERLINK_RPC],
  blockExplorerUrls: ["https://shadownet.explorer.etherlink.com"],
};

/**
 * Check if user is on Etherlink Shadownet network
 */
export async function checkEtherlinkNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    return false;
  }

  try {
    const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
    const chainIdNum = parseInt(chainId, 16);
    return chainIdNum === 127823;
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
}

/**
 * Switch to Etherlink Shadownet network
 */
export async function switchToEtherlinkNetwork(): Promise<boolean> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not installed");
  }

  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ETHERLINK_NETWORK.chainId }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [ETHERLINK_NETWORK],
        });
        return true;
      } catch (addError) {
        console.error("Error adding Etherlink network:", addError);
        throw addError;
      }
    }
    throw switchError;
  }
}
