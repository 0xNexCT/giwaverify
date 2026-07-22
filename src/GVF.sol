pragma solidity ^0.8.28;

import "@openzeppelin/token/ERC20/ERC20.sol";
import "@openzeppelin/access/Ownable2Step.sol";

contract GVF is ERC20, Ownable2Step {
    address public minter;

    error NotMinter();

    modifier onlyMinter() {
        if (msg.sender != minter) revert NotMinter();
        _;
    }

    constructor() ERC20("GiwaVerified Governance", "GVF") Ownable(msg.sender) {}

    function setMinter(address minter_) external onlyOwner {
        minter = minter_;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
