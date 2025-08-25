import { useCurrentUser, useSendUserOperation } from "@coinbase/cdp-hooks";
import { Button } from "@coinbase/cdp-react/components/ui/Button";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";
import { useMemo, useState } from "react";

interface Props {
  balance?: string;
  onSuccess?: () => void;
}

/**
 * This component demonstrates how to send a gasless transaction using Smart Accounts.
 *
 * @param {Props} props - The props for the SmartAccountTransaction component.
 * @param {string} [props.balance] - The user's balance (not required for gasless transactions).
 * @param {() => void} [props.onSuccess] - A function to call when the transaction is successful.
 * @returns A component that displays a Smart Account transaction form and result.
 */
export default function SmartAccountTransaction(props: Props) {
  const { balance, onSuccess } = props;
  const { currentUser } = useCurrentUser();
  const { sendUserOperation, data, error, status } = useSendUserOperation();
  const [userOperationHash, setUserOperationHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const smartAccount = currentUser?.evmSmartAccounts?.[0];

  const hasBalance = useMemo(() => {
    return balance && balance !== "0";
  }, [balance]);

  const handleSendUserOperation = async () => {
    if (!smartAccount) return;

    try {
      setErrorMessage("");
      setUserOperationHash("");

      const result = await sendUserOperation({
        evmSmartAccount: smartAccount,
        network: "base-sepolia",
        calls: [
          {
            to: smartAccount, // Send to yourself for testing
            value: 1000000000000n, // 0.000001 ETH in wei
            data: "0x", // Empty data for simple transfer
          },
        ],
        useCdpPaymaster: true, // Use the free CDP paymaster to cover the gas fees
      });

      setUserOperationHash(result.userOperationHash);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const handleReset = () => {
    setUserOperationHash("");
    setErrorMessage("");
  };

  const isLoading = status === "pending";
  const isSuccess = status === "success" && data;
  const hasError = error || errorMessage;

  return (
    <>
      {balance === undefined && (
        <>
          <h2 className="card-title">Send a gasless transaction</h2>
          <LoadingSkeleton className="loading--text" />
          <LoadingSkeleton className="loading--btn" />
        </>
      )}
      {balance !== undefined && (
        <>
          {hasError && !isSuccess && (
            <>
              <h2 className="card-title">Oops</h2>
              <p>{error?.message || errorMessage}</p>
              <Button className="tx-button" onClick={handleReset} variant="secondary">
                Reset and try again
              </Button>
            </>
          )}
          {!hasError && !isSuccess && !isLoading && (
            <>
              <h2 className="card-title">Send a gasless transaction</h2>
              {hasBalance && smartAccount && (
                <>
                  <p>Send 0.000001 ETH to yourself on Base Sepolia with no gas fees!</p>
                  <p className="smart-account-info">
                    ✨ <strong>Smart Account Benefits:</strong> No gas fees, better UX, and enhanced
                    security
                  </p>
                  <Button
                    className="tx-button"
                    onClick={handleSendUserOperation}
                    disabled={isLoading}
                  >
                    Send Gasless Transaction
                  </Button>
                </>
              )}
              {!hasBalance && (
                <>
                  <p>
                    This example transaction sends a tiny amount of ETH from your wallet to itself.
                  </p>
                  <p>
                    Get some from{" "}
                    <a
                      href="https://portal.cdp.coinbase.com/products/faucet"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Base Sepolia Faucet
                    </a>
                  </p>
                  <p className="smart-account-info">
                    ℹ️ <strong>Note:</strong> Even though this is a gasless transaction, you still
                    need ETH in your account to send it.
                  </p>
                </>
              )}
              {!smartAccount && (
                <>
                  <p>No Smart Account found. Please ensure you created a Smart Account.</p>
                </>
              )}
            </>
          )}
          {isLoading && (
            <>
              <h2 className="card-title">Sending gasless transaction...</h2>
              <p>Your transaction is being processed...</p>
              {userOperationHash && (
                <p>
                  User Operation Hash:{" "}
                  <code>
                    {userOperationHash.slice(0, 6)}...{userOperationHash.slice(-4)}
                  </code>
                </p>
              )}
              <LoadingSkeleton className="loading--btn" />
            </>
          )}
          {isSuccess && data && (
            <>
              <h2 className="card-title">Gasless transaction sent</h2>
              <p>
                Transaction hash:{" "}
                <a
                  href={`https://sepolia.basescan.org/tx/${data.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.transactionHash?.slice(0, 6)}...{data.transactionHash?.slice(-4)}
                </a>
              </p>
              <p className="success-message">
                ✅ <strong>Success!</strong> Your gasless transaction was completed with no fees.
              </p>
              <Button
                variant="secondary"
                className="tx-button"
                onClick={() => {
                  handleReset();
                  onSuccess?.();
                }}
              >
                Send another gasless transaction
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
}
