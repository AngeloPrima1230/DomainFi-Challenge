const { ethers } = require('ethers');
const { broadcastAuctionEvent, broadcastBidEvent } = require('../server');

class BlockchainListener {
  constructor() {
    this.provider = null;
    this.contract = null;
    this.isListening = false;
  }

  async initialize() {
    try {
      // Initialize provider
      const rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC;
      if (!rpcUrl) {
        throw new Error('ETHEREUM_SEPOLIA_RPC not configured');
      }
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize contract
      const contractAddress = process.env.AUCTION_CONTRACT_ADDRESS;
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        console.log('⚠️  Auction contract not deployed yet. Run deployment first.');
        return false;
      }

      // Contract ABI (simplified for key events)
      const contractABI = [
        "event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 startingPrice, uint256 reservePrice, uint8 auctionType)",
        "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
        "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid)",
        "event AuctionSettled(uint256 indexed auctionId, address indexed winner, address indexed seller, uint256 amount)",
        "event AuctionCancelled(uint256 indexed auctionId)"
      ];

      this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
      
      console.log('✅ Blockchain listener initialized');
      console.log(`📡 Listening to contract: ${contractAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain listener:', error.message);
      return false;
    }
  }

  async startListening() {
    if (this.isListening) {
      console.log('⚠️  Blockchain listener already running');
      return;
    }

    if (!this.contract) {
      console.log('⚠️  Contract not initialized. Call initialize() first.');
      return;
    }

    try {
      // Listen for auction creation
      this.contract.on('AuctionCreated', (auctionId, seller, nftContract, tokenId, startingPrice, reservePrice, auctionType) => {
        console.log(`🎯 New auction created: ${auctionId}`);
        broadcastAuctionEvent(auctionId.toString(), 'created', {
          seller,
          nftContract,
          tokenId: tokenId.toString(),
          startingPrice: ethers.formatEther(startingPrice),
          reservePrice: ethers.formatEther(reservePrice),
          auctionType: auctionType.toString()
        });
      });

      // Listen for bids
      this.contract.on('BidPlaced', (auctionId, bidder, amount) => {
        console.log(`💰 New bid on auction ${auctionId}: ${ethers.formatEther(amount)} ETH from ${bidder}`);
        broadcastBidEvent(auctionId.toString(), {
          bidder,
          amount: ethers.formatEther(amount),
          amountWei: amount.toString()
        });
      });

      // Listen for auction endings
      this.contract.on('AuctionEnded', (auctionId, winner, winningBid) => {
        console.log(`🏁 Auction ${auctionId} ended. Winner: ${winner}, Bid: ${ethers.formatEther(winningBid)} ETH`);
        broadcastAuctionEvent(auctionId.toString(), 'ended', {
          winner,
          winningBid: ethers.formatEther(winningBid)
        });
      });

      // Listen for settlements
      this.contract.on('AuctionSettled', (auctionId, winner, seller, amount) => {
        console.log(`✅ Auction ${auctionId} settled. Amount: ${ethers.formatEther(amount)} ETH`);
        broadcastAuctionEvent(auctionId.toString(), 'settled', {
          winner,
          seller,
          amount: ethers.formatEther(amount)
        });
      });

      // Listen for cancellations
      this.contract.on('AuctionCancelled', (auctionId) => {
        console.log(`❌ Auction ${auctionId} cancelled`);
        broadcastAuctionEvent(auctionId.toString(), 'cancelled', {});
      });

      this.isListening = true;
      console.log('🎧 Blockchain event listener started');
      
    } catch (error) {
      console.error('❌ Failed to start blockchain listener:', error.message);
    }
  }

  stopListening() {
    if (!this.isListening) {
      console.log('⚠️  Blockchain listener not running');
      return;
    }

    try {
      this.contract.removeAllListeners();
      this.isListening = false;
      console.log('🛑 Blockchain event listener stopped');
    } catch (error) {
      console.error('❌ Error stopping blockchain listener:', error.message);
    }
  }

  async getAuctionDetails(auctionId) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // This would need the full contract ABI with view functions
      // For now, return basic info
      return {
        auctionId,
        status: 'active', // This would come from contract call
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Error getting auction ${auctionId} details:`, error.message);
      return null;
    }
  }
}

module.exports = BlockchainListener;
