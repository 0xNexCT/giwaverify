pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaToken.sol";
import "../src/GVF.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GiwaFaucet.sol";
import "../src/GiwaSwap.sol";
import "../src/GiwaVote.sol";
import "../src/Interfaces.sol";

contract DeployFixedScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;
        address verifier = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;
        DojangAttesterId attesterId = DojangAttesterId.wrap(0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034);

        uint256 seedAmount = 400_000 * 10**18;
        uint256 liqAmount = 200_000 * 10**18;
        uint256 liqAmountSmall = 100_000 * 10**18;
        uint256 selfBal = 100 * 10**18;
        uint256 liqBal = 500_000 * 10**18;

        vm.startBroadcast(deployer);

        // 1. Deploy 5 GiwaToken
        GiwaToken gva = new GiwaToken("GiwaVerified Alpha", "GVA");
        GiwaToken gvb = new GiwaToken("GiwaVerified Beta", "GVB");
        GiwaToken gvc = new GiwaToken("GiwaVerified Gamma", "GVC");
        GiwaToken gvd = new GiwaToken("GiwaVerified Delta", "GVD");
        GiwaToken gve = new GiwaToken("GiwaVerified Epsilon", "GVE");

        // 2. Deploy GVF
        GVF gvf = new GVF();

        // 3. Deploy GiwaGovernanceBadge
        GiwaGovernanceBadge badge = new GiwaGovernanceBadge();

        // 4. Deploy GiwaFaucet
        GiwaFaucet faucet = new GiwaFaucet(verifier, attesterId);

        // 5. Deploy GiwaSwap
        GiwaSwap swap = new GiwaSwap(verifier, attesterId);

        // 6. Deploy GiwaVote
        GiwaVote vote = new GiwaVote(verifier, attesterId);

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

        // === LOG ADDRESSES ===
        console.log("=== DEPLOYMENT COMPLETE ===");
        console.log("GVA:", address(gva));
        console.log("GVB:", address(gvb));
        console.log("GVC:", address(gvc));
        console.log("GVD:", address(gvd));
        console.log("GVE:", address(gve));
        console.log("GVF:", address(gvf));
        console.log("Badge:", address(badge));
        console.log("Faucet:", address(faucet));
        console.log("Swap:", address(swap));
        console.log("Vote:", address(vote));
    }
}
