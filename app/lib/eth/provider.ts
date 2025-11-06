import { ethers } from "ethers";

export async function getBrowserProvider() {
  if (typeof window === "undefined") throw new Error("No window");
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No injected provider (install MetaMask)");
  return new ethers.BrowserProvider(eth);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return provider.getSigner();
}

export async function getChainId(): Promise<number> {
  const provider = await getBrowserProvider();
  const { chainId } = await provider.getNetwork();
  return Number(chainId);
}
