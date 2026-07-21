pragma solidity ^0.8.28;

import "./Interfaces.sol";

contract GiwaVerifyPass {
    IVerifier public verifier;
    DojangAttesterId public attesterId;
    address public owner;

    error NotVerified(address user);

    event VerifierUpdated(address indexed newVerifier);
    event AttesterUpdated(DojangAttesterId newAttesterId);

    constructor(address verifier_, DojangAttesterId attesterId_) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
        owner = msg.sender;
    }

    modifier onlyVerified() {
        if (!verifier.isVerified(msg.sender, attesterId)) revert NotVerified(msg.sender);
        _;
    }

    function checkVerified(address user) external view returns (bool) {
        return verifier.isVerified(user, attesterId);
    }

    function updateVerifier(address newVerifier) external {
        require(msg.sender == owner, "Not owner");
        require(newVerifier != address(0), "Invalid");
        verifier = IVerifier(newVerifier);
        emit VerifierUpdated(newVerifier);
    }

    function updateAttester(DojangAttesterId newAttesterId) external {
        require(msg.sender == owner, "Not owner");
        attesterId = newAttesterId;
        emit AttesterUpdated(newAttesterId);
    }
}
