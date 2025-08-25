pragma solidity ^0.8.28;

interface IEscrowEvents {
    event RequestCreated(uint requestId);
    event RequestResolved(uint requestId);
    event RequestRefunded(uint requestId);
    event RequestValidated(uint requestId);
    event RequestFailed(uint requestId);
}