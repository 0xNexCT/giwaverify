pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";
import "@openzeppelin/token/ERC721/IERC721.sol";
import "@openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/access/Ownable2Step.sol";

contract GiwaAirdrop is Ownable2Step {
    using SafeERC20 for IERC20;

    IVerifier public verifier;
    DojangAttesterId public attesterId;

    struct Airdrop {
        address token;
        bool isERC721;
        uint256 amountPerClaim;
        uint256 totalAllocated;
        uint256 claimed;
        bool active;
    }

    uint256 public airdropCount;
    mapping(uint256 => Airdrop) public airdrops;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    event AirdropCreated(uint256 indexed id, address indexed token, uint256 amountPerClaim, uint256 total);
    event Claimed(uint256 indexed id, address indexed user, uint256 amount);
    event AirdropClosed(uint256 indexed id);

    constructor(address verifier_, DojangAttesterId attesterId_) Ownable(msg.sender) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
    }

    function createAirdrop(
        address token,
        bool isERC721,
        uint256 amountPerClaim,
        uint256 totalAllocated
    ) external onlyOwner returns (uint256) {
        require(token != address(0), "Invalid token");
        require(amountPerClaim > 0, "Zero amount");
        require(totalAllocated > 0, "Zero total");

        airdropCount++;
        airdrops[airdropCount] = Airdrop({
            token: token,
            isERC721: isERC721,
            amountPerClaim: amountPerClaim,
            totalAllocated: totalAllocated,
            claimed: 0,
            active: true
        });

        if (!isERC721) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalAllocated);
        } else {
            IERC721(token).transferFrom(msg.sender, address(this), amountPerClaim);
        }

        emit AirdropCreated(airdropCount, token, amountPerClaim, totalAllocated);
        return airdropCount;
    }

    function claim(uint256 airdropId) external {
        Airdrop storage drop = airdrops[airdropId];
        require(drop.active, "Not active");
        require(!hasClaimed[airdropId][msg.sender], "Already claimed");
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        require(drop.claimed + drop.amountPerClaim <= drop.totalAllocated, "No tokens left");

        hasClaimed[airdropId][msg.sender] = true;
        drop.claimed += drop.amountPerClaim;

        if (drop.isERC721) {
            IERC721(drop.token).safeTransferFrom(address(this), msg.sender, drop.amountPerClaim);
        } else {
            IERC20(drop.token).safeTransfer(msg.sender, drop.amountPerClaim);
        }

        emit Claimed(airdropId, msg.sender, drop.amountPerClaim);
    }

    function closeAirdrop(uint256 airdropId) external onlyOwner {
        airdrops[airdropId].active = false;
        emit AirdropClosed(airdropId);
    }
}
