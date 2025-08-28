import { Account, Address, Chain, Hex } from "viem"

export type TxParameters = {
    to: Address;
    data: Hex;
    value: bigint;
}