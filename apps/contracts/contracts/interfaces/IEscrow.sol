// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOracleVerifier} from "./IOracleVerifier.sol";
import {IEscrowErrors} from "./IEscrow.errors.sol";
import {IEscrowEvents} from "./IEscrow.events.sol";
import {IEscrowStructs} from "./IEscrow.structs.sol";

// Escrow contracts for bookings

interface IEscrow is IEscrowErrors, IEscrowEvents, IEscrowStructs {
    /// @notice Owner calls this function to create an item for sale
    function createItem(
        string calldata metadataURI,
        uint256 price,
        address verifier
    ) external;

    /// @notice Read item instance
    function getItem(uint256 itemId) external view returns (Item memory);

    /// @notice User calls this function to create a request
    function createRequest(uint256 itemId, string[] calldata args) external;

    /// @notice Read request instance
    function getRequest(uint256 requestId) external view returns (Request memory);

    /// @notice Provider calls here to provide the result for the user request. Here we call the oracle verifier to verify the result.
    function resolveRequest(
        uint256 _requestId,
        string[] calldata args
    ) external;

    /// @notice This function is called back from the chainlink client or resolver determining weather or not the request is valid.
    function fulfillRequest(uint256 _requestId, bool result) external;

    /// @notice if deadline for resolve is reached, and we're not waiting for oracle confirmation the user can claim back their funds
    function refundRequest(uint256 requestId) external;
}
