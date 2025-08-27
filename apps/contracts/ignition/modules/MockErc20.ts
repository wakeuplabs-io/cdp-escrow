import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MockErc20Module", (m) => {
  const mockErc20 = m.contract("MockERC20", [
    "Mock Token",
    "MOCK",
    "1000000000000000000000000",
  ]);

  return { mockErc20 };
});
