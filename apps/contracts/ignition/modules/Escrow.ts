import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowModule", (m) => {
  const escrow = m.contract("Escrow");

  //  TODO: add tests for the escrow contract
  
  return { escrow };
});
