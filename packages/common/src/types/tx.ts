import { Address, Hex } from "viem"

export type TxParameters = {
    to: Address;
    data: Hex;
    value: bigint;
}