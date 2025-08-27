// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

// Escrow contracts for bookings

contract Escrow is IEscrow {
    // Token used for payments
    IERC20 public token;

    // Store challenges
    uint256 public challengesCount;
    mapping(uint256 => Challenge) public challenges;

    // Store challenge for which the user is the admin for easy retrieval
    mapping(address => uint256[]) public adminChallenges;

    // Withdrawal balances
    mapping(address => uint256) public balances;

    // Store submissions
    mapping(uint256 => uint256) public submissionsCount;
    mapping(uint256 => mapping(uint256 => Submission)) public submissions;
    mapping(uint256 => mapping(address => bool)) public submitted;

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
    function createChallenge(
        string calldata metadataURI,
        uint256 poolSize,
        uint256 deadline
    ) public {
        challenges[challengesCount] = Challenge({
            uri: metadataURI,
            poolSize: poolSize,
            endsAt: deadline,
            createdAt: block.timestamp,
            admin: msg.sender
        });
        
        emit ChallengeCreated(challengesCount, metadataURI, poolSize, deadline);
        challengesCount++;
    }

    /// @inheritdoc IEscrow
    function getChallenge(uint256 challengeId) public view returns (Challenge memory) {
        return challenges[challengeId];
    }

    /// @inheritdoc IEscrow
    function getChallenges(uint256 startIndex, uint256 count) public view returns (Challenge[] memory) {
        uint256 endIndex = startIndex + count;
        if (endIndex > challengesCount) {
            endIndex = challengesCount;
        }
        Challenge[] memory challengeList = new Challenge[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            challengeList[i - startIndex] = challenges[i];
        }
        return challengeList;
    }

    /// @inheritdoc IEscrow
    function getChallengesCount() public view returns (uint256) {
        return challengesCount;
    }

    /// @inheritdoc IEscrow
    function getAdminChallenges(address admin) public view returns (uint256[] memory) {
        return adminChallenges[admin];
    }

    /// @inheritdoc IEscrow
    function createSubmission(uint256 challengeId, string calldata contact,  string calldata submissionURI) public {
        if (submitted[challengeId][msg.sender]) {
            revert AlreadySubmitted();
        }

        uint256 submissionId = submissionsCount[challengeId];

        submissions[challengeId][submissionId] = Submission({
            uri: submissionURI,
            contact: contact,
            submitter: msg.sender,
            createdAt: block.timestamp
        });
        submissionsCount[challengeId]++;
        submitted[challengeId][msg.sender] = true;
        emit SubmissionCreated(submissionId, challengeId, msg.sender);
    }

    /// @inheritdoc IEscrow
    function getSubmission(
        uint256 challengeId,
        uint256 submissionId
    ) public view returns (Submission memory) {
        return submissions[challengeId][submissionId];
    }

    /// @inheritdoc IEscrow
    function getSubmissions(uint256 challengeId, uint256 startIndex, uint256 count) public view returns (Submission[] memory) {
        uint256 endIndex = startIndex + count;
        if (endIndex > submissionsCount[challengeId]) {
            endIndex = submissionsCount[challengeId];
        }
        Submission[] memory submissionList = new Submission[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            submissionList[i] = submissions[challengeId][i];
        }
        return submissionList;
    }

    /// @inheritdoc IEscrow
    function getSubmissionsCount(uint256 challengeId) public view returns (uint256) {
        return submissionsCount[challengeId];
    }

    /// @inheritdoc IEscrow
    function resolveChallenge(
        uint256 challengeId,
        address[] calldata winners,
        uint256[] calldata invalidSubmissions
    ) public onlyAdmin(challengeId) {
        if (challenges[challengeId].endsAt > block.timestamp) {
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
    function withdraw(uint256 amount, address to) public {
        if (balances[msg.sender] < amount) {
            revert InsufficientBalance();
        }

        // transfer funds back to the requestor
        token.transfer(to, amount);
        balances[msg.sender] -= amount;
        emit FundsWithdrawn(msg.sender, to, amount);
    }

    /// @inheritdoc IEscrow
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}
