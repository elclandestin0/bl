import { ethers } from "ethers";
import CoreAbi from "./abis/LendingCore.json";
import { getSigner, getChainId } from "../provider";
import { ADDRESSES } from "./addresses";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function getCoreContract() {
  const signer = await getSigner();
  const chainId = (await getChainId()) as keyof typeof ADDRESSES;
  const addr = ADDRESSES[chainId]?.LendingCore;
  if (!addr) throw new Error(`No Core address for chain ${chainId}`);
  return new ethers.Contract(addr, (CoreAbi as any).abi, signer);
}

export async function getUsdcContract() {
  const signer = await getSigner();
  const chainId = (await getChainId()) as keyof typeof ADDRESSES;
  const addr = ADDRESSES[chainId]?.USDC;
  if (!addr) throw new Error(`No USDC address for chain ${chainId}`);
  return new ethers.Contract(addr, ERC20_ABI, signer);
}
