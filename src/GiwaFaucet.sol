pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract GiwaFaucet {
    IVerifier public verifier;
    DojangAttesterId public attesterId;
    address public owner;

    uint256 public constant CLAIM_AMOUNT = 100 * 10**18;
    uint256 public constant MAX_PER_WALLET = 100 * 10**18;
    uint256 public constant COOLDOWN = 24 hours;

    mapping(address => bool) public registeredTokens;
    address[] public tokenList;

    mapping(address => mapping(address => uint256)) public lastClaimTime;
    mapping(address => mapping(address => uint256)) public totalClaimedPerWallet;

    event TokenRegistered(address indexed token);
    event Claimed(address indexed user, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address verifier_, DojangAttesterId attesterId_) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
        owner = msg.sender;
    }

    function registerToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!registeredTokens[token], "Already registered");
        registeredTokens[token] = true;
        tokenList.push(token);
        emit TokenRegistered(token);
    }

    function claim(address token) external {
        require(registeredTokens[token], "Token not registered");
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        require(
            block.timestamp >= lastClaimTime[msg.sender][token] + COOLDOWN,
            "Cooldown active"
        );
        require(
            IERC20(token).balanceOf(address(this)) >= CLAIM_AMOUNT,
            "Insufficient faucet balance"
        );
        require(
            totalClaimedPerWallet[msg.sender][token] + CLAIM_AMOUNT <= MAX_PER_WALLET,
            "Max per wallet reached"
        );

        lastClaimTime[msg.sender][token] = block.timestamp;
        totalClaimedPerWallet[msg.sender][token] += CLAIM_AMOUNT;
        IERC20(token).transfer(msg.sender, CLAIM_AMOUNT);

        emit Claimed(msg.sender, token, CLAIM_AMOUNT);
    }

    function getCooldownRemaining(address wallet, address token) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[wallet][token] + COOLDOWN;
        if (block.timestamp >= nextClaimTime) return 0;
        return nextClaimTime - block.timestamp;
    }

    function getFaucetBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function getTokenCount() external view returns (uint256) {
        return tokenList.length;
    }

    function getTokenAtIndex(uint256 index) external view returns (address) {
        return tokenList[index];
    }

    function getTokens() external view returns (address[] memory) {
        return tokenList;
    }
}
