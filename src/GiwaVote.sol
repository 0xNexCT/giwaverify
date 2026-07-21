pragma solidity ^0.8.28;

import "./Interfaces.sol";

contract GiwaVote {
    IVerifier public verifier;
    DojangAttesterId public attesterId;

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool active;
        uint256 endTime;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 endTime);
    event Voted(uint256 indexed id, address indexed voter, bool support);
    event ProposalClosed(uint256 indexed id);

    constructor(address verifier_, DojangAttesterId attesterId_) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
    }

    modifier onlyVerified() {
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        _;
    }

    function createProposal(string calldata title, string calldata description, uint256 durationMinutes) external onlyVerified {
        require(bytes(title).length > 0, "Empty title");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            active: true,
            endTime: block.timestamp + (durationMinutes * 1 minutes)
        });

        emit ProposalCreated(proposalCount, msg.sender, title, block.timestamp + durationMinutes * 1 minutes);
    }

    function vote(uint256 proposalId, bool support) external onlyVerified {
        Proposal storage prop = proposals[proposalId];
        require(prop.active, "Not active");
        require(block.timestamp < prop.endTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            prop.yesVotes++;
        } else {
            prop.noVotes++;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function closeProposal(uint256 proposalId) external {
        Proposal storage prop = proposals[proposalId];
        require(prop.active, "Already closed");
        require(msg.sender == prop.proposer || block.timestamp >= prop.endTime, "Not authorized");

        prop.active = false;
        emit ProposalClosed(proposalId);
    }
}
