import { ethers } from "hardhat";

export async function STLFixture() {
  const [HRTeam, Ana, Bob, ...accounts] = await ethers.getSigners();
  const stlToken = await (await ethers.getContractFactory("STL")).deploy();
  await stlToken.waitForDeployment();

  return {
    stlToken,
    HRTeam,
    Ana,
    Bob,
    accounts,
  };
}
