import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowModule", (m) => {
  const escrow = m.contract("Escrow", [
    "0xa44e1a19B9334d7FfF8AF0D0783041a83aEb5a49"
  ]);

  return { escrow };
});
