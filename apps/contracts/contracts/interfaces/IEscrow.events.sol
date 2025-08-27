// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

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
     * @param winners Array of addresses that won the challenge
     */
    event ChallengeResolved(uint256 challengeId, address[] winners);

    /**
     * @notice Emitted when funds are withdrawn from a specific challenge
     * @param challengeId The challenge from which funds were withdrawn
     * @param user The address that withdrew the funds
     * @param amount The amount of tokens withdrawn
     * @dev This event is currently defined but not used in the current implementation
     */
    event ChallengeFundsWithdrawn(uint256 challengeId, address user, uint256 amount);

    /**
     * @notice Emitted when a user submits their work for a challenge
     * @param submissionId The unique identifier of the submission within the challenge
     * @param challengeId The challenge this submission belongs to
     * @param submitter The address of the user who made the submission
     */
    event SubmissionCreated(uint256 challengeId, uint256 submissionId, address submitter);

    /**
     * @notice Emitted when a user withdraws their earned rewards
     * @param from The address that withdrew the funds
     * @param to The address that received the funds
     * @param amount The amount of tokens withdrawn
     */
    event FundsWithdrawn(address from, address to, uint256 amount);
}