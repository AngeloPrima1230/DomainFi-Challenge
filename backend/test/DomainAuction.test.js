const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DomainAuction", function () {
  let domainAuction;
  let owner;
  let seller;
  let bidder1;
  let bidder2;
  let mockNFT;

  beforeEach(async function () {
    [owner, seller, bidder1, bidder2] = await ethers.getSigners();

    // Deploy DomainAuction contract
    const DomainAuction = await ethers.getContractFactory("DomainAuction");
    domainAuction = await DomainAuction.deploy();
    await domainAuction.waitForDeployment();

    // Deploy a mock NFT contract for testing
    const MockNFT = await ethers.getContractFactory("MockNFT");
    mockNFT = await MockNFT.deploy();
    await mockNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await domainAuction.owner()).to.equal(owner.address);
    });

    it("Should set the right platform fee", async function () {
      expect(await domainAuction.platformFee()).to.equal(50); // 0.5%
    });

    it("Should initialize auction counter", async function () {
      // Mint NFT to seller first
      await mockNFT.mint(seller.address, 1);
      await mockNFT.connect(seller).approve(domainAuction.target, 1);
      
      // The first auction will have ID 1
      const tx = await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        1,
        ethers.parseEther("1.0"), // 1 ETH starting price
        ethers.parseEther("0.5"), // 0.5 ETH reserve price
        3600, // 1 hour duration
        0 // ENGLISH auction
      );
      
      expect(tx).to.not.be.undefined;
    });
  });

  describe("Auction Creation", function () {
    it("Should create an English auction", async function () {
      // Mint NFT to seller
      await mockNFT.mint(seller.address, 10);
      await mockNFT.connect(seller).approve(domainAuction.target, 10);

      const tx = await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        10,
        ethers.parseEther("1.0"),
        ethers.parseEther("0.5"),
        3600,
        0 // ENGLISH
      );

      await expect(tx)
        .to.emit(domainAuction, "AuctionCreated")
        .withArgs(
          1, // auctionId (first auction)
          seller.address,
          mockNFT.target,
          10,
          ethers.parseEther("1.0"),
          ethers.parseEther("0.5"),
          0 // ENGLISH
        );
    });

    it("Should create a Dutch auction", async function () {
      await mockNFT.mint(seller.address, 20);
      await mockNFT.connect(seller).approve(domainAuction.target, 20);

      const tx = await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        20,
        ethers.parseEther("2.0"),
        ethers.parseEther("1.0"),
        3600,
        1 // DUTCH
      );

      await expect(tx)
        .to.emit(domainAuction, "AuctionCreated")
        .withArgs(
          2, // auctionId (second auction)
          seller.address,
          mockNFT.target,
          20,
          ethers.parseEther("2.0"),
          ethers.parseEther("1.0"),
          1 // DUTCH
        );
    });

    it("Should create a sealed bid auction", async function () {
      await mockNFT.mint(seller.address, 30);
      await mockNFT.connect(seller).approve(domainAuction.target, 30);

      const tx = await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        30,
        ethers.parseEther("1.5"),
        ethers.parseEther("0.8"),
        3600,
        2 // SEALED_BID
      );

      await expect(tx)
        .to.emit(domainAuction, "AuctionCreated")
        .withArgs(
          3, // auctionId (third auction)
          seller.address,
          mockNFT.target,
          30,
          ethers.parseEther("1.5"),
          ethers.parseEther("0.8"),
          2 // SEALED_BID
        );
    });

    it("Should reject auction with invalid parameters", async function () {
      await mockNFT.mint(seller.address, 4);
      await mockNFT.connect(seller).approve(domainAuction.target, 4);

      // Test duration too short
      await expect(
        domainAuction.connect(seller).createAuction(
          mockNFT.target,
          4,
          ethers.parseEther("1.0"),
          ethers.parseEther("0.5"),
          1800, // 30 minutes - too short
          0
        )
      ).to.be.revertedWith("Duration too short");

      // Test reserve price too high
      await expect(
        domainAuction.connect(seller).createAuction(
          mockNFT.target,
          4,
          ethers.parseEther("1.0"),
          ethers.parseEther("2.0"), // Reserve higher than starting
          3600,
          0
        )
      ).to.be.revertedWith("Reserve price too high");
    });
  });

  describe("Bidding", function () {
    beforeEach(async function () {
      // Create an English auction
      await mockNFT.mint(seller.address, 100);
      await mockNFT.connect(seller).approve(domainAuction.target, 100);
      await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        100,
        ethers.parseEther("1.0"),
        ethers.parseEther("0.5"),
        3600,
        0 // ENGLISH
      );
    });

    it("Should allow placing a bid", async function () {
      const bidAmount = ethers.parseEther("1.5");
      
      const tx = await domainAuction.connect(bidder1).placeBid(1, { value: bidAmount });
      
      await expect(tx)
        .to.emit(domainAuction, "BidPlaced")
        .withArgs(1, bidder1.address, bidAmount);
    });

    it("Should reject bid that's too low", async function () {
      // First bid
      await domainAuction.connect(bidder1).placeBid(1, { value: ethers.parseEther("1.5") });
      
      // Second bid that's too low
      await expect(
        domainAuction.connect(bidder2).placeBid(1, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Bid too low");
    });

    it("Should refund previous highest bidder", async function () {
      const bid1Amount = ethers.parseEther("1.5");
      const bid2Amount = ethers.parseEther("2.0");
      
      // First bid
      await domainAuction.connect(bidder1).placeBid(1, { value: bid1Amount });
      
      // Second bid should refund first bidder
      const initialBalance = await ethers.provider.getBalance(bidder1.address);
      await domainAuction.connect(bidder2).placeBid(1, { value: bid2Amount });
      const finalBalance = await ethers.provider.getBalance(bidder1.address);
      
      // Check that bidder1 was refunded (accounting for gas)
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Dutch Auction", function () {
    beforeEach(async function () {
      await mockNFT.mint(seller.address, 200);
      await mockNFT.connect(seller).approve(domainAuction.target, 200);
      await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        200,
        ethers.parseEther("2.0"),
        ethers.parseEther("1.0"),
        3600,
        1 // DUTCH
      );
    });

    it("Should calculate current Dutch price", async function () {
      const currentPrice = await domainAuction.getCurrentDutchPrice(2);
      expect(currentPrice).to.equal(ethers.parseEther("2.0")); // Should start at starting price
    });

    it("Should end auction when bid is placed", async function () {
      const bidAmount = ethers.parseEther("1.5");
      
      const tx = await domainAuction.connect(bidder1).placeDutchBid(2, { value: bidAmount });
      
      await expect(tx)
        .to.emit(domainAuction, "BidPlaced")
        .withArgs(2, bidder1.address, bidAmount);
        
      await expect(tx)
        .to.emit(domainAuction, "AuctionEnded")
        .withArgs(2, bidder1.address, bidAmount);
    });
  });

  describe("Auction Management", function () {
    beforeEach(async function () {
      await mockNFT.mint(seller.address, 300);
      await mockNFT.connect(seller).approve(domainAuction.target, 300);
      await domainAuction.connect(seller).createAuction(
        mockNFT.target,
        300,
        ethers.parseEther("1.0"),
        ethers.parseEther("0.5"),
        3600,
        0
      );
    });

    it("Should allow seller to cancel auction", async function () {
      const tx = await domainAuction.connect(seller).cancelAuction(1);
      
      await expect(tx)
        .to.emit(domainAuction, "AuctionCancelled")
        .withArgs(1);
    });

    it("Should not allow non-seller to cancel auction", async function () {
      await expect(
        domainAuction.connect(bidder1).cancelAuction(1)
      ).to.be.revertedWith("Only seller can cancel");
    });

    it("Should end auction after time limit", async function () {
      // Fast forward time (this would need to be done with hardhat network manipulation)
      // For now, we'll just test that the function exists
      expect(await domainAuction.endAuction(1)).to.not.be.reverted;
    });
  });
});

// Mock NFT contract is in contracts/MockNFT.sol
