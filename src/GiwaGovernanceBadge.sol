pragma solidity ^0.8.28;

import "@openzeppelin/token/ERC721/ERC721.sol";
import "@openzeppelin/access/Ownable.sol";

contract GiwaGovernanceBadge is ERC721, Ownable {
    address public minter;
    uint256 private _nextTokenId;

    error Soulbound();

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter");
        _;
    }

    constructor() ERC721("GiwaVerify Governance Participant", "GVGOV") Ownable(msg.sender) {}

    function setMinter(address minter_) external onlyOwner {
        minter = minter_;
    }

    function mintOnFirstVote(address voter) external onlyMinter returns (uint256) {
        _nextTokenId++;
        _safeMint(voter, _nextTokenId);
        return _nextTokenId;
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return "data:application/json;base64,eyJuYW1lIjoiR2l3YVZlcmlmeSBHb3Zlcm5hbmNlIFBhcnRpY2lwYW50IiwiZGVzY3JpcHRpb24iOiJUaGlzIG5vbi10cmFuc2ZlcmFibGUgYmFkZ2UgaXMgYXdhcmRlZCB0byB3YWxsZXRzIHRoYXQgcGFydGljaXBhdGUgaW4gZ292ZXJuYW5jZSBvbiB0aGUgR2l3YVZlcmlmeSBlY29zeXN0ZW0uIE9uZSB2b3RlLCBvbmUgYmFkZ2UuIiwiYXR0cmlidXRlcyI6W119";
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        if (_ownerOf(tokenId) != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
