pragma solidity ^0.8.28;

import "./Interfaces.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";
import "@openzeppelin/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/access/Ownable2Step.sol";

contract GiwaSwap is Ownable2Step {
    using SafeERC20 for IERC20;

    IVerifier public verifier;
    DojangAttesterId public attesterId;

    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant FEE_NUMERATOR = 3;
    uint256 public constant MAX_UINT112 = (1 << 112) - 1;

    struct Reserves {
        uint112 reserve0;
        uint112 reserve1;
        uint32 lastBlock;
    }

    mapping(bytes32 => Reserves) public reserves;

    event LiquidityAdded(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed tokenA, address indexed tokenB, uint256 amountA, uint256 amountB);
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address verifier_, DojangAttesterId attesterId_) Ownable(msg.sender) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
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
        require(amountA <= MAX_UINT112, "amountA overflow");
        require(amountB <= MAX_UINT112, "amountB overflow");

        (address t0,) = _sorted(tokenA, tokenB);
        bytes32 key = _pairKey(tokenA, tokenB);

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        (uint112 amt0, uint112 amt1) = tokenA == t0
            ? (uint112(amountA), uint112(amountB))
            : (uint112(amountB), uint112(amountA));

        require(uint256(reserves[key].reserve0) + amt0 <= MAX_UINT112, "reserve0 overflow");
        require(uint256(reserves[key].reserve1) + amt1 <= MAX_UINT112, "reserve1 overflow");

        reserves[key].reserve0 += amt0;
        reserves[key].reserve1 += amt1;

        emit LiquidityAdded(tokenA, tokenB, amountA, amountB);
    }

    function removeLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external onlyOwner {
        require(tokenA != tokenB, "Same token");
        require(amountA > 0 && amountB > 0, "Zero amount");
        require(amountA <= MAX_UINT112, "amountA overflow");
        require(amountB <= MAX_UINT112, "amountB overflow");

        (address t0,) = _sorted(tokenA, tokenB);
        bytes32 key = _pairKey(tokenA, tokenB);

        (uint112 amt0, uint112 amt1) = tokenA == t0
            ? (uint112(amountA), uint112(amountB))
            : (uint112(amountB), uint112(amountA));

        require(reserves[key].reserve0 >= amt0, "reserve0 underflow");
        require(reserves[key].reserve1 >= amt1, "reserve1 underflow");

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

    function quote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, bool ok) {
        if (tokenIn == tokenOut || amountIn == 0) return (0, false);
        (address t0,) = _sorted(tokenIn, tokenOut);
        bytes32 key = _pairKey(tokenIn, tokenOut);
        Reserves storage r = reserves[key];
        (uint256 reserveIn, uint256 reserveOut) = tokenIn == t0
            ? (uint256(r.reserve0), uint256(r.reserve1))
            : (uint256(r.reserve1), uint256(r.reserve0));
        if (reserveIn == 0 || reserveOut == 0) return (0, false);
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        return (numerator / denominator, true);
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, uint256 deadline) external {
        require(block.timestamp <= deadline, "Expired");
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0, "Zero amount");
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");

        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= minAmountOut, "Insufficient output amount");

        (address t0,) = _sorted(tokenIn, tokenOut);
        bytes32 key = _pairKey(tokenIn, tokenOut);

        uint256 balanceBefore = IERC20(tokenIn).balanceOf(address(this));
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        uint256 balanceAfter = IERC20(tokenIn).balanceOf(address(this));
        uint256 actualIn = balanceAfter - balanceBefore;

        uint256 actualOut = getAmountOut(tokenIn, tokenOut, actualIn);
        require(actualOut >= minAmountOut, "Insufficient output amount");

        if (tokenIn == t0) {
            require(uint256(reserves[key].reserve0) + actualIn <= MAX_UINT112, "reserve0 overflow");
            require(reserves[key].reserve1 >= actualOut, "reserve1 underflow");
            reserves[key].reserve0 += uint112(actualIn);
            reserves[key].reserve1 -= uint112(actualOut);
        } else {
            require(uint256(reserves[key].reserve1) + actualIn <= MAX_UINT112, "reserve1 overflow");
            require(reserves[key].reserve0 >= actualOut, "reserve0 underflow");
            reserves[key].reserve1 += uint112(actualIn);
            reserves[key].reserve0 -= uint112(actualOut);
        }

        IERC20(tokenOut).safeTransfer(msg.sender, actualOut);

        emit Swap(msg.sender, tokenIn, tokenOut, actualIn, actualOut);
    }
}
