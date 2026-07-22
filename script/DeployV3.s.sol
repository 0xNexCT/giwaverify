pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaFaucetV3.sol";
import "../src/GiwaVote.sol";
import "../src/GiwaGovernanceBadge.sol";
import "../src/GVF.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract DeployV3Script is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;
        address oldFaucet = 0x2BA3f6838C5D12AF133341a527DdffBF618e3988;

        address[5] memory tokens = [
            0x05E894cE2C176Dbc30176626efa24850aF2af0e2,
            0x00E8F81208A33BF516cD7Dd46e7597dFB40F5a25,
            0x263a171641882Db6b48210E1ea477DB3D1d34509,
            0x82868dA66735FCD28185b9BEFa9fF2AeE4BA3FB8,
            0xEEd497B085113e8C3FC563935582a72F90BdE528
        ];
        string[5] memory symbols = ["GVA", "GVB", "GVC", "GVD", "GVE"];

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        vm.startBroadcast(deployer);

        // === FAUCET V3 ===
        GiwaFaucetV3 faucetV3 = new GiwaFaucetV3(verifierAddr, attesterId);
        console.log("GiwaFaucetV3:        ", address(faucetV3));

        // Claim from old V2 and transfer to V3
        for (uint256 i = 0; i < 5; i++) {
            // Skip GVA — deployer already maxed at 100, but has 100 GVA in wallet from earlier claim.
            // For other 4 tokens, claim from V2 faucet.
            if (i > 0) {
                GiwaFaucetV2(oldFaucet).claim(tokens[i]);
            }
            uint256 bal = IERC20(tokens[i]).balanceOf(deployer);
            if (bal > 0) {
                IERC20(tokens[i]).transfer(address(faucetV3), bal);
            }
            faucetV3.registerToken(tokens[i]);
            uint256 seeded = IERC20(tokens[i]).balanceOf(address(faucetV3));
            console.log("  ", symbols[i], "seeded:", seeded / 10**18);
        }

        // === GOVERNANCE CONTRACTS ===
        GVF gvf = new GVF();
        console.log("GVF:                 ", address(gvf));

        GiwaGovernanceBadge badge = new GiwaGovernanceBadge();
        console.log("GiwaGovernanceBadge: ", address(badge));

        GiwaVote vote = new GiwaVote(verifierAddr, attesterId);
        console.log("GiwaVote:            ", address(vote));

        vote.setBadge(address(badge));
        badge.setMinter(address(vote));
        vote.setGVF(address(gvf));
        gvf.setMinter(address(vote));

        console.log("--- Contracts wired ---");

        // === PROPOSAL 1: GVF (already implemented) ===
        vote.createProposal(
            "Add GVF Governance Participation Token",
            "GVF is a non-tradeable governance participation token, separate from the 5 faucet tokens (GVA-GVE). "
            "It is NOT claimable from the faucet and NOT listed in the Swap module. "
            "Each wallet receives 10 GVF automatically every time they cast a vote on any governance proposal. "
            "This is cumulative and distinct from the one-time Governance Participant soulbound NFT badge."
        );

        // === PROPOSAL 2: Claim All batch function (already implemented) ===
        vote.createProposal(
            "Add a Claim All batch function to the faucet",
            "Currently claiming all 5 faucet tokens requires 5 separate transactions, each needing its own wallet "
            "confirmation and gas fee. This proposal adds a claimAll() function to the faucet contract that claims "
            "every token the caller is currently eligible for (not on cooldown, not maxed out, faucet has balance) "
            "in a single transaction, reducing friction and gas costs for active testers. "
            "The function skips any token still on cooldown without reverting the whole call. "
            "Deployed as GiwaFaucetV3 at the address shown in this log. A 'Claim All' button has been added to "
            "the FaucetSection UI."
        );

        console.log("--- Proposals created ---");

        // Vote and mark both as implemented
        vote.vote(1, true);
        vote.markImplemented(1);
        console.log("Proposal 1 (GVF): voted Approve + marked implemented");

        vote.vote(2, true);
        vote.markImplemented(2);
        console.log("Proposal 2 (Claim All): voted Approve + marked implemented");

        console.log("");
        console.log("=== FINAL SUMMARY ===");
        console.log("GiwaFaucetV3:        ", address(faucetV3));
        console.log("GVF:                 ", address(gvf));
        console.log("GiwaGovernanceBadge: ", address(badge));
        console.log("GiwaVote:            ", address(vote));
        console.log("Proposal 1: Add GVF Governance Token                        | 30-day deadline | already implemented");
        console.log("Proposal 2: Add Claim All batch function to the faucet      | 30-day deadline | already implemented");

        vm.stopBroadcast();
    }
}

interface GiwaFaucetV2 {
    function claim(address token) external;
    function getFaucetBalance(address token) external view returns (uint256);
}
