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
     * @notice Challenger profile data structure containing all information about a challenger
     * @param name The name of the challenger
     * @param description The description of the challenger
     * @param website The website of the challenger
     * @param logoURI The URI of the challenger's logo
     * @param verified Whether the challenger is verified
     */
    struct ChallengerProfile {
        string name;
        string description;
        string website;
        string logoURI;
        bool verified;
    }

    enum ChallengeStatus {
        Active,
        PendingReview,
        Completed
    }

    /**
     * @notice Challenge data structure containing all information about a challenge
     * @param uri URI pointing to off-chain metadata (description, requirements, submission guidelines, etc.)
     * @param poolSize The total reward pool size in tokens for this challenge
     * @param endsAt Unix timestamp after which no new submissions are accepted and challenge can be resolved
     * @param createdAt Unix timestamp when the challenge was created
     */
    struct Challenge {
        string metadataUri;
        address admin;
        uint256 poolSize;
        uint256 endsAt;
        uint256 createdAt;
        ChallengeStatus status;
    }

    enum SubmissionStatus {
        Pending,
        Ineligible,
        Accepted,
        Awarded
    }

    /**
     * @notice Submission data structure containing information about a user's submission to a challenge
     * @param uri URI pointing to the actual submission content (work, deliverables, proof, etc.)
     * @param submitter The address of the user who made this submission
     * @param contact The contact information of the user who made this submission
     * @param createdAt Unix timestamp when the submission was created
     */
    struct Submission {
        string metadataUri;
        address creator;
        string creatorContact;
        SubmissionStatus status;
        uint256 createdAt;
    }

    /**
     * @notice User submission data structure containing information about a user's submission to a challenge
     * @param challengeId The id of the challenge
     * @param submissionId The id of the submission
     */
    struct UserSubmission {
        uint256 challengeId;
        uint256 submissionId;
    }
}
