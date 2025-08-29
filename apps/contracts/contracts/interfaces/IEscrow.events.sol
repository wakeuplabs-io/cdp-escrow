// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IEscrowStructs} from "./IEscrow.structs.sol";

/**
 * @title IEscrowEvents
 * @notice Interface defining all events emitted by the Escrow contract
 * @dev These events provide transparency and allow off-chain applications to track escrow activity
 */
interface IEscrowEvents {
    /**
     * @notice Emitted when a new challenge is created
     * @param challengeId The unique identifier of the created challenge
     * @param metadataURI URI pointing to challenge metadata (description, requirements, etc.)
     * @param poolSize The total reward pool size for this challenge
     * @param deadline The timestamp after which submissions are no longer accepted
     */
    event ChallengeCreated(uint256 challengeId, string metadataURI, uint256 poolSize, uint256 deadline);

    /**
     * @notice Emitted when a challenge is resolved and rewards are distributed
     * @param challengeId The unique identifier of the resolved challenge
     * @param awardedSubmissions Array of submission IDs that were awarded
     * @param ineligibleSubmissions Array of submission IDs that were ineligible
     */
    event ChallengeResolved(uint256 challengeId, uint256[] awardedSubmissions, uint256[] ineligibleSubmissions);

    /**
     * @notice Emitted when a user submits their work for a challenge
     * @param submissionId The unique identifier of the submission within the challenge
     * @param challengeId The challenge this submission belongs to
     * @param submitter The address of the user who made the submission
     */
    event SubmissionCreated(uint256 challengeId, uint256 submissionId, address submitter);

    /**
     * @notice Emitted when a user withdraws their earned rewards
     * @param user The address that withdrew the funds
     * @param amount The amount of tokens withdrawn
     */
    event Claimed(address user, uint256 amount);
}