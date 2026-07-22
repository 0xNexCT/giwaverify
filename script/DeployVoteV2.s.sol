pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaVote.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GVF.sol";

contract DeployVoteV2Script is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;
        address badgeAddr  = 0xAe6612cAc8957fc069B24055Ae9b288bB350105d;
        address gvfAddr    = 0x3b3780B42716B40150859bfAEAab103a8ED0Ad76;

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        vm.startBroadcast(deployer);

        GiwaVote vote = new GiwaVote(verifierAddr, attesterId);
        console.log("GiwaVote:            ", address(vote));

        vote.setBadge(badgeAddr);
        GiwaGovernanceBadge(badgeAddr).setMinter(address(vote));
        vote.setGVF(gvfAddr);
        GVF(gvfAddr).setMinter(address(vote));
        console.log("--- Wired to existing badge + GVF ---");

        // === PROPOSAL 1: GVF — implemented on creation ===
        vote.createProposal(
            "GVF governance participation token added",
            "GVF (GiwaVerified Governance) is a non-tradeable governance participation token, "
            "separate from the 5 faucet tokens (GVA-GVE). It is NOT claimable from the faucet "
            "and NOT listed in the Swap module. Each wallet receives 10 GVF automatically every "
            "time they cast a vote on any governance proposal. This is cumulative - the GVF "
            "balance grows with every vote to show total governance engagement. GVF has no price, "
            "is not swappable, and does not grant additional voting power (voting remains 1 wallet "
            "= 1 vote regardless of GVF balance). It exists purely as an on-chain visible "
            "indicator of cumulative governance participation."
        );
        vote.vote(1, true);
        vote.markImplemented(1);
        console.log("Proposal 1 (GVF implemented): implemented");

        // === PROPOSAL 2: Batch Claim — implemented on creation ===
        vote.createProposal(
            "Add a 'Claim All' batch function to the faucet",
            "Currently claiming all 5 faucet tokens requires 5 separate transactions, each needing "
            "its own wallet confirmation and gas fee. This proposal adds a claimAll() function to "
            "the faucet contract that claims every token the caller is currently eligible for "
            "(not on cooldown) in a single transaction, reducing friction and gas costs for active "
            "testers. Real faucet data shows all reserves are still nearly full (GVA at 99.9%, "
            "others at 100%), so this proposal is purely a UX/gas-efficiency improvement, not a "
            "scarcity response."
        );
        vote.vote(2, true);
        vote.markImplemented(2);
        console.log("Proposal 2 (Batch Claim implemented): implemented");

        // === PROPOSAL 3: Increase claim amount — ACTIVE ===
        vote.createProposal(
            "Increase faucet claim amount to 200 GVA",
            "Currently each faucet claim gives 100 GVA per transaction. This proposal increases "
            "the claim amount to 200 GVA to accelerate development and testing on GIWA Chain. "
            "The change applies only to the GVA token; GVB-GVE remain at 100 each. On-chain data "
            "shows GVA faucet reserves at 99,900 tokens (99.9% intact), which supports doubling "
            "the claim amount without depletion risk. If passed and implemented, this change would "
            "double the testing throughput for developers building on GIWA."
        );
        console.log("Proposal 3 (200 GVA claim): active");

        // === PROPOSAL 4: Reduce cooldown — ACTIVE ===
        vote.createProposal(
            "Reduce faucet cooldown from 24h to 12h",
            "The current 24-hour cooldown between claims limits how quickly developers can test "
            "token interactions. This proposal cuts the cooldown to 12 hours, allowing two claims "
            "per day instead of one. The 12-hour window still prevents automated draining while "
            "giving active testers more flexibility. All 5 faucet tokens (GVA-GVE) would be "
            "affected. Real data confirms 99.98% of all faucet reserves remain unclaimed, "
            "so the reduced cooldown poses no supply risk."
        );
        console.log("Proposal 4 (12h cooldown): active");

        // === PROPOSAL 5: Developer Grant Fund — ACTIVE ===
        vote.createProposal(
            "Create Developer Grant Fund (100K GVA)",
            "Proposes allocating 100,000 GVA from the faucet reserves to a multi-sig controlled "
            "Developer Grant Fund. The fund would support third-party developers building dApps, "
            "integrations, and infrastructure on GIWA Chain. Grant recipients would be chosen "
            "through a simplified community vote. Any unspent grant funds would return to the "
            "faucet after 6 months. This creates an ecosystem incentive layer on top of the "
            "existing faucet distribute mechanism."
        );
        console.log("Proposal 5 (Grant fund): active");

        vm.stopBroadcast();

        console.log("");
        console.log("=== PROPOSAL SUMMARY ===");
        console.log("ID | Title                                                | Status       | Type");
        console.log("1  | GVF governance participation token added             | Implemented  | Infrastructure");
        console.log("2  | Add a 'Claim All' batch function to the faucet       | Implemented  | UX");
        console.log("3  | Increase faucet claim amount to 200 GVA              | Active       | Parameter");
        console.log("4  | Reduce faucet cooldown from 24h to 12h               | Active       | Parameter");
        console.log("5  | Create Developer Grant Fund (100K GVA)               | Active       | Treasury");
    }
}
