pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/DemoVerifier.sol";
import "../src/GiwaFaucet.sol";
import "../src/TestToken.sol";

contract DeployFaucetScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        vm.startBroadcast(deployer);

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;

        TestToken tkA = new TestToken("GiwaVerified Alpha", "GVA", 1_000_000 * 10**18);
        TestToken tkB = new TestToken("GiwaVerified Beta", "GVB", 1_000_000 * 10**18);
        TestToken tkC = new TestToken("GiwaVerified Gamma", "GVC", 1_000_000 * 10**18);
        TestToken tkD = new TestToken("GiwaVerified Delta", "GVD", 1_000_000 * 10**18);
        TestToken tkE = new TestToken("GiwaVerified Epsilon", "GVE", 1_000_000 * 10**18);

        GiwaFaucet faucet = new GiwaFaucet(verifierAddr, attesterId);

        faucet.registerToken(address(tkA));
        faucet.registerToken(address(tkB));
        faucet.registerToken(address(tkC));
        faucet.registerToken(address(tkD));
        faucet.registerToken(address(tkE));

        tkA.transfer(address(faucet), 100_000 * 10**18);
        tkB.transfer(address(faucet), 100_000 * 10**18);
        tkC.transfer(address(faucet), 100_000 * 10**18);
        tkD.transfer(address(faucet), 100_000 * 10**18);
        tkE.transfer(address(faucet), 100_000 * 10**18);

        console.log("GiwaFaucet:        ", address(faucet));
        console.log("GVA (Alpha):       ", address(tkA));
        console.log("GVB (Beta):        ", address(tkB));
        console.log("GVC (Gamma):       ", address(tkC));
        console.log("GVD (Delta):       ", address(tkD));
        console.log("GVE (Epsilon):     ", address(tkE));

        vm.stopBroadcast();
    }
}
