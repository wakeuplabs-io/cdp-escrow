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
     * @param uri URI pointing to off-chain metadata (description, requirements, submission guidelines, etc.)
     * @param poolSize The total reward pool size in tokens for this challenge
     * @param endsAt Unix timestamp after which no new submissions are accepted and challenge can be resolved
     * @param createdAt Unix timestamp when the challenge was created
     */
    struct Challenge {
        string uri;
        address admin;
        uint256 poolSize;
        uint256 endsAt;
        uint256 createdAt;
    }

    /**
     * @notice Submission data structure containing information about a user's submission to a challenge
     * @param uri URI pointing to the actual submission content (work, deliverables, proof, etc.)
     * @param submitter The address of the user who made this submission
     * @param contact The contact information of the user who made this submission
     * @param createdAt Unix timestamp when the submission was created
     */
    struct Submission {
        string uri;
        string contact;
        address submitter;
        uint256 createdAt;
    }
}
