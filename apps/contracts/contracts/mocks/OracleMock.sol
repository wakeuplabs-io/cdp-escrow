pragma solidity ^0.8.28;

import {IOracleVerifier} from "../interfaces/IOracleVerifier.sol";
import {IEscrow} from "../interfaces/IEscrow.sol";

contract OracleMock is IOracleVerifier {
    function verify(uint256 requestId, string[] calldata userArgs, string[] calldata resolverArgs) external { 
        // TODO: get msg.sender and call back to fulfillRequest
        IEscrow(msg.sender).fulfillRequest(requestId, true);
    }
}