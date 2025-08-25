// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

// Escrow contracts for bookings

contract Escrow is Ownable, IEscrow {
    // Token used for payments
    IERC20 public token;

    // Store challenges
    uint256 public challengesCount;
    mapping(uint256 => Challenge) public challenges;

    // Withdrawal balances
    mapping(address => uint256) public balances;

    // Store submissions
    mapping(uint256 => uint256) public submissionsCount;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;
    mapping(uint256 => mapping(address => bool)) public submitted;

    constructor(address _owner, address _token) Ownable(_owner) {
        token = IERC20(_token);
    }

    /// @inheritdoc IEscrow
    function createChallenge(
        string calldata metadataURI,
        uint256 poolSize,
        uint256 deadline
    ) public onlyOwner {
        challenges[challengesCount] = Challenge({
            poolSize: poolSize,
            deadline: deadline,
            metadataURI: metadataURI
        });
        
        emit ChallengeCreated(challengesCount, metadataURI, poolSize, deadline);
        challengesCount++;
    }

    /// @inheritdoc IEscrow
    function getChallenge(uint256 challengeId) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /// @inheritdoc IEscrow
    function getChallenges() public view returns (Challenge[] memory) {
        Challenge[] memory challengeList = new Challenge[](challengesCount);
        for (uint256 i = 0; i < challengesCount; i++) {
            challengeList[i] = challenges[i];
        }
        return challengeList;
    }

    /// @notice Submit a challenge submission
    function createSubmission(uint256 challengeId, string calldata submissionURI) public {
        if (submitted[challengeId][msg.sender]) {
            revert AlreadySubmitted();
        }

        submissions[challengeId][submissionsCount[challengeId]] = Submission({
            challengeId: challengeId,
            submitter: msg.sender,
            submissionTime: block.timestamp,
            submissionURI: submissionURI
        });
        submissionsCount[challengeId]++;
        submitted[challengeId][msg.sender] = true;
        emit SubmissionCreated(submissionsCount[challengeId], challengeId, msg.sender);
    }

    /// @inheritdoc IEscrow
    function getSubmission(
        uint256 challengeId,
        uint256 submissionId
    ) public view returns (Submission memory) {
        return submissions[challengeId][submissionId];
    }

    /// @inheritdoc IEscrow
    function getSubmissions(uint256 challengeId) public view returns (Submission[] memory) {
        uint256 count = submissionsCount[challengeId];
        Submission[] memory submissionList = new Submission[](count);
        for (uint256 i = 0; i < count; i++) {
            submissionList[i] = submissions[challengeId][i];
        }
        return submissionList;
    }

    /// @inheritdoc IEscrow
    function resolveChallenge(
        uint256 challengeId,
        address[] calldata winners,
        uint256[] calldata invalidSubmissions
    ) public onlyOwner {
        if (challenges[challengeId].deadline > block.timestamp) {
            revert ChallengeNotClosed();
        }

        // filter out winners and invalid submissions to get the rest (losers)
        address[] memory losers = new address[](submissionsCount[challengeId] - winners.length - invalidSubmissions.length);
        uint256 loserIndex = 0;
        for (uint256 i = 0; i < submissionsCount[challengeId]; i++) {
            address submitter = submissions[challengeId][i].submitter;
            bool isWinner = false;
            bool isInvalid = false;
            
            // Check if submitter is a winner
            for (uint256 j = 0; j < winners.length; j++) {
                if (submitter == winners[j]) {
                    isWinner = true;
                    break;
                }
            }
            
            // Check if submission is invalid
            for (uint256 j = 0; j < invalidSubmissions.length; j++) {
                if (i == invalidSubmissions[j]) {
                    isInvalid = true;
                    break;
                }
            }
            
            // If not winner and not invalid, add to losers
            if (!isWinner && !isInvalid) {
                losers[loserIndex] = submitter;
                loserIndex++;
            }
        }

        // Reward distribution: Winners get 70% if there are losers, otherwise 100%
        uint256 totalPool = challenges[challengeId].poolSize;
        if (losers.length > 0) {
            // Winners get 70%, losers get 30%
            uint256 winnerPoolSize = (totalPool * 70) / 100;
            uint256 loserPoolSize = totalPool - winnerPoolSize;
            
            // Distribute to winners
            uint256 winnerReward = winnerPoolSize / winners.length;
            for (uint256 i = 0; i < winners.length; i++) {
                balances[winners[i]] += winnerReward;
            }
            
            // Distribute to losers
            uint256 loserReward = loserPoolSize / losers.length;
            for (uint256 i = 0; i < losers.length; i++) {
                balances[losers[i]] += loserReward;
            }
        } else {
            // Winners take 100% of the pool
            uint256 winnerReward = totalPool / winners.length;
            for (uint256 i = 0; i < winners.length; i++) {
                balances[winners[i]] += winnerReward;
            }
        }
        
        emit ChallengeResolved(challengeId, winners);
    }

    /// @inheritdoc IEscrow
    function withdrawFunds(uint256 amount) public {
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance();
        }

        // transfer funds back to the requestor
        token.transfer(msg.sender, amount);
        balances[msg.sender] -= amount;
        emit FundsWithdrawn(msg.sender, amount);
    }

    /// @inheritdoc IEscrow
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}
