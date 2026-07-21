pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/DemoVerifier.sol";
import "../src/GiwaVerifyPass.sol";
import "../src/GiwaAirdrop.sol";
import "../src/GiwaP2P.sol";
import "../src/GiwaVote.sol";

contract DeployScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        vm.startBroadcast(deployer);

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        DemoVerifier verifier = new DemoVerifier();
        GiwaVerifyPass pass = new GiwaVerifyPass(address(verifier), attesterId);
        GiwaAirdrop airdrop = new GiwaAirdrop(address(verifier), attesterId);
        GiwaP2P p2p = new GiwaP2P(address(verifier), attesterId);
        GiwaVote vote = new GiwaVote(address(verifier), attesterId);

        verifier.markVerified(deployer);

        console.log("DemoVerifier:      ", address(verifier));
        console.log("GiwaVerifyPass:    ", address(pass));
        console.log("GiwaAirdrop:       ", address(airdrop));
        console.log("GiwaP2P:           ", address(p2p));
        console.log("GiwaVote:          ", address(vote));

        vm.stopBroadcast();
    }
}
