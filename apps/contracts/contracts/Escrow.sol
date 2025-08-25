// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IOracleVerifier} from "./interfaces/IOracleVerifier.sol";
import {IEscrow} from "./interfaces/IEscrow.sol";

// Escrow contracts for bookings

contract Escrow is Ownable, IEscrow {
    // Store items for sale
    uint256 public itemsCount;
    mapping(uint256 => Item) public items;

    // Store requests for items
    uint256 public requestsCount;
    mapping(uint256 => Request) public requests;

    // global timeout for requests
    uint256 public timeout;
    address public resolver;

    // Token use for payments
    IERC20 public token;

    constructor(
        address _owner,
        address _resolver,
        uint256 _timeout,
        address _token
    ) Ownable(_owner) {
        resolver = _resolver;
        timeout = _timeout;
        token = IERC20(_token);
    }

    modifier onlyResolver() {
        require(
            msg.sender == resolver,
            "onlyResolver: only the resolver can resolve the request"
        );
        _;
    }

    modifier onlyRequestor(uint256 requestId) {
        require(
            requests[requestId].requestor == msg.sender,
            "onlyRequestor: only the requestor can resolve the request"
        );
        _;
    }

    modifier onlyOracleVerifier(uint256 requestId) {
        require(
            address(items[requests[requestId].itemId].verifier) == msg.sender,
            "onlyOracleVerifier: only the oracle verifier can fulfill the request"
        );
        _;
    }

    modifier onlyAfterTimeout(uint256 requestId) {
        require(
            block.timestamp > requests[requestId].deadline,
            "onlyAfterTimeout: the request has not timed out"
        );
        _;
    }

    /// @inheritdoc IEscrow
    function createItem(
        string calldata metadataURI,
        uint256 price,
        address verifier
    ) public onlyOwner {
        items[itemsCount] = Item({
            price: price,
            verifier: IOracleVerifier(verifier),
            metadataURI: metadataURI
        });
        itemsCount++;
    }

    /// @inheritdoc IEscrow
    function getItem(uint256 itemId) public view returns (Item memory) {
        return items[itemId];
    }

    /// @inheritdoc IEscrow
    function createRequest(uint256 itemId, string[] calldata args) public {
        requests[requestsCount] = Request({
            itemId: itemId,
            requestor: msg.sender,
            deadline: block.timestamp + timeout,
            status: RequestStatus.PENDING,
            args: args
        });
        requestsCount++;

        // Pulls erc20funds from the mssage sender
        token.transferFrom(msg.sender, address(this), items[itemId].price);

        emit RequestCreated(requestsCount);
    }

    /// @inheritdoc IEscrow
    function getRequest(uint256 requestId) public view returns (Request memory) {
        return requests[requestId];
    }

    /// @inheritdoc IEscrow
    function resolveRequest(
        uint256 _requestId,
        string[] calldata args
    ) public onlyResolver {
        if (requests[_requestId].status != RequestStatus.PENDING) {
            revert RequestNotPending();
        }

        // Call oracle verifier to corroborate the order
        items[requests[_requestId].itemId].verifier.verify(
            _requestId,
            requests[_requestId].args,
            args
        );

        requests[_requestId].status = RequestStatus.VALIDATING;
    }

    /// @inheritdoc IEscrow
    function fulfillRequest(
        uint256 _requestId,
        bool result
    ) public onlyOracleVerifier(_requestId) {
        if (result) {
            requests[_requestId].status = RequestStatus.RESOLVED;
            emit RequestResolved(_requestId);

            // transfer funds to the requestor
            token.transfer(
                requests[_requestId].requestor,
                items[requests[_requestId].itemId].price
            );
        } else {
            // back to pending to give the provider another chance to resolve the request
            requests[_requestId].status = RequestStatus.PENDING;
            emit RequestFailed(_requestId);
        }
    }

    /// @inheritdoc IEscrow
    function refundRequest(
        uint256 requestId
    ) public onlyRequestor(requestId) onlyAfterTimeout(requestId) {
        if (requests[requestId].status != RequestStatus.PENDING) {
            revert RequestNotPending();
        }

        requests[requestId].status = RequestStatus.REFUNDED;
        emit RequestRefunded(requestId);

        // transfer funds back to the requestor
        token.transfer(
            requests[requestId].requestor,
            items[requests[requestId].itemId].price
        );
    }
}
