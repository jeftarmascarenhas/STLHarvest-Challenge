import { task } from "hardhat/config";
import localDeployedAddresses from "../ignition/deployments/chain-31337/deployed_addresses.json";
import sepoliDeployedAddresses from "../ignition/deployments/chain-11155111/deployed_addresses.json";
import { STLHarvestPool } from "../typechain-types";

task("balance", "Show an account's balance")
  .addParam("chooseNetwork")
  .setAction(async (taskArgs, { ethers }) => {
    // npx hardhat balance --choose-network localhost --network localhost
    const chooseMapping: Record<string, any> = {
      localhost: localDeployedAddresses["STLHarvestPoolModule#STLHarvestPool"],
      sepolia: sepoliDeployedAddresses["STLHarvestPoolModule#STLHarvestPool"],
    };
    if (!chooseMapping[taskArgs.chooseNetwork]) {
      throw new Error("options to --choose-network are localhost and sepolia");
    }

    let stlHarvestPool: STLHarvestPool;
    stlHarvestPool = await ethers.getContractAt(
      "STLHarvestPool",
      chooseMapping[taskArgs.chooseNetwork]
    );
    const totalDeposits = await stlHarvestPool.totalDeposits();
    const totalRewards = await stlHarvestPool.totalRewards();

    console.table({ totalDeposits, totalRewards });
  });
