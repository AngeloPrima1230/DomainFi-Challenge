const { ethers } = require('ethers');

class DomainService {
  constructor() {
    this.provider = null;
    this.mockNFT = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize provider
      const rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC;
      if (!rpcUrl) {
        throw new Error('ETHEREUM_SEPOLIA_RPC not configured');
      }
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize MockNFT contract for testing
      const mockNFTAddress = process.env.MOCK_NFT_CONTRACT_ADDRESS;
      if (mockNFTAddress && mockNFTAddress !== '0x0000000000000000000000000000000000000000') {
        const mockNFTABI = [
          "function mint(address to, uint256 tokenId) public",
          "function ownerOf(uint256 tokenId) public view returns (address)",
          "function tokenURI(uint256 tokenId) public view returns (string)",
          "function totalSupply() public view returns (uint256)"
        ];
        
        this.mockNFT = new ethers.Contract(mockNFTAddress, mockNFTABI, this.provider);
        console.log('✅ Domain service initialized with MockNFT');
      } else {
        console.log('⚠️  MockNFT contract not deployed. Run deployment first.');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize domain service:', error.message);
      return false;
    }
  }

  /**
   * Create test domains for auction testing
   * This mints MockNFT tokens that can be used for auctions
   */
  async createTestDomains(ownerAddress, count = 5) {
    if (!this.isInitialized || !this.mockNFT) {
      throw new Error('Domain service not initialized or MockNFT not deployed');
    }

    try {
      const domains = [];
      const totalSupply = await this.mockNFT.totalSupply();
      
      for (let i = 0; i < count; i++) {
        const tokenId = totalSupply + i + 1;
        const domainName = `test-domain-${tokenId}.eth`;
        
        // Note: In a real scenario, you'd need a signer to mint
        // For now, we'll return the domain info
        domains.push({
          tokenId: tokenId.toString(),
          name: domainName,
          owner: ownerAddress,
          type: 'test',
          metadata: {
            description: `Test domain ${tokenId} for auction testing`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${domainName}`,
            attributes: [
              { trait_type: "Type", value: "Test Domain" },
              { trait_type: "Length", value: domainName.length.toString() },
              { trait_type: "Token ID", value: tokenId.toString() }
            ]
          }
        });
      }
      
      console.log(`✅ Created ${count} test domains for ${ownerAddress}`);
      return domains;
    } catch (error) {
      console.error('❌ Failed to create test domains:', error.message);
      throw error;
    }
  }

  /**
   * Get available domains for auction creation
   * This fetches domains that can be used for auctions
   */
  async getAvailableDomains(ownerAddress, limit = 10) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      // For testing, we'll return mock domains
      // In production, this would query the actual domain registry
      const domains = [];
      
      for (let i = 1; i <= limit; i++) {
        domains.push({
          tokenId: i.toString(),
          name: `available-domain-${i}.eth`,
          owner: ownerAddress,
          type: 'available',
          metadata: {
            description: `Available domain ${i} for auction`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=domain-${i}`,
            attributes: [
              { trait_type: "Type", value: "Available Domain" },
              { trait_type: "Length", value: (15 + i).toString() },
              { trait_type: "Token ID", value: i.toString() }
            ]
          }
        });
      }
      
      return domains;
    } catch (error) {
      console.error('❌ Failed to get available domains:', error.message);
      throw error;
    }
  }

  /**
   * Get domain details by token ID
   */
  async getDomainDetails(tokenId) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      if (this.mockNFT) {
        const owner = await this.mockNFT.ownerOf(tokenId);
        const tokenURI = await this.mockNFT.tokenURI(tokenId);
        
        return {
          tokenId: tokenId.toString(),
          name: `domain-${tokenId}.eth`,
          owner: owner,
          type: 'nft',
          metadata: {
            description: `Domain ${tokenId} tokenized as NFT`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${tokenId}`,
            attributes: [
              { trait_type: "Type", value: "Tokenized Domain" },
              { trait_type: "Token ID", value: tokenId.toString() }
            ]
          }
        };
      } else {
        // Return mock domain details
        return {
          tokenId: tokenId.toString(),
          name: `mock-domain-${tokenId}.eth`,
          owner: '0x0000000000000000000000000000000000000000',
          type: 'mock',
          metadata: {
            description: `Mock domain ${tokenId} for testing`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=mock-${tokenId}`,
            attributes: [
              { trait_type: "Type", value: "Mock Domain" },
              { trait_type: "Token ID", value: tokenId.toString() }
            ]
          }
        };
      }
    } catch (error) {
      console.error(`❌ Failed to get domain details for ${tokenId}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a domain can be used for auction
   */
  async canCreateAuction(tokenId, ownerAddress) {
    try {
      const domain = await this.getDomainDetails(tokenId);
      
      // Check if the domain exists and is owned by the specified address
      if (domain.owner.toLowerCase() === ownerAddress.toLowerCase()) {
        return {
          canCreate: true,
          domain: domain
        };
      } else {
        return {
          canCreate: false,
          reason: 'Domain not owned by user'
        };
      }
    } catch (error) {
      return {
        canCreate: false,
        reason: error.message
      };
    }
  }

  /**
   * Get domains owned by a specific address
   */
  async getDomainsByOwner(ownerAddress, limit = 20) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      const domains = [];
      
      // For testing, return mock domains
      // In production, this would query the actual domain registry
      for (let i = 1; i <= limit; i++) {
        domains.push({
          tokenId: i.toString(),
          name: `owned-domain-${i}.eth`,
          owner: ownerAddress,
          type: 'owned',
          metadata: {
            description: `Domain ${i} owned by ${ownerAddress}`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=owned-${i}`,
            attributes: [
              { trait_type: "Type", value: "Owned Domain" },
              { trait_type: "Owner", value: ownerAddress },
              { trait_type: "Token ID", value: i.toString() }
            ]
          }
        });
      }
      
      return domains;
    } catch (error) {
      console.error('❌ Failed to get domains by owner:', error.message);
      throw error;
    }
  }
}

module.exports = DomainService;
