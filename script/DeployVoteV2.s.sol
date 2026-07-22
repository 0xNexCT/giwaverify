pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaVote.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GVF.sol";

contract DeployVoteV2Script is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        vm.startBroadcast(deployer);

        // 1. Deploy GVF
        GVF gvf = new GVF();
        console.log("GVF:                 ", address(gvf));

        // 2. Deploy badge
        GiwaGovernanceBadge badge = new GiwaGovernanceBadge();
        console.log("GiwaGovernanceBadge: ", address(badge));

        // 3. Deploy vote
        GiwaVote vote = new GiwaVote(verifierAddr, attesterId);
        console.log("GiwaVote:            ", address(vote));

        // 4. Wire contracts
        vote.setBadge(address(badge));
        badge.setMinter(address(vote));
        vote.setGVF(address(gvf));
        gvf.setMinter(address(vote));

        console.log("--- Contracts wired ---");

        // 5. Seed proposal 1: Add GVF Governance Token
        vote.createProposal(
            "Add GVF Governance Participation Token",
            "GVF is a non-tradeable governance participation token, separate from the 5 faucet tokens (GVA-GVE). "
            "It is NOT claimable from the faucet and NOT listed in the Swap module. "
            "Each wallet receives 10 GVF automatically every time they cast a vote on any governance proposal. "
            "This is cumulative and distinct from the one-time Governance Participant soulbound NFT badge - "
            "the badge marks first-ever participation as a one-time achievement, while the GVF balance grows with "
            "every vote to show cumulative governance engagement. "
            "GVF has no price, is not swappable, and does not grant additional voting power "
            "(voting remains 1 wallet = 1 vote regardless of GVF balance). "
            "It exists purely as an on-chain visible indicator of 'how much has this wallet participated.' "
            "Deployer wallet will vote Approve and call markImplemented() at the end of this script."
        );

        // 6. Seed proposal 2: Data-driven governance guidelines
        vote.createProposal(
            "Establish Data-Driven Thresholds for Faucet Parameter Changes",
            "Current on-chain data from GiwaFaucetV2 (address 0x2BA3f6838C5D12AF133341a527DdffBF618e3988) "
            "as of proposal creation: total reserves across all 5 tokens are 499,900 out of 500,000 initial seed "
            "(99.98% intact). Only 1 unique wallet has ever claimed tokens (100 GVA, one claim). "
            "GVA reserve: 99,900 / 100,000. GVB-GVE reserves: 100,000 / 100,000 each (fully intact). "
            "Since no token shows meaningful depletion, no claim-amount or cooldown parameter changes are "
            "justified at this time. This proposal establishes that future proposals to reduce claim amounts "
            "or increase cooldowns should only be considered when at least one faucet token's reserve falls "
            "below 50% of its initial seed (50,000 tokens). This prevents unnecessary parameter changes "
            "driven by hypothetical rather than observed usage patterns."
        );

        console.log("--- Proposals created ---");

        // 7. Vote Approve on proposal 1 and mark implemented
        vote.vote(1, true);
        vote.markImplemented(1);
        console.log("Proposal 1 voted Approve and marked implemented");

        console.log("=== SUMMARY ===");
        console.log("GVF:                 ", address(gvf));
        console.log("GiwaGovernanceBadge: ", address(badge));
        console.log("GiwaVote:            ", address(vote));
        console.log("Proposal 1: Add GVF Governance Token (implemented)");
        console.log("Proposal 2: Data-Driven Thresholds (active, awaiting votes)");

        vm.stopBroadcast();
    }
}
