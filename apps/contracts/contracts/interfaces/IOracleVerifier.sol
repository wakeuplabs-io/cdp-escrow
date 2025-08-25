
interface IOracleVerifier {
    function verify(
        uint256 requestId,
        string[] calldata userArgs,
        string[] calldata resolverArgs
    ) external;
}
