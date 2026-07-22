pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/GiwaVote.sol";
import "../src/GiwaGovernanceBadge.sol";

contract DeployVoteScript is Script {
    function run() external {
        address deployer = 0x84C29FB8b41F229aD09F4d68f84D676A28Dc4a3a;

        address verifierAddr = 0x7893e1AcaeEDADFC4fa4a88e9E83a65e4C5BF19e;

        DojangAttesterId attesterId = DojangAttesterId.wrap(
            0xd99b42e778498aa3c9c1f6a012359130252780511687a35982e8e52735453034
        );

        vm.startBroadcast(deployer);

        GiwaGovernanceBadge badge = new GiwaGovernanceBadge();
        console.log("GiwaGovernanceBadge:", address(badge));

        GiwaVote vote = new GiwaVote(verifierAddr, attesterId);
        console.log("GiwaVote:           ", address(vote));

        vote.setBadge(address(badge));
        badge.setMinter(address(vote));

        string[5] memory titles = [
            "Add a 6th faucet token (GVF)",
            "Increase faucet cooldown from 24h to 48h to reduce drain rate",
            "Reduce GVA claim amount from 100 to 50 per claim",
            "Add a leaderboard showing top verified voters",
            "Extend governance voting period from 15 to 30 days"
        ];

        string[5] memory descriptions = [
            "The faucet currently supports five test tokens (GVA through GVE). This proposal would add a sixth token, GVF, to support additional testing scenarios for the swap and P2P modules. A new TestToken contract would be deployed and registered with the faucet.",
            "Current drain rates on the faucet are concerning. With 100 tokens per claim and a 24-hour cooldown, a single wallet can extract significant value over time. Doubling the cooldown to 48 hours would halve the weekly drain rate while still providing ample test tokens for legitimate developers.",
            "Each wallet currently receives 100 GVA per claim. Reducing this to 50 per claim would stretch the faucet's reserves further and reduce the incentive for Sybil attacks. Legitimate developers would still have more than enough tokens for testing across all modules.",
            "A public leaderboard would showcase the wallets with the most verified votes across all governance proposals. This increases transparency, gamifies participation, and helps the community identify trusted and engaged governance participants.",
            "The current 15-day voting period provides two weeks for deliberation. Extending to 30 days would give a full month for community discussion and allow for wider participation across different time zones and schedules, especially during holiday periods."
        ];

        for (uint256 i = 0; i < 5; i++) {
            vote.createProposal(titles[i], descriptions[i]);
            console.log("Proposal", i + 1, "created:", titles[i]);
        }

        vm.stopBroadcast();
    }
}
