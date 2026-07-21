pragma solidity ^0.8.28;

import "./Interfaces.sol";

contract DemoVerifier {
    mapping(address => bool) public verified;
    DojangAttesterId public constant DEMO_ATTESTER =
        DojangAttesterId.wrap(0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034);

    address public owner;

    event Verified(address indexed user);
    event Unverified(address indexed user);

    constructor() {
        owner = msg.sender;
    }

    function markVerified(address user) external {
        require(msg.sender == owner, "Not owner");
        verified[user] = true;
        emit Verified(user);
    }

    function markUnverified(address user) external {
        require(msg.sender == owner, "Not owner");
        verified[user] = false;
        emit Unverified(user);
    }

    function isVerified(address user, DojangAttesterId) external view returns (bool) {
        return verified[user];
    }
}
