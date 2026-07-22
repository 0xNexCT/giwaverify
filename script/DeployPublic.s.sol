pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaToken.sol";
import "../src/GVF.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GiwaFaucet.sol";
import "../src/GiwaSwap.sol";
import "../src/GiwaVote.sol";
import "../src/PublicVerifier.sol";
import "../src/Interfaces.sol";

contract DeployPublicScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;
        DojangAttesterId attesterId = DojangAttesterId.wrap(0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034);

        uint256 seedAmount = 400_000 * 10**18;
        uint256 liqAmount = 200_000 * 10**18;
        uint256 liqAmountSmall = 100_000 * 10**18;
        uint256 selfBal = 100 * 10**18;
        uint256 liqBal = 500_000 * 10**18;

        // Existing token/badge/GVF addresses (already deployed)
        GiwaToken gva = GiwaToken(0x9F03e390725216E38dBcb9106B4A6ec2611da7b2);
        GiwaToken gvb = GiwaToken(0x1EE1c3516eB72B79f2d6BE419Bf4fFAd6088225e);
        GiwaToken gvc = GiwaToken(0xdBFe78649585CF656D99f73A036093ca4DCF9ada);
        GiwaToken gvd = GiwaToken(0x40405F98E2a646ebBFb5ab55806a0a118E04a286);
        GiwaToken gve = GiwaToken(0x48CaFE7eB73330E07B9dF0C61D4012aD0aD2c813);
        GVF gvf = GVF(0x48A227d0fcc84602c2af7a55918Fe473b51ab1FB);
        GiwaGovernanceBadge badge = GiwaGovernanceBadge(0xa070EF81Af0EA0B595E112aDe9bD3aFb92204674);

        vm.startBroadcast(deployer);

        // 1. Deploy PublicVerifier
        PublicVerifier publicVerifier = new PublicVerifier();
        console.log("PublicVerifier:", address(publicVerifier));

        // 2. Deploy new Faucet, Swap, Vote with PublicVerifier
        GiwaFaucet faucet = new GiwaFaucet(address(publicVerifier), attesterId);
        GiwaSwap swap = new GiwaSwap(address(publicVerifier), attesterId);
        GiwaVote vote = new GiwaVote(address(publicVerifier), attesterId);

        console.log("Faucet:", address(faucet));
        console.log("Swap:", address(swap));
        console.log("Vote:", address(vote));

        // === FAUCET SETUP ===

        // Register all 5 tokens on faucet
        faucet.registerToken(address(gva));
        faucet.registerToken(address(gvb));
        faucet.registerToken(address(gvc));
        faucet.registerToken(address(gvd));
        faucet.registerToken(address(gve));

        // Mint tokens to deployer, then seed faucet
        gva.mint(deployer, seedAmount + liqBal + selfBal);
        gvb.mint(deployer, seedAmount + liqBal + selfBal);
        gvc.mint(deployer, seedAmount + liqBal + selfBal);
        gvd.mint(deployer, seedAmount + selfBal);
        gve.mint(deployer, seedAmount + selfBal);

        gva.approve(address(faucet), seedAmount);
        gvb.approve(address(faucet), seedAmount);
        gvc.approve(address(faucet), seedAmount);
        gvd.approve(address(faucet), seedAmount);
        gve.approve(address(faucet), seedAmount);

        faucet.reseedToken(address(gva), seedAmount);
        faucet.reseedToken(address(gvb), seedAmount);
        faucet.reseedToken(address(gvc), seedAmount);
        faucet.reseedToken(address(gvd), seedAmount);
        faucet.reseedToken(address(gve), seedAmount);

        // Set faucet config
        faucet.setClaimAmount(100 * 10**18);
        faucet.setMaxPerWallet(500 * 10**18);
        faucet.setCooldown(24 hours);

        // === SWAP LIQUIDITY ===

        // Approve swap contract
        gva.approve(address(swap), liqBal);
        gvb.approve(address(swap), liqBal);
        gvc.approve(address(swap), liqBal);

        // Add liquidity for 3 pairs
        swap.addLiquidity(address(gva), address(gvb), liqAmount, liqAmount);
        swap.addLiquidity(address(gva), address(gvc), liqAmountSmall, liqAmountSmall);
        swap.addLiquidity(address(gvb), address(gvc), liqAmountSmall, liqAmountSmall);

        // === GOVERNANCE SETUP ===

        // Link badge and GVF to vote contract
        badge.setMinter(address(vote));
        gvf.setMinter(address(vote));
        vote.setBadge(address(badge));
        vote.setGVF(address(gvf));

        // Create 5 proposals
        vote.createProposal(
            "GVF governance participation token added",
            "Integrate the GVF ERC20 token into the governance system so verified users earn GVF with each vote."
        );
        vote.createProposal(
            "Add a 'Claim All' batch function to the faucet",
            "Implement a batch claim function that lets verified users claim all eligible tokens in one transaction."
        );
        vote.createProposal(
            "Increase faucet claim amount to 200 GVA",
            "Raise the per-transaction claim amount on the faucet from 100 GVA to 200 GVA."
        );
        vote.createProposal(
            "Reduce faucet cooldown from 24h to 12h",
            "Shorten the claim cooldown period from 24 hours to 12 hours for faster testing."
        );
        vote.createProposal(
            "Create Developer Grant Fund (100K GVA)",
            "Allocate 100,000 GVA tokens from the faucet reserve to fund community developer grants."
        );

        // Mark proposal #1 as implemented
        vote.markImplemented(1);

        vm.stopBroadcast();
    }
}
