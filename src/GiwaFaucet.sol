pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract GiwaFaucet {
    IVerifier public verifier;
    DojangAttesterId public attesterId;
    address public owner;

    uint256 public claimAmount = 100 * 10**18;
    uint256 public maxPerWallet = 100 * 10**18;
    uint256 public cooldownPeriod = 24 hours;

    mapping(address => bool) public registeredTokens;
    address[] public tokenList;

    mapping(address => mapping(address => uint256)) public lastClaimTime;
    mapping(address => mapping(address => uint256)) public totalClaimedPerWallet;

    event TokenRegistered(address indexed token);
    event Claimed(address indexed user, address indexed token, uint256 amount);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);
    event ClaimAmountUpdated(uint256 oldValue, uint256 newValue);
    event MaxPerWalletUpdated(uint256 oldValue, uint256 newValue);
    event CooldownUpdated(uint256 oldValue, uint256 newValue);

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

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        emit OwnerUpdated(owner, newOwner);
        owner = newOwner;
    }

    function setClaimAmount(uint256 amount) external onlyOwner {
        emit ClaimAmountUpdated(claimAmount, amount);
        claimAmount = amount;
    }

    function setMaxPerWallet(uint256 amount) external onlyOwner {
        emit MaxPerWalletUpdated(maxPerWallet, amount);
        maxPerWallet = amount;
    }

    function setCooldown(uint256 seconds_) external onlyOwner {
        emit CooldownUpdated(cooldownPeriod, seconds_);
        cooldownPeriod = seconds_;
    }

    function registerToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!registeredTokens[token], "Already registered");
        registeredTokens[token] = true;
        tokenList.push(token);
        emit TokenRegistered(token);
    }

    function reseedToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function resetCooldown(address wallet, address token) external onlyOwner {
        lastClaimTime[wallet][token] = 0;
    }

    function resetTotalClaimed(address wallet, address token) external onlyOwner {
        totalClaimedPerWallet[wallet][token] = 0;
    }

    function claim(address token) external {
        require(registeredTokens[token], "Token not registered");
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        require(
            block.timestamp >= lastClaimTime[msg.sender][token] + cooldownPeriod,
            "Cooldown active"
        );
        require(
            IERC20(token).balanceOf(address(this)) >= claimAmount,
            "Insufficient faucet balance"
        );
        require(
            totalClaimedPerWallet[msg.sender][token] + claimAmount <= maxPerWallet,
            "Max per wallet reached"
        );

        lastClaimTime[msg.sender][token] = block.timestamp;
        totalClaimedPerWallet[msg.sender][token] += claimAmount;
        IERC20(token).transfer(msg.sender, claimAmount);

        emit Claimed(msg.sender, token, claimAmount);
    }

    function claimAll() external {
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        uint256 len = tokenList.length;
        for (uint256 i = 0; i < len; i++) {
            address token = tokenList[i];
            if (block.timestamp < lastClaimTime[msg.sender][token] + cooldownPeriod) continue;
            if (IERC20(token).balanceOf(address(this)) < claimAmount) continue;
            if (totalClaimedPerWallet[msg.sender][token] + claimAmount > maxPerWallet) continue;

            lastClaimTime[msg.sender][token] = block.timestamp;
            totalClaimedPerWallet[msg.sender][token] += claimAmount;
            IERC20(token).transfer(msg.sender, claimAmount);

            emit Claimed(msg.sender, token, claimAmount);
        }
    }

    function getCooldownRemaining(address wallet, address token) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[wallet][token] + cooldownPeriod;
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
