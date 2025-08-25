// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IEscrowStructs
 * @notice Interface defining all data structures used by the Escrow contract
 * @dev These structs organize challenge and submission data in a standardized format
 */
interface IEscrowStructs {
    /**
     * @notice Challenge data structure containing all information about a challenge
     * @param poolSize The total reward pool size in tokens for this challenge
     * @param deadline Unix timestamp after which no new submissions are accepted and challenge can be resolved
     * @param metadataURI URI pointing to off-chain metadata (description, requirements, submission guidelines, etc.)
     */
    struct Challenge {
        uint256 poolSize;
        uint256 deadline;
        string metadataURI;
    }

    /**
     * @notice Submission data structure containing information about a user's submission to a challenge
     * @param challengeId The unique identifier of the challenge this submission belongs to
     * @param submitter The address of the user who made this submission
     * @param submissionTime Unix timestamp when the submission was created
     * @param submissionURI URI pointing to the actual submission content (work, deliverables, proof, etc.)
     */
    struct Submission {
        uint256 challengeId;
        address submitter;
        uint256 submissionTime;
        string submissionURI;
    }
}
