pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "./GiwaGovernanceBadge.sol";

contract GiwaVote {
    IVerifier public verifier;
    DojangAttesterId public attesterId;
    GiwaGovernanceBadge public badge;
    address public owner;

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 creationTime;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
    }

    uint256 public proposalCount;
    uint256 public totalVotesCast;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bool) public hasEverVoted;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string title, uint256 deadline);
    event Voted(uint256 indexed id, address indexed voter, bool support);
    event BadgeMinted(address indexed voter, uint256 tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyVerified() {
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        _;
    }

    constructor(address verifier_, DojangAttesterId attesterId_) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
        owner = msg.sender;
    }

    function setBadge(address badge_) external onlyOwner {
        badge = GiwaGovernanceBadge(badge_);
    }

    function createProposal(string calldata title, string calldata description) external onlyOwner {
        require(bytes(title).length > 0, "Empty title");

        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            creationTime: block.timestamp,
            deadline: block.timestamp + 15 days,
            yesVotes: 0,
            noVotes: 0
        });

        emit ProposalCreated(proposalCount, msg.sender, title, block.timestamp + 15 days);
    }

    function vote(uint256 proposalId, bool support) external onlyVerified {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp < prop.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(prop.id != 0, "Proposal not found");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            prop.yesVotes++;
        } else {
            prop.noVotes++;
        }

        totalVotesCast++;

        if (!hasEverVoted[msg.sender] && address(badge) != address(0)) {
            hasEverVoted[msg.sender] = true;
            uint256 tokenId = badge.mintOnFirstVote(msg.sender);
            emit BadgeMinted(msg.sender, tokenId);
        } else if (!hasEverVoted[msg.sender]) {
            hasEverVoted[msg.sender] = true;
        }

        emit Voted(proposalId, msg.sender, support);
    }

    function getProposal(uint256 id) external view returns (Proposal memory) {
        require(id > 0 && id <= proposalCount, "Invalid id");
        return proposals[id];
    }

    function hasVotedOnProposal(uint256 proposalId, address voter) external view returns (bool) {
        return hasVoted[proposalId][voter];
    }

    function getStatus(uint256 id) external view returns (uint8) {
        require(id > 0 && id <= proposalCount, "Invalid id");
        Proposal storage prop = proposals[id];
        if (block.timestamp < prop.deadline) return 0;
        if (prop.yesVotes > prop.noVotes) return 1;
        return 2;
    }

    function getProposals(uint256 offset, uint256 limit) external view returns (Proposal[] memory) {
        if (offset >= proposalCount) return new Proposal[](0);
        uint256 end = offset + limit;
        if (end > proposalCount) end = proposalCount;
        uint256 len = end - offset;
        Proposal[] memory result = new Proposal[](len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = proposals[offset + i + 1];
        }
        return result;
    }
}
