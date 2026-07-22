pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaSwap.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract DeploySwapScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        address[5] memory tokens = [
            0x05E894cE2C176Dbc30176626efa24850aF2af0e2, // GVA
            0x00E8F81208A33BF516cD7Dd46e7597dFB40F5a25, // GVB
            0x263a171641882Db6b48210E1ea477DB3D1d34509, // GVC
            0x82868dA66735FCD28185b9BEFa9fF2AeE4BA3FB8, // GVD
            0xEEd497B085113e8C3FC563935582a72F90BdE528  // GVE
        ];

        uint256 liquidityPerPool = 500 * 10**18;

        vm.startBroadcast(deployer);

        GiwaSwap swap = new GiwaSwap(verifierAddr, attesterId);

        for (uint256 i = 0; i < 5; i++) {
            for (uint256 j = i + 1; j < 5; j++) {
                IERC20(tokens[i]).approve(address(swap), liquidityPerPool);
                IERC20(tokens[j]).approve(address(swap), liquidityPerPool);
                swap.addLiquidity(tokens[i], tokens[j], liquidityPerPool, liquidityPerPool);
            }
        }

        console.log("GiwaSwap:         ", address(swap));

        vm.stopBroadcast();
    }
}
