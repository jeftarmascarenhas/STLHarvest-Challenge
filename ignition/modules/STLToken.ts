import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const STLModule = buildModule("STLModule", (m) => {
  const stlToken = m.contract("STL");

  return { stlToken };
});

export default STLModule;
