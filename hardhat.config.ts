import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("./tasks/STLBalance");

const RPC_API_KEY = vars.get("RPC_API_KEY", "");

const HR_TEAM_PRIVATE_KEY = vars.get(
  "HR_TEAM_PRIVATE_KEY",
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY", "");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${RPC_API_KEY}`,
      accounts: [HR_TEAM_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
