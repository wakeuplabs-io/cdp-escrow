// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEscrowErrors} from "./IEscrow.errors.sol";
import {IEscrowEvents} from "./IEscrow.events.sol";
import {IEscrowStructs} from "./IEscrow.structs.sol";

// Escrow contracts for bookings

interface IEscrow is IEscrowErrors, IEscrowEvents, IEscrowStructs {
    /// @notice Owner calls this function to create a challenge
    function createChallenge(
        string calldata metadataURI,
        uint256 poolSize,
        uint256 deadline
    ) external;

    /// @notice Read challenge instance
    function getChallenge(uint256 challengeId) external view returns (Challenge memory);

    /// @notice Read all challenges
    function getChallenges(uint256 startIndex, uint256 count) external view returns (Challenge[] memory);

    /// @notice Get the number of challenges
    function getChallengesCount() external view returns (uint256);

    /// @notice Get the challenges for which the user is the admin
    function getAdminChallenges(address admin) external view returns (uint256[] memory);

    /// @notice User calls this function to create a submission
    function createSubmission(uint256 challengeId, string calldata contact, string calldata submissionURI) external;

    /// @notice Read submission instance
    function getSubmission(uint256 challengeId, uint256 submissionId) external view returns (Submission memory);

    /// @notice Read all submissions for a challenge
    function getSubmissions(uint256 challengeId, uint256 startIndex, uint256 count) external view returns (Submission[] memory);

    /// @notice Get the number of submissions for a challenge
    function getSubmissionsCount(uint256 challengeId) external view returns (uint256);

    /// @notice Owner calls this function to resolve a challenge
    function resolveChallenge(
        uint256 challengeId,
        address[] calldata winners,
        uint256[] calldata invalidSubmissions
    ) external;

    /// @notice User calls to withdraw funds from the escrow
    function withdraw(uint256 amount, address to) external;

    /// @notice Read the balance of an account
    function getBalance(address account) external view returns (uint256);
}
