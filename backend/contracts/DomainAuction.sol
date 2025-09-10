// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DomainAuction
 * @dev Auction contract for tokenized domains built on Doma Protocol
 * Supports English, Dutch, and Sealed Bid auctions
 */
contract DomainAuction is ReentrancyGuard, Ownable {

    // Auction types
    enum AuctionType {
        ENGLISH,    // Ascending price with time limit
        DUTCH,      // Descending price until first bidder
        SEALED_BID  // Blind bidding with highest bidder wins
    }

    // Auction status
    enum AuctionStatus {
        ACTIVE,
        ENDED,
        CANCELLED,
        SETTLED
    }

    // Auction structure
    struct Auction {
        uint256 auctionId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 currentPrice;
        uint256 startTime;
        uint256 endTime;
        AuctionType auctionType;
        AuctionStatus status;
        address highestBidder;
        uint256 highestBid;
        bool isSettled;
    }

    // Bid structure for sealed bids
    struct SealedBid {
        address bidder;
        uint256 amount;
        bytes32 commitment;
        bool revealed;
    }

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        AuctionType auctionType
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionSettled(
        uint256 indexed auctionId,
        address indexed winner,
        address indexed seller,
        uint256 amount
    );

    event AuctionCancelled(uint256 indexed auctionId);

    // State variables
    uint256 private _auctionIds;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => SealedBid)) public sealedBids;
    mapping(uint256 => address[]) public auctionBidders;
    
    // Platform fee (0.5%)
    uint256 public platformFee = 50; // 0.5% = 50 basis points
    uint256 public constant BASIS_POINTS = 10000;

    // Minimum auction duration
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 7 days;

    // Dutch auction price decrease interval
    uint256 public constant DUTCH_PRICE_DECREASE_INTERVAL = 10 minutes;
    uint256 public constant DUTCH_PRICE_DECREASE_AMOUNT = 5; // 5% decrease

    constructor() Ownable(msg.sender) {
        _auctionIds = 1; // Start from 1
    }

    /**
     * @dev Create a new auction
     * @param nftContract Address of the domain NFT contract
     * @param tokenId ID of the domain NFT
     * @param startingPrice Starting price for the auction
     * @param reservePrice Minimum price to accept (0 for no reserve)
     * @param duration Duration of the auction in seconds
     * @param auctionType Type of auction (ENGLISH, DUTCH, SEALED_BID)
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 duration,
        AuctionType auctionType
    ) external returns (uint256) {
        require(duration >= MIN_AUCTION_DURATION, "Duration too short");
        require(duration <= MAX_AUCTION_DURATION, "Duration too long");
        require(startingPrice > 0, "Starting price must be > 0");
        require(reservePrice <= startingPrice, "Reserve price too high");

        // Transfer NFT to auction contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        uint256 auctionId = _auctionIds;
        _auctionIds++;

        auctions[auctionId] = Auction({
            auctionId: auctionId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            currentPrice: startingPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            auctionType: auctionType,
            status: AuctionStatus.ACTIVE,
            highestBidder: address(0),
            highestBid: 0,
            isSettled: false
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            nftContract,
            tokenId,
            startingPrice,
            reservePrice,
            auctionType
        );

        return auctionId;
    }

    /**
     * @dev Place a bid on an English auction
     * @param auctionId ID of the auction
     */
    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(auction.auctionType == AuctionType.ENGLISH, "Wrong auction type");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        // Add bidder to list if not already there
        bool found = false;
        for (uint i = 0; i < auctionBidders[auctionId].length; i++) {
            if (auctionBidders[auctionId][i] == msg.sender) {
                found = true;
                break;
            }
        }
        if (!found) {
            auctionBidders[auctionId].push(msg.sender);
        }

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev Place a bid on a Dutch auction
     * @param auctionId ID of the auction
     */
    function placeDutchBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(auction.auctionType == AuctionType.DUTCH, "Wrong auction type");
        require(block.timestamp < auction.endTime, "Auction ended");

        uint256 currentPrice = getCurrentDutchPrice(auctionId);
        require(msg.value >= currentPrice, "Bid below current price");

        // End the auction immediately
        auction.status = AuctionStatus.ENDED;
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        auction.endTime = block.timestamp;

        emit BidPlaced(auctionId, msg.sender, msg.value);
        emit AuctionEnded(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev Submit a sealed bid commitment
     * @param auctionId ID of the auction
     * @param commitment Hash of bid amount and salt
     */
    function submitSealedBid(uint256 auctionId, bytes32 commitment) external payable {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(auction.auctionType == AuctionType.SEALED_BID, "Wrong auction type");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > 0, "Bid must be > 0");

        sealedBids[auctionId][msg.sender] = SealedBid({
            bidder: msg.sender,
            amount: msg.value,
            commitment: commitment,
            revealed: false
        });

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev Reveal a sealed bid
     * @param auctionId ID of the auction
     * @param amount Bid amount
     * @param salt Random salt used for commitment
     */
    function revealSealedBid(uint256 auctionId, uint256 amount, bytes32 salt) external {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ENDED, "Auction not ended");
        require(auction.auctionType == AuctionType.SEALED_BID, "Wrong auction type");

        SealedBid storage bid = sealedBids[auctionId][msg.sender];
        require(!bid.revealed, "Bid already revealed");
        require(bid.amount == amount, "Bid amount mismatch");
        require(keccak256(abi.encodePacked(amount, salt)) == bid.commitment, "Invalid commitment");

        bid.revealed = true;

        // Update highest bid if this is higher
        if (amount > auction.highestBid) {
            auction.highestBid = amount;
            auction.highestBidder = msg.sender;
        }
    }

    /**
     * @dev End an auction (can be called by anyone after end time)
     * @param auctionId ID of the auction
     */
    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.status = AuctionStatus.ENDED;

        if (auction.auctionType == AuctionType.SEALED_BID) {
            // For sealed bids, wait for reveal period
            auction.endTime = block.timestamp + 1 hours; // 1 hour reveal period
        } else {
            emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);
        }
    }

    /**
     * @dev Settle an auction and transfer NFT to winner
     * @param auctionId ID of the auction
     */
    function settleAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.ENDED, "Auction not ended");
        require(!auction.isSettled, "Auction already settled");
        require(auction.highestBid >= auction.reservePrice, "Reserve not met");

        auction.isSettled = true;
        auction.status = AuctionStatus.SETTLED;

        // Calculate platform fee
        uint256 platformFeeAmount = (auction.highestBid * platformFee) / BASIS_POINTS;
        uint256 sellerAmount = auction.highestBid - platformFeeAmount;

        // Transfer NFT to winner
        IERC721(auction.nftContract).transferFrom(
            address(this),
            auction.highestBidder,
            auction.tokenId
        );

        // Transfer funds
        payable(owner()).transfer(platformFeeAmount);
        payable(auction.seller).transfer(sellerAmount);

        emit AuctionSettled(auctionId, auction.highestBidder, auction.seller, auction.highestBid);
    }

    /**
     * @dev Cancel an auction (only seller can cancel)
     * @param auctionId ID of the auction
     */
    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(msg.sender == auction.seller, "Only seller can cancel");
        require(auction.status == AuctionStatus.ACTIVE, "Auction not active");

        auction.status = AuctionStatus.CANCELLED;

        // Return NFT to seller
        IERC721(auction.nftContract).transferFrom(
            address(this),
            auction.seller,
            auction.tokenId
        );

        // Refund highest bidder if any
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        emit AuctionCancelled(auctionId);
    }

    /**
     * @dev Get current Dutch auction price
     * @param auctionId ID of the auction
     * @return Current price
     */
    function getCurrentDutchPrice(uint256 auctionId) public view returns (uint256) {
        Auction storage auction = auctions[auctionId];
        require(auction.auctionType == AuctionType.DUTCH, "Not a Dutch auction");

        uint256 timeElapsed = block.timestamp - auction.startTime;
        uint256 decreaseIntervals = timeElapsed / DUTCH_PRICE_DECREASE_INTERVAL;
        uint256 decreasePercentage = decreaseIntervals * DUTCH_PRICE_DECREASE_AMOUNT;

        if (decreasePercentage >= 100) {
            return auction.reservePrice;
        }

        uint256 decreaseAmount = (auction.startingPrice * decreasePercentage) / 100;
        uint256 currentPrice = auction.startingPrice - decreaseAmount;

        return currentPrice > auction.reservePrice ? currentPrice : auction.reservePrice;
    }

    /**
     * @dev Get auction details
     * @param auctionId ID of the auction
     * @return Auction details
     */
    function getAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    /**
     * @dev Get bidders for an auction
     * @param auctionId ID of the auction
     * @return Array of bidder addresses
     */
    function getAuctionBidders(uint256 auctionId) external view returns (address[] memory) {
        return auctionBidders[auctionId];
    }

    /**
     * @dev Update platform fee (only owner)
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee too high"); // Max 5%
        platformFee = newFee;
    }

    /**
     * @dev Withdraw platform fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

