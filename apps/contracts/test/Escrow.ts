import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("Escrow", function () {
  async function deployEscrowFixture() {
    const [owner, otherAccount, otherAccount2] =
      await hre.viem.getWalletClients();

    // deploy mock erc20
    const erc20 = await hre.viem.deployContract("MockERC20", [
      "TestToken",
      "TEST",
      0n,
    ]);
    const escrow = await hre.viem.deployContract("Escrow", [erc20.address]);

    // Mint 1000 tokens to the owner and otherAccount
    await erc20.write.mint([owner.account.address, parseEther("1000")], {
      account: owner.account,
    });
    await erc20.write.mint([otherAccount.account.address, parseEther("1000")], {
      account: otherAccount.account,
    });

    const publicClient = await hre.viem.getPublicClient();

    return {
      escrow,
      erc20,
      owner,
      otherAccount,
      otherAccount2,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right token", async function () {
      const { escrow, erc20 } = await loadFixture(deployEscrowFixture);

      expect((await escrow.read.token()).toLowerCase()).to.equal(
        erc20.address.toLowerCase()
      );
    });
  });

  describe("Challenge Management", function () {
    it("Should allow anyone to create a challenge", async function () {
      const { escrow, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // balance before challenge
      const balanceBeforeChallenge = await erc20.read.balanceOf([
        otherAccount.account.address,
      ]);

      // prepare for challenge creation
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: otherAccount.account,
      });

      // assert challenge is created and tokens are pulled
      await expect(
        escrow.write.createChallenge(
          ["https://example.com/challenge1", poolSize, deadline],
          {
            account: otherAccount.account,
          }
        )
      ).not.to.be.rejected;
      expect(
        await erc20.read.balanceOf([otherAccount.account.address])
      ).to.equal(balanceBeforeChallenge - poolSize);
    });
  });

  describe("Submission Management", function () {
    it("Should allow anyone to create a submission for an active challenge", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // create challenge
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );

      // assert submission is allowed
      await expect(
        escrow.write.createSubmission(
          [0n, "contact@example.com", "https://example.com/submission1"],
          { account: otherAccount.account }
        )
      ).not.to.be.rejected;
    });

    it("Should not allow anyone to create a submission for a non-active challenge", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // create challenge
      const deadline = BigInt(Date.now() - 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );

      // fast forward to deadline
      await time.increaseTo(deadline + 1n);

      // assert submission is not allowed
      await expect(
        escrow.write.createSubmission(
          [0n, "contact@example.com", "https://example.com/submission1"],
          { account: otherAccount.account }
        )
      ).to.be.rejectedWith("ChallengeNotActive");
    });

    it("Should not allow admin to create a submission for his own challenge", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // create challenge
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );

      // assert submission is not allowed
      await expect(
        escrow.write.createSubmission(
          [0n, "contact@example.com", "https://example.com/submission1"],
          { account: owner.account }
        )
      ).to.be.rejectedWith("AdminCannotSubmit");
    });

    it("Should allow admin to pick one submission as winner", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // create challenge and submission
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission1"],
        { account: otherAccount.account }
      );

      // pass deadline
      await time.increaseTo(deadline + 1n);

      // pick winner
      await expect(
        escrow.write.resolveChallenge([0n, [0n], []], {
          account: owner.account,
        })
      ).not.to.be.rejected;
    });

    it("Should allow admin to invalidate a submission therefore returning the tokens to him", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // balance before challenge
      const balanceBeforeChallenge = await erc20.read.balanceOf([
        otherAccount.account.address,
      ]);

      // create challenge and submission
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission1"],
        { account: otherAccount.account }
      );
      await time.increaseTo(deadline + 1n);

      // assert we can resolve challenge and get the tokens back
      await expect(
        escrow.write.resolveChallenge([0n, [], [0n]], {
          account: owner.account,
        })
      ).not.to.be.rejected;
      expect(
        await erc20.read.balanceOf([otherAccount.account.address])
      ).to.equal(balanceBeforeChallenge);
    });

    it("Should return user submissions", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      // create challenge and submission
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission1"],
        { account: otherAccount.account }
      );

      // assert user submissions
      const submissions = await escrow.read.getUserSubmissions([otherAccount.account.address]);
      expect(submissions).to.have.lengthOf(1);
      expect(submissions[0].submissionId).to.equal(0n);
      expect(submissions[0].challengeId).to.equal(0n);
    });
  });

  describe("Claim rewards", function () {
    it("Winners get 100% of the pool if no other participants", async function () {
      const { escrow, owner, otherAccount, erc20 } = await loadFixture(
        deployEscrowFixture
      );

      const balanceBeforeChallenge = await erc20.read.balanceOf([
        otherAccount.account.address,
      ]);

      // create challenge and submission
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission1"],
        { account: otherAccount.account }
      );

      // pass deadline
      await time.increaseTo(deadline + 1n);

      // pick winner
      await expect(
        escrow.write.resolveChallenge([0n, [0n], []], {
          account: owner.account,
        })
      ).not.to.be.rejected;

      // Check claimable
      expect(
        await escrow.read.getClaimable([0n, otherAccount.account.address])
      ).to.equal(poolSize);
      await expect(
         escrow.write.claim([0n], { account: otherAccount.account })
      ).not.to.be.rejected;
      expect(
        await erc20.read.balanceOf([otherAccount.account.address])
      ).to.equal(balanceBeforeChallenge + poolSize);
    });

    it("Winners get maximum 70% of the pool if there're other valid submissions", async function () {
      const { escrow, owner, otherAccount, otherAccount2, erc20 } =
        await loadFixture(deployEscrowFixture);

      // create challenge and submission
      const deadline = BigInt(Date.now() + 1000 * 60 * 60 * 24);
      const poolSize = parseEther("1000");
      await erc20.write.approve([escrow.address, poolSize], {
        account: owner.account,
      });
      await escrow.write.createChallenge(
        ["https://example.com/challenge1", poolSize, deadline],
        { account: owner.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission1"],
        { account: otherAccount.account }
      );
      await escrow.write.createSubmission(
        [0n, "contact@example.com", "https://example.com/submission2"],
        { account: otherAccount2.account }
      );

      // pass deadline
      await time.increaseTo(deadline + 1n);

      // pick winner
      await expect(
        escrow.write.resolveChallenge([0n, [0n], []], {
          account: owner.account,
        })
      ).not.to.be.rejected;

      // Check claimable
      expect(
        await escrow.read.getClaimable([0n, otherAccount.account.address])
      ).to.equal((poolSize * 7n) / 10n);
      expect(
        await escrow.read.getClaimable([0n, otherAccount2.account.address])
      ).to.equal((poolSize * 3n) / 10n);
    });
  });
});
