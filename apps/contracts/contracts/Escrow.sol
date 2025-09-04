// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

// Escrow contracts for bookings

contract Escrow is IEscrow {
    // Token used for payments
    IERC20 public token;

    // challenge count
    uint256 internal challengesCount;
    // challengeId -> challenge
    mapping(uint256 => Challenge) internal challenges;
    // challenger address -> challenges ids for which the user is the admin
    mapping(address => uint256[]) internal challengerChallenges;

    // challengeId -> submission count.
    mapping(uint256 => uint256) internal submissionsCount;
    // challengeId -> submissionId -> submission
    mapping(uint256 => mapping(uint256 => Submission)) internal submissions;
    // challengeId -> submissionId -> true
    mapping(uint256 => mapping(uint256 => bool)) internal isSubmissionAwarded;
    // challengeId -> submissionId -> true
    mapping(uint256 => mapping(uint256 => bool))
        internal isSubmissionIneligible;
    // challengeId -> user address -> bool
    mapping(uint256 => mapping(address => bool)) internal hasSubmitted;
    // challengeId -> user address -> claimable balance
    mapping(uint256 => mapping(address => uint256)) internal claimable;

    // user address -> challengeId[]
    mapping(address => UserSubmission[]) internal userSubmissions;

    // user address -> challenger profile
    mapping(address => ChallengerProfile) internal challengerProfiles;

    constructor(address _token) {
        token = IERC20(_token);
    }

    modifier onlyAdmin(uint256 challengeId) {
        if (challenges[challengeId].admin != msg.sender) {
            revert OnlyAdmin();
        }
        _;
    }

    /// @inheritdoc IEscrow
    function setProfile(
        string calldata name,
        string calldata description,
        string calldata website
    ) public {
        challengerProfiles[msg.sender] = ChallengerProfile({
            name: name,
            description: description,
            website: website,
            verified: false
        });
    }

    /// @inheritdoc IEscrow
    function getProfile(
        address user
    ) public view returns (ChallengerProfile memory) {
        return challengerProfiles[user];
    }

    /// @inheritdoc IEscrow
    function createChallenge(
        string calldata metadataURI,
        uint256 poolSize,
        uint256 deadline
    ) public {
        uint256 challengeId = challengesCount;
        challenges[challengeId] = Challenge({
            metadataUri: metadataURI,
            poolSize: poolSize,
            endsAt: deadline,
            createdAt: block.timestamp,
            status: ChallengeStatus.Active,
            admin: msg.sender
        });
        challengerChallenges[msg.sender].push(challengeId);
        challengesCount++;

        // pull tokens
        token.transferFrom(msg.sender, address(this), poolSize);

        emit ChallengeCreated(challengeId, metadataURI, poolSize, deadline);
    }

    /// @inheritdoc IEscrow
    function resolveChallenge(
        uint256 challengeId,
        uint256[] calldata awardedSubmissions,
        uint256[] calldata ineligibleSubmissions
    ) public onlyAdmin(challengeId) {
        if (challenges[challengeId].endsAt > block.timestamp) {
            revert ChallengeNotClosed();
        } else if (
            challenges[challengeId].status == ChallengeStatus.Completed
        ) {
            revert ChallengeAlreadyResolved();
        } else if (
            awardedSubmissions.length + ineligibleSubmissions.length >
            submissionsCount[challengeId]
        ) {
            revert InvalidSubmissionCount();
        }

        challenges[challengeId].status = ChallengeStatus.Completed;

        // iterate over all submissions, mark them as ineligible, awarded or accepted and assign rewards
        uint256 awardedPrize;
        uint256 acceptedPrize;
        uint256 totalSubs = submissionsCount[challengeId];

        if (totalSubs == 0 || totalSubs == ineligibleSubmissions.length) {
            // no submissions, return it all to admin
            token.transfer(
                challenges[challengeId].admin,
                challenges[challengeId].poolSize
            );
            return;
        } else if (
            totalSubs - ineligibleSubmissions.length ==
            awardedSubmissions.length
        ) {
            // all submissions are awarded equally
            awardedPrize =
                challenges[challengeId].poolSize /
                awardedSubmissions.length;
            acceptedPrize = 0;
        } else {
            // some submissions are accepted, some are awarded, some are ineligible
            awardedPrize =
                (challenges[challengeId].poolSize * 70) /
                100 /
                awardedSubmissions.length;
            acceptedPrize =
                (challenges[challengeId].poolSize * 30) /
                100 /
                (totalSubs -
                    ineligibleSubmissions.length -
                    awardedSubmissions.length);
        }

        // store awarded and ineligible submissions
        for (uint256 i = 0; i < awardedSubmissions.length; i++) {
            isSubmissionAwarded[challengeId][awardedSubmissions[i]] = true;
        }
        for (uint256 i = 0; i < ineligibleSubmissions.length; i++) {
            isSubmissionIneligible[challengeId][
                ineligibleSubmissions[i]
            ] = true;
        }

        // update submissions and claimable balances
        for (uint256 i = 0; i < totalSubs; i++) {
            if (isSubmissionAwarded[challengeId][i]) {
                submissions[challengeId][i].status = SubmissionStatus.Awarded;
                claimable[challengeId][
                    submissions[challengeId][i].creator
                ] += awardedPrize;
            } else if (isSubmissionIneligible[challengeId][i]) {
                submissions[challengeId][i].status = SubmissionStatus
                    .Ineligible;
                claimable[challengeId][submissions[challengeId][i].creator] = 0;
            } else {
                submissions[challengeId][i].status = SubmissionStatus.Accepted;
                claimable[challengeId][
                    submissions[challengeId][i].creator
                ] += acceptedPrize;
            }
        }

        emit ChallengeResolved(
            challengeId,
            awardedSubmissions,
            ineligibleSubmissions
        );
    }

    /// @inheritdoc IEscrow
    function getChallengesCount() public view returns (uint256) {
        return challengesCount;
    }

    /// @inheritdoc IEscrow
    function getChallengerChallenges(
        address challenger
    ) public view returns (uint256[] memory) {
        return challengerChallenges[challenger];
    }

    /// @inheritdoc IEscrow
    function getChallenge(
        uint256 challengeId
    ) public view returns (Challenge memory) {
        Challenge memory challenge = challenges[challengeId];
        if (
            challenge.endsAt < block.timestamp &&
            challenge.status == ChallengeStatus.Active
        ) {
            challenge.status = ChallengeStatus.PendingReview;
        }
        return challenge;
    }

    /// @inheritdoc IEscrow
    function createSubmission(
        uint256 challengeId,
        string calldata contact,
        string calldata submissionURI
    ) public {
        if (hasSubmitted[challengeId][msg.sender]) {
            revert AlreadySubmitted();
        } else if (challenges[challengeId].endsAt < block.timestamp) {
            revert ChallengeNotActive();
        } else if (challenges[challengeId].admin == msg.sender) {
            revert AdminCannotSubmit();
        }

        uint256 submissionId = submissionsCount[challengeId];

        submissions[challengeId][submissionId] = Submission({
            creator: msg.sender,
            creatorContact: contact,
            metadataUri: submissionURI,
            status: SubmissionStatus.Pending,
            createdAt: block.timestamp
        });
        submissionsCount[challengeId]++;
        hasSubmitted[challengeId][msg.sender] = true;
        userSubmissions[msg.sender].push(
            UserSubmission({
                challengeId: challengeId,
                submissionId: submissionId
            })
        );

        emit SubmissionCreated(challengeId, submissionId, msg.sender);
    }

    /// @inheritdoc IEscrow
    function getSubmissionsCount(
        uint256 challengeId
    ) public view returns (uint256) {
        return submissionsCount[challengeId];
    }

    /// @inheritdoc IEscrow
    function getUserSubmissions(
        address user
    ) public view returns (UserSubmission[] memory) {
        return userSubmissions[user];
    }

    /// @inheritdoc IEscrow
    function getSubmission(
        uint256 challengeId,
        uint256 submissionId
    ) public view returns (Submission memory) {
        return submissions[challengeId][submissionId];
    }

    /// @inheritdoc IEscrow
    function getClaimable(
        uint256 challengeId,
        address account
    ) public view returns (uint256) {
        return claimable[challengeId][account];
    }

    /// @inheritdoc IEscrow
    function claim(uint256 challengeId) public {
        uint256 claimableAmount = claimable[challengeId][msg.sender];
        if (claimableAmount == 0) {
            revert InsufficientBalance();
        }

        // transfer funds back to the requestor
        token.transfer(msg.sender, claimableAmount);
        claimable[challengeId][msg.sender] = 0;

        emit Claimed(msg.sender, claimableAmount);
    }
}
