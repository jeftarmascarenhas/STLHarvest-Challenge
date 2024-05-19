import { buildModule } from "@nomicfoundation/ignition-core";
import STLModule from "./STLToken";

const STLHarvestPoolModule = buildModule("STLHarvestPoolModule", (m) => {
  const { stlToken } = m.useModule(STLModule);

  const stlHarvestPool = m.contract("STLHarvestPool", [stlToken], {
    after: [stlToken],
  });
  return { stlHarvestPool };
});

export default STLHarvestPoolModule;
