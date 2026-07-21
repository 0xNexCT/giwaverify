pragma solidity ^0.8.28;

type DojangAttesterId is bytes32;

interface IVerifier {
    function isVerified(address primaryAddress, DojangAttesterId attesterId) external view returns (bool);
}
