import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther, getAddress } from "viem";
import { network } from "hardhat";

describe("Escrow Contract Tests", async function () {
  const { viem } = await network.connect();

  const POOL_SIZE = parseEther("100");
  const INITIAL_TOKEN_SUPPLY = parseEther("10000");
  const CHALLENGE_DEADLINE = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

  describe("Deployment", () => {
    it("Should deploy with correct initial values", async () => {
      const [owner] = await viem.getWalletClients();
      
      // Deploy mock ERC20 token
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token",
        "TEST", 
        INITIAL_TOKEN_SUPPLY
      ]);

      // Deploy escrow contract - constructor takes (owner, token)
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address,
        mockToken.address
      ]);

      // Test initial values
      assert.equal(await escrow.read.owner(), getAddress(owner.account.address));
      assert.equal(await escrow.read.token(), getAddress(mockToken.address));
      assert.equal(await escrow.read.challengesCount(), 0n);
    });
  });

  describe("Challenge Management", () => {
    it("Should allow owner to create challenges", async () => {
      const [owner] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      const metadataURI = "https://example.com/challenge1";
      
      await escrow.write.createChallenge([metadataURI, POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      assert.equal(await escrow.read.challengesCount(), 1n);
      
      const challenge = await escrow.read.getChallenge([0n]);
      assert.equal(challenge.poolSize, POOL_SIZE);
      assert.equal(challenge.deadline, BigInt(CHALLENGE_DEADLINE));
      assert.equal(challenge.metadataURI, metadataURI);
    });

    it("Should not allow non-owner to create challenges", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await assert.rejects(
        escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
          account: user1.account
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should handle multiple challenges correctly", async () => {
      const [owner] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", parseEther("50"), BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });
      await escrow.write.createChallenge(["https://example.com/challenge2", parseEther("75"), BigInt(CHALLENGE_DEADLINE + 1000)], {
        account: owner.account
      });

      assert.equal(await escrow.read.challengesCount(), 2n);
      
      const challenge1 = await escrow.read.getChallenge([0n]);
      const challenge2 = await escrow.read.getChallenge([1n]);
      
      assert.equal(challenge1.poolSize, parseEther("50"));
      assert.equal(challenge2.poolSize, parseEther("75"));
    });

    it("Should return all challenges via getChallenges", async () => {
      const [owner] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", parseEther("50"), BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });
      await escrow.write.createChallenge(["https://example.com/challenge2", parseEther("75"), BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      const challenges = await escrow.read.getChallenges();
      assert.equal(challenges.length, 2);
      assert.equal(challenges[0].poolSize, parseEther("50"));
      assert.equal(challenges[1].poolSize, parseEther("75"));
    });
  });

  describe("Submission Management", () => {
    it("Should allow users to create submissions", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Create a challenge first
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      const submissionURI = "https://example.com/submission1";
      
      await escrow.write.createSubmission([0n, submissionURI], {
        account: user1.account
      });

      const submission = await escrow.read.getSubmission([0n, 0n]);
      assert.equal(submission.challengeId, 0n);
      assert.equal(submission.submitter, getAddress(user1.account.address));
      assert.equal(submission.submissionURI, submissionURI);
    });

    it("Should emit SubmissionCreated event", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      await viem.assertions.emitWithArgs(
        escrow.write.createSubmission([0n, "https://example.com/submission1"], {
          account: user1.account
        }),
        escrow,
        "SubmissionCreated",
        [1n, 0n, getAddress(user1.account.address)]
      );
    });

    it("Should not allow duplicate submissions from same user", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      await escrow.write.createSubmission([0n, "https://example.com/submission1"], {
        account: user1.account
      });

      await assert.rejects(
        escrow.write.createSubmission([0n, "https://example.com/submission2"], {
          account: user1.account
        }),
        /AlreadySubmitted/
      );
    });

    it("Should handle multiple submissions from different users", async () => {
      const [owner, , user1, user2] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission2"], { account: user2.account });

      const submission1 = await escrow.read.getSubmission([0n, 0n]);
      const submission2 = await escrow.read.getSubmission([0n, 1n]);
      
      assert.equal(submission1.submitter, getAddress(user1.account.address));
      assert.equal(submission2.submitter, getAddress(user2.account.address));
    });

    it("Should return all submissions via getSubmissions", async () => {
      const [owner, , user1, user2] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission2"], { account: user2.account });

      const submissions = await escrow.read.getSubmissions([0n]);
      assert.equal(submissions.length, 2);
      assert.equal(submissions[0].submitter, getAddress(user1.account.address));
      assert.equal(submissions[1].submitter, getAddress(user2.account.address));
    });
  });

  describe("Challenge Resolution", () => {
    it("Should allow owner to resolve challenges after deadline", async () => {
      const [owner, , user1, user2, user3] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Transfer tokens to escrow to simulate having a pool to distribute
      await mockToken.write.transfer([escrow.address, POOL_SIZE]);

      // Create challenge with deadline in the past
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(pastDeadline)], {
        account: owner.account
      });

      // Create submissions
      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission2"], { account: user2.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission3"], { account: user3.account });

      // Resolve with user1 as winner
      await escrow.write.resolveChallenge([0n, [user1.account.address], []], {
        account: owner.account
      });

      // Check balances - winner should get 70% of pool (since there are losers)
      const winnerBalance = await escrow.read.getBalance([user1.account.address]);
      assert.equal(winnerBalance, (POOL_SIZE * 70n) / 100n);

      // Other participants should get share of remaining 30%
      const user2Balance = await escrow.read.getBalance([user2.account.address]);
      const user3Balance = await escrow.read.getBalance([user3.account.address]);
      const loserShare = (POOL_SIZE * 30n) / 100n / 2n; // Split between 2 losers
      assert.equal(user2Balance, loserShare);
      assert.equal(user3Balance, loserShare);
    });

    it("Should not allow resolving challenge before deadline", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Create challenge with future deadline
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(CHALLENGE_DEADLINE)], {
        account: owner.account
      });

      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });

      await assert.rejects(
        escrow.write.resolveChallenge([0n, [user1.account.address], []], {
          account: owner.account
        }),
        /ChallengeNotClosed/
      );
    });

    it("Should not allow non-owner to resolve challenges", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(pastDeadline)], {
        account: owner.account
      });

      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });

      await assert.rejects(
        escrow.write.resolveChallenge([0n, [user1.account.address], []], {
          account: user1.account
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should give winners 100% when all other submissions are invalid", async () => {
      const [owner, , user1, user2, user3] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Transfer tokens to escrow for the pool
      await mockToken.write.transfer([escrow.address, POOL_SIZE]);

      // Create challenge with deadline in the past
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(pastDeadline)], {
        account: owner.account
      });

      // Create submissions - user1 wins, user2 and user3 are invalid
      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission2"], { account: user2.account });
      await escrow.write.createSubmission([0n, "https://example.com/submission3"], { account: user3.account });

      // Resolve with user1 as winner and user2, user3 as invalid (submissions 1 and 2)
      await escrow.write.resolveChallenge([0n, [user1.account.address], [1n, 2n]], {
        account: owner.account
      });

      // Winner should get 100% since there are no valid losers
      const winnerBalance = await escrow.read.getBalance([user1.account.address]);
      assert.equal(winnerBalance, POOL_SIZE);

      // Invalid submissions should get nothing
      const user2Balance = await escrow.read.getBalance([user2.account.address]);
      const user3Balance = await escrow.read.getBalance([user3.account.address]);
      assert.equal(user2Balance, 0n);
      assert.equal(user3Balance, 0n);
    });
  });

  describe("Fund Withdrawal", () => {
    it("Should allow users to withdraw their balance", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Transfer tokens to escrow to simulate earned balance
      await mockToken.write.transfer([escrow.address, POOL_SIZE]);

      // Resolve a challenge to give user a balance
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(pastDeadline)], {
        account: owner.account
      });
      
      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      
      await escrow.write.resolveChallenge([0n, [user1.account.address], []], {
        account: owner.account
      });

      const initialTokenBalance = await mockToken.read.balanceOf([user1.account.address]);
      const escrowBalance = await escrow.read.getBalance([user1.account.address]);

      await viem.assertions.emitWithArgs(
        escrow.write.withdrawFunds([escrowBalance], {
          account: user1.account
        }),
        escrow,
        "FundsWithdrawn",
        [getAddress(user1.account.address), escrowBalance]
      );

      const finalTokenBalance = await mockToken.read.balanceOf([user1.account.address]);
      const finalEscrowBalance = await escrow.read.getBalance([user1.account.address]);

      assert.equal(finalTokenBalance, initialTokenBalance + escrowBalance);
      assert.equal(finalEscrowBalance, 0n);
    });

    it("Should not allow withdrawal of more than balance", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      await assert.rejects(
        escrow.write.withdrawFunds([parseEther("100")], {
          account: user1.account
        }),
        /InsufficientBalance/
      );
    });
  });

  describe("Balance Checking", () => {
    it("Should return correct balance for users", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, mockToken.address
      ]);

      // Initially balance should be 0
      assert.equal(await escrow.read.getBalance([user1.account.address]), 0n);

      // Transfer tokens to escrow for the pool
      await mockToken.write.transfer([escrow.address, POOL_SIZE]);

      // After challenge resolution, balance should be updated
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await escrow.write.createChallenge(["https://example.com/challenge1", POOL_SIZE, BigInt(pastDeadline)], {
        account: owner.account
      });
      
      await escrow.write.createSubmission([0n, "https://example.com/submission1"], { account: user1.account });
      
      await escrow.write.resolveChallenge([0n, [user1.account.address], []], {
        account: owner.account
      });

      const balance = await escrow.read.getBalance([user1.account.address]);
      assert.equal(balance, POOL_SIZE); // Winner gets 100% of pool (no other submissions)
    });
  });
});