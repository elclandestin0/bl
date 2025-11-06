import { ethers } from "ethers";
import CoreAbi from "../abi/LendingCore.json";

export function getProvider(rpc: string) {
  return new ethers.JsonRpcProvider(rpc);
}

export function getCore(provider: ethers.Provider, address: string) {
  return new ethers.Contract(address, (CoreAbi as any).abi, provider);
}
