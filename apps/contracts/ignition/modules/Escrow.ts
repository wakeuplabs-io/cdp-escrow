import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowModule", (m) => {
  const escrow = m.contract("Escrow", [
    "0xcdaA14bE67d28062b02c4836C553DeAEaC94feE1"
  ]);

  return { escrow };
});
