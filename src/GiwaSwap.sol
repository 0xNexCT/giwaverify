pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";
import "@openzeppelin/token/ERC20/utils/SafeERC20.sol";

contract GiwaSwap {
    using SafeERC20 for IERC20;

    IVerifier public verifier;
    DojangAttesterId public attesterId;
    address public owner;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant FEE_NUMERATOR = 3;

    struct Reserves {
        uint112 reserve0;
        uint112 reserve1;
        uint32 lastBlock;
    }

    mapping(bytes32 => Reserves) public reserves;

    event LiquidityAdded(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

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

    function _pairKey(address tokenA, address tokenB) private pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    function _sorted(address tokenA, address tokenB) private pure returns (address t0, address t1) {
        if (tokenA < tokenB) return (tokenA, tokenB);
        return (tokenB, tokenA);
    }

    function getReserves(address tokenA, address tokenB) external view returns (uint256 reserveA, uint256 reserveB) {
        bytes32 key = _pairKey(tokenA, tokenB);
        Reserves storage r = reserves[key];
        return (uint256(r.reserve0), uint256(r.reserve1));
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external onlyOwner {
        require(tokenA != tokenB, "Same token");
        require(amountA > 0 && amountB > 0, "Zero amount");

        (address t0,) = _sorted(tokenA, tokenB);
        bytes32 key = _pairKey(tokenA, tokenB);

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        (uint112 amt0, uint112 amt1) = tokenA == t0
            ? (uint112(amountA), uint112(amountB))
            : (uint112(amountB), uint112(amountA));

        reserves[key].reserve0 += amt0;
        reserves[key].reserve1 += amt1;

        emit LiquidityAdded(tokenA, tokenB, amountA, amountB);
    }

    function removeLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external onlyOwner {
        require(tokenA != tokenB, "Same token");
        require(amountA > 0 && amountB > 0, "Zero amount");

        (address t0,) = _sorted(tokenA, tokenB);
        bytes32 key = _pairKey(tokenA, tokenB);

        (uint112 amt0, uint112 amt1) = tokenA == t0
            ? (uint112(amountA), uint112(amountB))
            : (uint112(amountB), uint112(amountA));

        reserves[key].reserve0 -= amt0;
        reserves[key].reserve1 -= amt1;

        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(tokenA, tokenB, amountA, amountB);
    }

    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256) {
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0, "Zero amount");

        (address t0,) = _sorted(tokenIn, tokenOut);
        bytes32 key = _pairKey(tokenIn, tokenOut);
        Reserves storage r = reserves[key];

        (uint256 reserveIn, uint256 reserveOut) = tokenIn == t0
            ? (uint256(r.reserve0), uint256(r.reserve1))
            : (uint256(r.reserve1), uint256(r.reserve0));

        require(reserveIn > 0 && reserveOut > 0, "No liquidity");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        return numerator / denominator;
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut) external {
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0, "Zero amount");
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");

        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        (address t0,) = _sorted(tokenIn, tokenOut);
        bytes32 key = _pairKey(tokenIn, tokenOut);

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        if (tokenIn == t0) {
            reserves[key].reserve0 += uint112(amountIn);
            reserves[key].reserve1 -= uint112(amountOut);
        } else {
            reserves[key].reserve1 += uint112(amountIn);
            reserves[key].reserve0 -= uint112(amountOut);
        }

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
}
