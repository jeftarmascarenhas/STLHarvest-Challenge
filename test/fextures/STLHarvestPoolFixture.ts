import { ethers } from "hardhat";
import { STLFixture } from "./STLFixture";

export async function STLHarvestPoolFixture() {
  const { stlToken, Ana, Bob, HRTeam, accounts } = await STLFixture();
  const stlHarvestPool = await (
    await ethers.getContractFactory("STLHarvestPool")
  ).deploy(stlToken.target);
  await stlHarvestPool.waitForDeployment();

  return {
    stlHarvestPool,
    stlToken,
    Ana,
    Bob,
    HRTeam,
    accounts,
  };
}
