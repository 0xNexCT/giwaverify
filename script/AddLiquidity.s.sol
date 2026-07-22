pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaSwap.sol";
import "../src/GiwaToken.sol";

contract AddLiquidityScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;
        address swapAddr = 0x5095Bff088BcECf56476DcEAAE45c52351b6EF2B;

        address[5] memory tokens = [
            0xaEb7B16e9Fd7DbB7C815f102E3Ec9d44d4358887,
            0x7c9D5163EABb67417107A0a0e3DF0397A1ad3D03,
            0xE9D91031B2c330fAF5D6f1cd11981B06DC208A6e,
            0x52d57B37F0E5C9fEce966BC47ed0Ca2E7Cf78673,
            0x58C5c8641450609275F38376F614cf328dB49df0
        ];

        uint256 amount = 100_000 * 10**18;

        vm.startBroadcast(deployer);

        for (uint256 i = 0; i < 5; i++) {
            if (GiwaToken(tokens[i]).balanceOf(deployer) < amount) {
                GiwaToken(tokens[i]).mint(deployer, amount);
            }
            IERC20(tokens[i]).approve(swapAddr, amount);
        }

        // Add liquidity for GVA-GVB
        GiwaSwap(swapAddr).addLiquidity(tokens[0], tokens[1], amount, amount);
        console.log("Liquidity added: GVA-GVB = 100K each");

        // Add liquidity for GVA-GVC
        GiwaSwap(swapAddr).addLiquidity(tokens[0], tokens[2], amount, amount);
        console.log("Liquidity added: GVA-GVC = 100K each");

        // Add liquidity for GVB-GVC
        GiwaSwap(swapAddr).addLiquidity(tokens[1], tokens[2], amount, amount);
        console.log("Liquidity added: GVB-GVC = 100K each");

        vm.stopBroadcast();
    }
}
