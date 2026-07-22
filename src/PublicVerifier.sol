pragma solidity ^0.8.28;

import "./Interfaces.sol";

contract PublicVerifier is IVerifier {
    function isVerified(address, DojangAttesterId) external pure returns (bool) {
        return true;
    }
}
