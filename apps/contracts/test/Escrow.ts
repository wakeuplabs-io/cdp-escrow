import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther, getAddress } from "viem";
import { network } from "hardhat";

describe("Escrow Contract Tests", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  const TIMEOUT = 3600n; // 1 hour
  const ITEM_PRICE = parseEther("100");
  const INITIAL_TOKEN_SUPPLY = parseEther("10000");

  describe("Deployment", () => {
    it("Should deploy with correct initial values", async () => {
      const [owner, resolver] = await viem.getWalletClients();
      
      // Deploy mock ERC20 token
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token",
        "TEST", 
        INITIAL_TOKEN_SUPPLY
      ]);

      // Deploy escrow contract
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address,
        resolver.account.address,
        TIMEOUT,
        mockToken.address
      ]);

      // Test initial values
      assert.equal(await escrow.read.owner(), getAddress(owner.account.address));
      assert.equal(await escrow.read.resolver(), getAddress(resolver.account.address));
      assert.equal(await escrow.read.timeout(), TIMEOUT);
      assert.equal(await escrow.read.token(), getAddress(mockToken.address));
      assert.equal(await escrow.read.itemsCount(), 0n);
      assert.equal(await escrow.read.requestsCount(), 0n);
    });
  });

  describe("Item Management", () => {
    it("Should allow owner to create items", async () => {
      const [owner] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      const metadataURI = "https://example.com/item1";
      const price = ITEM_PRICE;
      
      await escrow.write.createItem([metadataURI, price, oracleMock.address], {
        account: owner.account
      });

      assert.equal(await escrow.read.itemsCount(), 1n);
      
      const item = await escrow.read.getItem([0n]);
      const { price: itemPrice, verifier: itemVerifier, metadataURI: itemMetadataURI } = item;
      assert.equal(itemPrice, price);
      assert.equal(itemVerifier, getAddress(oracleMock.address));
      assert.equal(itemMetadataURI, metadataURI); 
    });

    it("Should not allow non-owner to create items", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      await assert.rejects(
        escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], {
          account: user1.account
        }),
        /OwnableUnauthorizedAccount/
      );
    });

    it("Should handle multiple items correctly", async () => {
      const [owner] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      await escrow.write.createItem(["https://example.com/item1", parseEther("50"), oracleMock.address], {
        account: owner.account
      });
      await escrow.write.createItem(["https://example.com/item2", parseEther("75"), oracleMock.address], {
        account: owner.account
      });

      assert.equal(await escrow.read.itemsCount(), 2n);
      
      const item1 = await escrow.read.getItem([0n]);
      const item2 = await escrow.read.getItem([1n]);
      
      assert.equal(item1.price, parseEther("50"));
      assert.equal(item2.price, parseEther("75"));
    });
  });

  describe("Request Management", () => {
    it("Should allow users to create requests and transfer funds", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      // Transfer tokens to user and approve escrow
      await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
      await mockToken.write.approve([escrow.address, parseEther("1000")], {
        account: user1.account
      });

      // Create an item
      await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], {
        account: owner.account
      });

      const initialBalance = await mockToken.read.balanceOf([user1.account.address]);
      const initialEscrowBalance = await mockToken.read.balanceOf([escrow.address]);

      const args = ["user@example.com", "additional info"];
      
      await escrow.write.createRequest([0n, args], {
        account: user1.account
      });

      // Check request was created
      assert.equal(await escrow.read.requestsCount(), 1n);
      
      const request = await escrow.read.getRequest([0n]);
      assert.equal(request.itemId, 0n);
      assert.equal(request.requestor, getAddress(user1.account.address));
      assert.equal(request.status, 0); // PENDING
      assert.deepEqual(request.args, args);

      // Check funds were transferred
      const finalBalance = await mockToken.read.balanceOf([user1.account.address]);
      const finalEscrowBalance = await mockToken.read.balanceOf([escrow.address]);

      assert.equal(finalBalance, initialBalance - ITEM_PRICE);
      assert.equal(finalEscrowBalance, initialEscrowBalance + ITEM_PRICE);
    });

    it("Should emit RequestCreated event", async () => {
      const [owner, , user1] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
      await mockToken.write.approve([escrow.address, parseEther("1000")], {
        account: user1.account
      });

      await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], {
        account: owner.account
      });

      await viem.assertions.emitWithArgs(
        escrow.write.createRequest([0n, ["user@example.com"]], {
          account: user1.account
        }),
        escrow,
        "RequestCreated",
        [1n]
      );
    });

    it("Should handle multiple requests for same item", async () => {
      const [owner, , user1, user2] = await viem.getWalletClients();
      
      const mockToken = await viem.deployContract("MockERC20", [
        "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
      ]);
      const oracleMock = await viem.deployContract("OracleMock", []);
      const escrow = await viem.deployContract("Escrow", [
        owner.account.address, owner.account.address, TIMEOUT, mockToken.address
      ]);

      // Setup users with tokens and approvals
      await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
      await mockToken.write.transfer([user2.account.address, parseEther("1000")]);
      await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
      await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user2.account });

      await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], {
        account: owner.account
      });

      await escrow.write.createRequest([0n, ["user1@example.com"]], { account: user1.account });
      await escrow.write.createRequest([0n, ["user2@example.com"]], { account: user2.account });

      assert.equal(await escrow.read.requestsCount(), 2n);
      
      const request1 = await escrow.read.getRequest([0n]);
      const request2 = await escrow.read.getRequest([1n]);
      
      assert.equal(request1.requestor, getAddress(user1.account.address));
      assert.equal(request2.requestor, getAddress(user2.account.address));
    });
  });

  // describe("Request Resolution and Fulfillment", () => {
  //   it("Should allow resolver to resolve requests and oracle to fulfill them", async () => {
  //     const [owner, resolver, user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     // Setup
  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     const initialBalance = await mockToken.read.balanceOf([user1.account.address]);

  //     // Resolver resolves the request
  //     await escrow.write.resolveRequest([0n, ["resolved data"]], { account: resolver.account });

  //     let request = await escrow.read.getRequest([0n]);
  //     assert.equal(request[3], 1); // status (VALIDATING)

  //     // Oracle mock automatically fulfills with success when verify is called
  //     const hash = await oracleMock.write.verify([0n, ["user@example.com"], ["resolved data"]]);
  //     const receipt = await publicClient.waitForTransactionReceipt({ hash });

  //     // Check that RequestResolved event was emitted
  //     const events = await publicClient.getContractEvents({
  //       address: escrow.address,
  //       abi: escrow.abi,
  //       eventName: "RequestResolved",
  //       fromBlock: receipt.blockNumber,
  //       toBlock: receipt.blockNumber,
  //       strict: true,
  //     });

  //     assert.equal(events.length, 1);
  //     assert.equal(events[0].args.requestId, 0n);

  //     request = await escrow.read.getRequest([0n]);
  //     assert.equal(request[3], 2); // status (RESOLVED)

  //     // Check user got refunded
  //     const finalBalance = await mockToken.read.balanceOf([user1.account.address]);
  //     assert.equal(finalBalance, initialBalance + ITEM_PRICE);
  //   });

  //   it("Should not allow non-resolver to resolve requests", async () => {
  //     const [owner, resolver, user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     await assert.rejects(
  //       escrow.write.resolveRequest([0n, ["resolved data"]], { account: user1.account }),
  //       /onlyResolver/
  //     );
  //   });

  //   it("Should not allow resolving non-pending requests", async () => {
  //     const [owner, resolver, user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     // Resolve once
  //     await escrow.write.resolveRequest([0n, ["resolved data"]], { account: resolver.account });

  //     // Try to resolve again
  //     await assert.rejects(
  //       escrow.write.resolveRequest([0n, ["resolved data"]], { account: resolver.account }),
  //       /RequestNotPending/
  //     );
  //   });
  // });

  // describe("Request Refund", () => {
  //   it("Should allow requestor to refund after timeout", async () => {
  //     const [owner, resolver, user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     const initialBalance = await mockToken.read.balanceOf([user1.account.address]);

  //     // Fast forward time past the deadline
  //     await network.provider.send("evm_increaseTime", [Number(TIMEOUT + 1n)]);
  //     await network.provider.send("evm_mine", []);

  //     await viem.assertions.emitWithArgs(
  //       escrow.write.refundRequest([0n], { account: user1.account }),
  //       escrow,
  //       "RequestRefunded", 
  //       [0n]
  //     );

  //     const request = await escrow.read.getRequest([0n]);
  //     assert.equal(request.status, 3); // status (REFUNDED)

  //     const finalBalance = await mockToken.read.balanceOf([user1.account.address]);
  //     assert.equal(finalBalance, initialBalance + ITEM_PRICE);
  //   });

  //   it("Should not allow refund before timeout", async () => {
  //     const [owner, resolver, user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     await assert.rejects(
  //       escrow.write.refundRequest([0n], { account: user1.account }),
  //       /onlyAfterTimeout/
  //     );
  //   });

  //   it("Should not allow non-requestor to refund", async () => {
  //     const [owner, resolver, user1, user2] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, resolver.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });
  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], { account: owner.account });
  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     await network.provider.send("evm_increaseTime", [Number(TIMEOUT + 1n)]);
  //     await network.provider.send("evm_mine", []);

  //     await assert.rejects(
  //       escrow.write.refundRequest([0n], { account: user2.account }),
  //       /onlyRequestor/
  //     );
  //   });
  // });

  // describe("Edge Cases", () => {
  //   it("Should handle zero price items", async () => {
  //     const [owner, , user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, owner.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     await mockToken.write.approve([escrow.address, parseEther("1000")], { account: user1.account });

  //     await escrow.write.createItem(["https://example.com/free-item", 0n, oracleMock.address], {
  //       account: owner.account
  //     });

  //     await escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account });

  //     const request = await escrow.read.getRequest([0n]);
  //     assert.equal(request.requestor, getAddress(user1.account.address));
  //   });

  //   it("Should reject insufficient allowance", async () => {
  //     const [owner, , user1] = await viem.getWalletClients();
      
  //     const mockToken = await viem.deployContract("MockERC20", [
  //       "Test Token", "TEST", INITIAL_TOKEN_SUPPLY
  //     ]);
  //     const oracleMock = await viem.deployContract("OracleMock", []);
  //     const escrow = await viem.deployContract("Escrow", [
  //       owner.account.address, owner.account.address, TIMEOUT, mockToken.address
  //     ]);

  //     await mockToken.write.transfer([user1.account.address, parseEther("1000")]);
  //     // Don't approve or approve insufficient amount
  //     await mockToken.write.approve([escrow.address, parseEther("50")], { account: user1.account });

  //     await escrow.write.createItem(["https://example.com/item1", ITEM_PRICE, oracleMock.address], {
  //       account: owner.account
  //     });

  //     await assert.rejects(
  //       escrow.write.createRequest([0n, ["user@example.com"]], { account: user1.account })
  //     );
  //   });
  // });
});