const { ethers } = require("hardhat");

async function main() {
  const usdcFromEnv = process.env.USDC_ADDRESS;
  const [deployer, lender1, lender2, borrower1] = await ethers.getSigners();

  if (!usdcFromEnv) {
    console.log("No USDC_ADDRESS; deploying mock USDC (6dp)...");
    const Mock = await ethers.getContractFactory("ERC20Mock");
    const mock = await Mock.deploy("MockUSDC", "mUSDC", 6);
    await mock.waitForDeployment();
    const mockAddr = await mock.getAddress();
    console.log("USDC Address: ", mockAddr);

    const amount = 50_000n * 1_000_000n;
    await mock.mint(await deployer.getAddress(), amount);
    await mock.mint(await lender1.getAddress(), amount);
    await mock.mint(await lender2.getAddress(), amount);
    await mock.mint(await borrower1.getAddress(), amount);
    console.log('deployer, lender1, lender2, borrower1', + await deployer.getAddress() + ' ' + await lender1.getAddress() + ' ' + await lender2.getAddress() + ' ' + await borrower1.getAddress());

    const Core = await ethers.getContractFactory("LendingCore");
    const core = await Core.deploy(mockAddr);
    await core.waitForDeployment();
    console.log("LendingCore:", await core.getAddress());
    return;
  }

  const Core = await ethers.getContractFactory("LendingCore");
  const core = await Core.deploy(usdcFromEnv);
  await core.waitForDeployment();
  console.log("LendingCore:", await core.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
