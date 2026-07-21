pragma solidity ^0.8.28;

import "./Interfaces.sol";

interface IERC721Minimal {
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract GiwaP2P {
    IVerifier public verifier;
    DojangAttesterId public attesterId;
    address public owner;

    enum ListingStatus { Active, Filled, Cancelled }

    struct Listing {
        uint256 id;
        address seller;
        address token;
        uint256 tokenId;
        bool isERC721;
        uint256 amount;
        uint256 price;
        ListingStatus status;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed id, address indexed seller, address indexed token, uint256 amount, uint256 price);
    event Bought(uint256 indexed id, address indexed buyer, address indexed seller);
    event Cancelled(uint256 indexed id);

    constructor(address verifier_, DojangAttesterId attesterId_) {
        require(verifier_ != address(0), "Invalid verifier");
        verifier = IVerifier(verifier_);
        attesterId = attesterId_;
        owner = msg.sender;
    }

    modifier onlyVerified() {
        require(verifier.isVerified(msg.sender, attesterId), "Not verified");
        _;
    }

    function list(
        address token,
        uint256 tokenId,
        bool isERC721,
        uint256 amount,
        uint256 price
    ) external onlyVerified returns (uint256) {
        require(token != address(0), "Invalid token");
        require(price > 0, "Zero price");
        require(amount > 0, "Zero amount");

        listingCount++;
        listings[listingCount] = Listing({
            id: listingCount,
            seller: msg.sender,
            token: token,
            tokenId: tokenId,
            isERC721: isERC721,
            amount: amount,
            price: price,
            status: ListingStatus.Active
        });

        if (isERC721) {
            IERC721Minimal(token).transferFrom(msg.sender, address(this), tokenId);
        }

        emit Listed(listingCount, msg.sender, token, amount, price);
        return listingCount;
    }

    function buy(uint256 listingId) external payable onlyVerified {
        Listing storage listing = listings[listingId];
        require(listing.status == ListingStatus.Active, "Not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        listing.status = ListingStatus.Filled;

        payable(listing.seller).transfer(listing.price);

        if (listing.isERC721) {
            IERC721Minimal(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);
        }

        uint256 excess = msg.value - listing.price;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        emit Bought(listingId, msg.sender, listing.seller);
    }

    function cancel(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Not seller");
        require(listing.status == ListingStatus.Active, "Not active");

        listing.status = ListingStatus.Cancelled;

        if (listing.isERC721) {
            IERC721Minimal(listing.token).transferFrom(address(this), listing.seller, listing.tokenId);
        }

        emit Cancelled(listingId);
    }
}
