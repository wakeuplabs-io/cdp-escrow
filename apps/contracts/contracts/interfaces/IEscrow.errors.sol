// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title IEscrowErrors
 * @notice Interface defining all custom errors used by the Escrow contract
 * @dev Custom errors provide more gas-efficient error handling compared to require strings
 */
interface IEscrowErrors {
    /**
     * @notice Thrown when attempting to perform an action on a challenge that has already been closed
     * @dev A challenge is considered closed once its deadline has passed
     */
    error ChallengeAlreadyClosed();

    /**
     * @notice Thrown when a user attempts to submit to a challenge they have already submitted to
     * @dev Each address can only submit once per challenge to prevent spam
     */
    error AlreadySubmitted();

    /**
     * @notice Thrown when attempting to resolve a challenge before its deadline
     * @dev Challenges can only be resolved after their deadline has passed to ensure fair submission periods
     */
    error ChallengeNotClosed();

    /**
     * @notice Thrown when attempting an action that requires a challenge to be in pending state
     * @dev Currently defined but not actively used in the current implementation
     */
    error ChallengeNotPending();

    /**
     * @notice Thrown when attempting an action that requires a challenge to be in validating state
     * @dev Currently defined but not actively used in the current implementation
     */
    error ChallengeNotValidating();

    /**
     * @notice Thrown when attempting an action that requires a challenge to be refunded
     * @dev Currently defined but not actively used in the current implementation
     */
    error ChallengeNotRefunded();

    /**
     * @notice Thrown when a user attempts to withdraw more funds than their available balance
     * @dev Prevents users from withdrawing funds they haven't earned or already withdrawn
     */
    error InsufficientBalance();

    /**
     * @notice Thrown when a user attempts to perform an action that requires them to be the admin of the challenge
     * @dev Prevents users from performing actions that require them to be the admin of the challenge
     */
    error OnlyAdmin();

    /**
     * @notice Thrown when a user attempts to get a submission id that doesn't exist
     * @dev Prevents users from getting a submission id that doesn't exist
     */
    error SubmissionNotFound();

    /**
     * @notice Thrown when a user attempts to perform an action that requires a challenge to be active
     * @dev Prevents users from performing actions that require a challenge to be active
     */
    error ChallengeNotActive();

    /**
     * @notice Thrown when a user attempts to submit to a challenge they are the admin of
     * @dev Prevents users from submitting to a challenge they are the admin of
     */
    error AdminCannotSubmit();

    /**
     * @notice Thrown when a user attempts to resolve a challenge that has already been resolved
     * @dev Prevents users from resolving a challenge that has already been resolved
     */
    error ChallengeAlreadyResolved();

    /**
     * @notice Thrown when a user attempts to resolve a challenge with an invalid submission count
     * @dev Prevents users from resolving a challenge with an invalid submission count
     */
    error InvalidSubmissionCount();

    /**
     * @notice Thrown when a user attempts to register with an invalid name
     * @dev Prevents users from registering with an invalid name
     */
    error ChallengerNotRegistered();
}