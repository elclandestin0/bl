import { ethers } from "hardhat";

async function main() {
  const usdcFromEnv = process.env.USDC_ADDRESS;

  if (!usdcFromEnv) {
    console.log("No USDC_ADDRESS provided; deploying mock USDC (6 decimals) for local dev…");
    const Mock = await ethers.getContractFactory("ERC20Mock");
    const mock = await Mock.deploy("MockUSDC", "mUSDC", 6);
    await mock.waitForDeployment();
    const mockAddr = await mock.getAddress();
    console.log("Mock USDC:", mockAddr);

    const Core = await ethers.getContractFactory("P2PLendingCore");
    const core = await Core.deploy(mockAddr);
    await core.waitForDeployment();
    console.log("P2PLendingCore:", await core.getAddress());
    return;
  }

  const Core = await ethers.getContractFactory("P2PLendingCore");
  const core = await Core.deploy(usdcFromEnv);
  await core.waitForDeployment();
  console.log("P2PLendingCore:", await core.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
