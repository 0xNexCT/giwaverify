pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaVote.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GVF.sol";

contract DeployFinalScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;
        address badgeAddr  = 0xAe6612cAc8957fc069B24055Ae9b288bB350105d;
        address gvfAddr    = 0x3b3780B42716B40150859bfAEAab103a8ED0Ad76;

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        vm.startBroadcast(deployer);

        // Deploy new GiwaVote with 30-day deadline
        GiwaVote vote = new GiwaVote(verifierAddr, attesterId);
        console.log("GiwaVote:            ", address(vote));

        // Wire to existing badge + GVF (owner switches minter to new vote)
        vote.setBadge(badgeAddr);
        GiwaGovernanceBadge(badgeAddr).setMinter(address(vote));
        vote.setGVF(gvfAddr);
        GVF(gvfAddr).setMinter(address(vote));
        console.log("--- Wired to existing badge + GVF ---");

        // === PROPOSAL 1: GVF - foundational, implemented on creation ===
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
        console.log("Proposal 1 (GVF): implemented on creation");

        // === PROPOSAL 2: Batch Claim - ACTIVE (not pre-implemented) ===
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
        console.log("Proposal 2 (Batch Claim): active, awaiting votes");

        vm.stopBroadcast();

        console.log("");
        console.log("=== FINAL PROPOSAL SUMMARY ===");
        console.log("ID | Title                                                | Status       | Deadline | Justification");
        console.log("1  | GVF governance participation token added             | Implemented  | 30-day   | Foundational infrastructure");
        console.log("2  | Add a 'Claim All' batch function to the faucet       | Active       | 30-day   | Real faucet data cited (99.9% reserves)");
        console.log("   |                                                      |              |          | ");
        console.log("GiwaVote:", address(vote));
    }
}
