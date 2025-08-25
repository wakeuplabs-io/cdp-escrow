pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOracleVerifier} from "./IOracleVerifier.sol";

interface IEscrowStructs {
    struct Item {
        uint256 price;
        IOracleVerifier verifier;
        string metadataURI;
    }

    enum RequestStatus {
        PENDING,
        VALIDATING,
        RESOLVED,
        REFUNDED
    }

    /**
     * @notice Request struct
     * @param requestId The id of the request
     * @param requestor The address of the requestor
     * @param deadline The deadline of the request
     * @param status The status of the request
     * @param args Details the user specifies for the request, example if it's a giftcard the email of the recipient
     */
    struct Request {
        uint256 itemId;
        address requestor;
        uint256 deadline;
        RequestStatus status;
        string[] args;
    }
}
