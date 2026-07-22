pragma solidity ^0.8.28;

import "@openzeppelin/token/ERC20/ERC20.sol";
import "@openzeppelin/access/Ownable2Step.sol";

contract GiwaToken is ERC20, Ownable2Step {
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Not minter");
        _;
    }

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) Ownable(msg.sender) {
        minter = msg.sender;
    }

    function setMinter(address newMinter) external onlyMinter {
        require(newMinter != address(0), "Invalid minter");
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
}
