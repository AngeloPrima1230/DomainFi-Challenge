const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaghausMarketplace", function () {
  let marketplace;
  let mockNFT;
  let owner;
  let seller;
  let buyer;
  let feeRecipient;

  beforeEach(async function () {
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();

    // Deploy TaghausMarketplace
    const TaghausMarketplace = await ethers.getContractFactory("TaghausMarketplace");
    marketplace = await TaghausMarketplace.deploy();
    await marketplace.waitForDeployment();

    // Deploy MockNFT
    const MockNFT = await ethers.getContractFactory("MockNFT");
    mockNFT = await MockNFT.deploy();
    await mockNFT.waitForDeployment();

    // Add MockNFT as supported NFT contract
    await marketplace.addSupportedNFTContract(await mockNFT.getAddress());
  });

  describe("Token Management", function () {
    it("Should create a token", async function () {
      const name = "Test Domain";
      const symbol = "TD";
      const metadataURI = "https://example.com/metadata";

      const tx = await marketplace.createToken(name, symbol, metadataURI);
      const receipt = await tx.wait();
      
      const tokenCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = marketplace.interface.parseLog(log);
          return parsed.name === "TokenCreated";
        } catch (e) {
          return false;
        }
      });

      expect(tokenCreatedEvent).to.not.be.undefined;
      
      const tokenInfo = await marketplace.getTokenInfo(0);
      expect(tokenInfo.name).to.equal(name);
      expect(tokenInfo.symbol).to.equal(symbol);
      expect(tokenInfo.metadataURI).to.equal(metadataURI);
      expect(tokenInfo.creator).to.equal(owner.address);
      expect(tokenInfo.exists).to.be.true;
    });

    it("Should burn a token", async function () {
      // Create a token first
      await marketplace.createToken("Test Domain", "TD", "https://example.com/metadata");
      
      // Burn the token
      const tx = await marketplace.burnToken(0);
      const receipt = await tx.wait();
      
      const tokenBurnedEvent = receipt.logs.find(log => {
        try {
          const parsed = marketplace.interface.parseLog(log);
          return parsed.name === "TokenBurned";
        } catch (e) {
          return false;
        }
      });

      expect(tokenBurnedEvent).to.not.be.undefined;
      
      const tokenInfo = await marketplace.getTokenInfo(0);
      expect(tokenInfo.exists).to.be.false;
    });

    it("Should not allow non-owner to burn token", async function () {
      await marketplace.createToken("Test Domain", "TD", "https://example.com/metadata");
      
      await expect(
        marketplace.connect(seller).burnToken(0)
      ).to.be.revertedWith("Not token owner");
    });
  });

  describe("Marketplace Functions", function () {
    beforeEach(async function () {
      // Mint an NFT to seller
      await mockNFT.mint(seller.address, 1);
      
      // Seller approves marketplace to transfer NFT
      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 1);
    });

    it("Should create a market item", async function () {
      const price = ethers.parseEther("1.0");
      const duration = 86400; // 1 day

      const tx = await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        price,
        ethers.ZeroAddress, // ETH
        duration
      );
      const receipt = await tx.wait();

      const marketItemCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = marketplace.interface.parseLog(log);
          return parsed.name === "MarketItemCreated";
        } catch (e) {
          return false;
        }
      });

      expect(marketItemCreatedEvent).to.not.be.undefined;

      const marketItem = await marketplace.getMarketItem(0);
      expect(marketItem.nftContract).to.equal(await mockNFT.getAddress());
      expect(marketItem.tokenId).to.equal(1);
      expect(marketItem.seller).to.equal(seller.address);
      expect(marketItem.price).to.equal(price);
      expect(marketItem.active).to.be.true;
      expect(marketItem.sold).to.be.false;
    });

    it("Should create a market sale", async function () {
      // Create a market item first
      const price = ethers.parseEther("1.0");
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        price,
        ethers.ZeroAddress, // ETH
        86400
      );

      // Buyer purchases the item
      const tx = await marketplace.connect(buyer).createMarketSale(0, {
        value: price
      });
      const receipt = await tx.wait();

      const marketSaleCreatedEvent = receipt.logs.find(log => {
        try {
          const parsed = marketplace.interface.parseLog(log);
          return parsed.name === "MarketSaleCreated";
        } catch (e) {
          return false;
        }
      });

      expect(marketSaleCreatedEvent).to.not.be.undefined;

      const marketItem = await marketplace.getMarketItem(0);
      expect(marketItem.sold).to.be.true;
      expect(marketItem.active).to.be.false;
      expect(marketItem.owner).to.equal(buyer.address);

      // Check NFT ownership
      expect(await mockNFT.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should fetch market items", async function () {
      // Create multiple market items
      await mockNFT.mint(seller.address, 2);
      await mockNFT.mint(seller.address, 3);
      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 2);
      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 3);

      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        86400
      );

      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        2,
        ethers.parseEther("2.0"),
        ethers.ZeroAddress,
        86400
      );

      const [items, total] = await marketplace.fetchMarketItems(0, 10);
      expect(total).to.equal(2);
      expect(items.length).to.equal(2);
      expect(items[0].tokenId).to.equal(1);
      expect(items[1].tokenId).to.equal(2);
    });

    it("Should fetch own NFTs", async function () {
      // Create tokens for seller
      await marketplace.connect(seller).createToken("Domain 1", "D1", "https://example.com/1");
      await marketplace.connect(seller).createToken("Domain 2", "D2", "https://example.com/2");

      const tokens = await marketplace.fetchOwnNFTs(seller.address);
      expect(tokens.length).to.equal(2);
      expect(tokens[0].name).to.equal("Domain 1");
      expect(tokens[1].name).to.equal("Domain 2");
    });

    it("Should update market item", async function () {
      // Create a market item
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        86400
      );

      // Update the item
      const newPrice = ethers.parseEther("2.0");
      await marketplace.connect(seller).updateMarketItem(0, newPrice, ethers.ZeroAddress);

      const marketItem = await marketplace.getMarketItem(0);
      expect(marketItem.price).to.equal(newPrice);
    });

    it("Should cancel market item", async function () {
      // Create a market item
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        86400
      );

      // Cancel the item
      await marketplace.connect(seller).cancelMarketItem(0);

      const marketItem = await marketplace.getMarketItem(0);
      expect(marketItem.active).to.be.false;

      // Check NFT ownership returned to seller
      expect(await mockNFT.ownerOf(1)).to.equal(seller.address);
    });
  });

  describe("Admin Functions", function () {
    it("Should add supported currency", async function () {
      const currencyAddress = "0x1234567890123456789012345678901234567890";
      
      await marketplace.addSupportedCurrency(currencyAddress);
      
      const isSupported = await marketplace.isCurrencySupported(currencyAddress);
      expect(isSupported).to.be.true;
    });

    it("Should add supported NFT contract", async function () {
      const nftAddress = "0x1234567890123456789012345678901234567890";
      
      await marketplace.addSupportedNFTContract(nftAddress);
      
      const isSupported = await marketplace.isNFTContractSupported(nftAddress);
      expect(isSupported).to.be.true;
    });

    it("Should update platform fee", async function () {
      const newFee = 500; // 5%
      
      await marketplace.updatePlatformFee(newFee);
      
      const currentFee = await marketplace.platformFee();
      expect(currentFee).to.equal(newFee);
    });

    it("Should not allow fee > 10%", async function () {
      const highFee = 1500; // 15%
      
      await expect(
        marketplace.updatePlatformFee(highFee)
      ).to.be.revertedWith("Fee too high");
    });

    it("Should pause and unpause contract", async function () {
      await marketplace.pause();
      expect(await marketplace.paused()).to.be.true;

      await marketplace.unpause();
      expect(await marketplace.paused()).to.be.false;
    });
  });

  describe("Fee Calculations", function () {
    it("Should calculate platform fees correctly", async function () {
      const price = ethers.parseEther("1.0");
      const platformFee = await marketplace.platformFee();
      const expectedFee = (price * BigInt(platformFee)) / BigInt(10000);
      
      // Create and sell an item
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        price,
        ethers.ZeroAddress,
        86400
      );

      const balanceBefore = await ethers.provider.getBalance(feeRecipient.address);
      
      await marketplace.connect(buyer).createMarketSale(0, {
        value: price
      });

      const balanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      const feeReceived = balanceAfter - balanceBefore;
      
      expect(feeReceived).to.equal(expectedFee);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to call admin functions", async function () {
      await expect(
        marketplace.connect(seller).addSupportedCurrency("0x1234567890123456789012345678901234567890")
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        marketplace.connect(seller).updatePlatformFee(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        marketplace.connect(seller).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Edge Cases", function () {
    it("Should not allow creating market item with unsupported NFT contract", async function () {
      const unsupportedNFT = "0x1234567890123456789012345678901234567890";
      
      await expect(
        marketplace.connect(seller).createMarketItem(
          unsupportedNFT,
          1,
          ethers.parseEther("1.0"),
          ethers.ZeroAddress,
          86400
        )
      ).to.be.revertedWith("NFT contract not supported");
    });

    it("Should not allow creating market item with unsupported currency", async function () {
      const unsupportedCurrency = "0x1234567890123456789012345678901234567890";
      
      await expect(
        marketplace.connect(seller).createMarketItem(
          await mockNFT.getAddress(),
          1,
          ethers.parseEther("1.0"),
          unsupportedCurrency,
          86400
        )
      ).to.be.revertedWith("Currency not supported");
    });

    it("Should not allow buying own item", async function () {
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        86400
      );

      await expect(
        marketplace.connect(seller).createMarketSale(0, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Cannot buy own item");
    });

    it("Should not allow buying expired item", async function () {
      // Create item with very short duration
      await marketplace.connect(seller).createMarketItem(
        await mockNFT.getAddress(),
        1,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        1 // 1 second
      );

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 2000));

      await expect(
        marketplace.connect(buyer).createMarketSale(0, {
          value: ethers.parseEther("1.0")
        })
      ).to.be.revertedWith("Listing expired");
    });
  });
});
