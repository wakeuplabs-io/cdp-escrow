import {
  Address,
  createPublicClient,
  encodeFunctionData,
  http,
  PublicClient,
} from "viem";
import { erc20Abi } from "../abis/erc20";
import { TxParameters } from "../types/tx";

export class Erc20Service {
  private readonly publicClient: PublicClient;

  constructor(
    private readonly erc20Address: Address,
    private readonly rpcUrl: string
  ) {
    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl),
    });
  }

  async getBalance(address: `0x${string}`): Promise<bigint> {
    const balance = await this.publicClient.readContract({
      address: this.erc20Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });

    return BigInt(balance);
  }

  async prepareApprove(
    amount: bigint,
    to: `0x${string}`
  ): Promise<TxParameters> {
    return {
      to: this.erc20Address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [to, amount],
      }),
      value: 0n,
    };
  }

  async prepareMint(amount: bigint, to: `0x${string}`): Promise<TxParameters> {
    return {
      to: this.erc20Address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "mint",
        args: [to, amount],
      }),
      value: 0n,
    };
  }
}
