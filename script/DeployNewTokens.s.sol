pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaToken.sol";
import "../src/GiwaFaucet.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract DeployNewTokensScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;
        address faucet = 0xD478F71086146539Aad272f74aa7E73ee1ba9A4B;

        vm.startBroadcast(deployer);

        GiwaToken tokenA = new GiwaToken("GiwaVerified Alpha", "GVA");
        GiwaToken tokenB = new GiwaToken("GiwaVerified Beta", "GVB");
        GiwaToken tokenC = new GiwaToken("GiwaVerified Gamma", "GVC");
        GiwaToken tokenD = new GiwaToken("GiwaVerified Delta", "GVD");
        GiwaToken tokenE = new GiwaToken("GiwaVerified Epsilon", "GVE");

        console.log("GVA:", address(tokenA));
        console.log("GVB:", address(tokenB));
        console.log("GVC:", address(tokenC));
        console.log("GVD:", address(tokenD));
        console.log("GVE:", address(tokenE));

        uint256 amount = 400_000 * 10**18;

        tokenA.mint(faucet, amount);
        tokenB.mint(faucet, amount);
        tokenC.mint(faucet, amount);
        tokenD.mint(faucet, amount);
        tokenE.mint(faucet, amount);

        console.log("--- Minted 400K each to new faucet ---");

        // Register on new faucet
        GiwaFaucet(faucet).registerToken(address(tokenA));
        GiwaFaucet(faucet).registerToken(address(tokenB));
        GiwaFaucet(faucet).registerToken(address(tokenC));
        GiwaFaucet(faucet).registerToken(address(tokenD));
        GiwaFaucet(faucet).registerToken(address(tokenE));

        console.log("--- Registered on faucet ---");

        vm.stopBroadcast();
    }
}
