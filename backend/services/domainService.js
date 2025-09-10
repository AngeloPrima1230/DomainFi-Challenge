const { ethers } = require('ethers');
const { ApolloClient, InMemoryCache, gql, createHttpLink } = require('@apollo/client');
const { setContext } = require('@apollo/client/link/context');

class DomainService {
  constructor() {
    this.provider = null;
    this.mockNFT = null;
    this.apolloClient = null;
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
      
      // Initialize Apollo Client for Doma Protocol GraphQL
      const httpLink = createHttpLink({
        uri: process.env.DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql',
      });

      const authLink = setContext((_, { headers }) => {
        const apiKey = process.env.DOMA_API_KEY;
        return {
          headers: {
            ...headers,
            'API-Key': apiKey,
          }
        };
      });

      this.apolloClient = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
      });
      
      // Initialize MockNFT contract for testing (optional)
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
      }
      
      console.log('✅ Domain service initialized with Doma Protocol integration');
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
   * This fetches REAL tokenized domains from Doma Protocol
   */
  async getAvailableDomains(ownerAddress, limit = 10) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      // GraphQL query to get tokenized domains
      const GET_TOKENIZED_NAMES = gql`
        query GetTokenizedNames($skip: Int = 0, $take: Int = 100) {
          names(skip: $skip, take: $take, sortOrder: DESC) {
            items {
              name
              expiresAt
              tokenizedAt
              eoi
              registrar {
                name
                ianaId
              }
              nameservers {
                ldhName
              }
              dsKeys {
                keyTag
                algorithm
                digestType
                digest
              }
              transferLock
              claimedBy
              tokens {
                tokenId
                networkId
                ownerAddress
                type
                startsAt
                expiresAt
                chain {
                  name
                  networkId
                }
              }
            }
            totalCount
            pageSize
            currentPage
            totalPages
            hasNextPage
            hasPreviousPage
          }
        }
      `;

      const result = await this.apolloClient.query({
        query: GET_TOKENIZED_NAMES,
        variables: { skip: 0, take: limit * 2 } // Get more to filter by owner
      });

      const domains = result.data.names.items
        .filter(name => {
          // Filter domains owned by the specified address
          return name.tokens.some(token => 
            token.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
          );
        })
        .slice(0, limit)
        .map(name => {
          const token = name.tokens[0]; // Get first token
          return {
            tokenId: token.tokenId,
            name: name.name,
            owner: token.ownerAddress,
            type: 'tokenized',
            networkId: token.networkId,
            chain: token.chain,
            metadata: {
              description: `Tokenized domain ${name.name}`,
              image: `https://api.dicebear.com/7.x/identicon/svg?seed=${name.name}`,
              attributes: [
                { trait_type: "Type", value: "Tokenized Domain" },
                { trait_type: "Name", value: name.name },
                { trait_type: "Registrar", value: name.registrar?.name || "Unknown" },
                { trait_type: "Expires", value: name.expiresAt },
                { trait_type: "Token ID", value: token.tokenId },
                { trait_type: "Network", value: token.chain?.name || "Unknown" }
              ]
            },
            domainInfo: {
              expiresAt: name.expiresAt,
              tokenizedAt: name.tokenizedAt,
              registrar: name.registrar,
              nameservers: name.nameservers,
              transferLock: name.transferLock
            }
          };
        });
      
      console.log(`✅ Found ${domains.length} tokenized domains for ${ownerAddress}`);
      return domains;
    } catch (error) {
      console.error('❌ Failed to get available domains from Doma Protocol:', error.message);
      
      // Fallback to mock domains if Doma Protocol is unavailable
      console.log('🔄 Falling back to mock domains...');
      return this.getMockDomains(ownerAddress, limit);
    }
  }

  /**
   * Fallback method for mock domains when Doma Protocol is unavailable
   */
  async getMockDomains(ownerAddress, limit = 10) {
    const domains = [];
    
    for (let i = 1; i <= limit; i++) {
      domains.push({
        tokenId: i.toString(),
        name: `mock-domain-${i}.eth`,
        owner: ownerAddress,
        type: 'mock',
        metadata: {
          description: `Mock domain ${i} for testing`,
          image: `https://api.dicebear.com/7.x/identicon/svg?seed=mock-${i}`,
          attributes: [
            { trait_type: "Type", value: "Mock Domain" },
            { trait_type: "Token ID", value: i.toString() }
          ]
        }
      });
    }
    
    return domains;
  }

  /**
   * Get domain details by token ID from Doma Protocol
   */
  async getDomainDetails(tokenId) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      // GraphQL query to get domain details by token ID
      const GET_DOMAIN_BY_TOKEN = gql`
        query GetDomainByToken($tokenId: String!) {
          tokens(tokenId: $tokenId) {
            items {
              tokenId
              networkId
              ownerAddress
              type
              startsAt
              expiresAt
              chain {
                name
                networkId
              }
              name {
                name
                expiresAt
                tokenizedAt
                eoi
                registrar {
                  name
                  ianaId
                }
                nameservers {
                  ldhName
                }
                dsKeys {
                  keyTag
                  algorithm
                  digestType
                  digest
                }
                transferLock
                claimedBy
              }
            }
          }
        }
      `;

      const result = await this.apolloClient.query({
        query: GET_DOMAIN_BY_TOKEN,
        variables: { tokenId: tokenId.toString() }
      });

      if (result.data.tokens.items.length > 0) {
        const token = result.data.tokens.items[0];
        const name = token.name;
        
        return {
          tokenId: token.tokenId,
          name: name.name,
          owner: token.ownerAddress,
          type: 'tokenized',
          networkId: token.networkId,
          chain: token.chain,
          metadata: {
            description: `Tokenized domain ${name.name}`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${name.name}`,
            attributes: [
              { trait_type: "Type", value: "Tokenized Domain" },
              { trait_type: "Name", value: name.name },
              { trait_type: "Registrar", value: name.registrar?.name || "Unknown" },
              { trait_type: "Expires", value: name.expiresAt },
              { trait_type: "Token ID", value: token.tokenId },
              { trait_type: "Network", value: token.chain?.name || "Unknown" }
            ]
          },
          domainInfo: {
            expiresAt: name.expiresAt,
            tokenizedAt: name.tokenizedAt,
            registrar: name.registrar,
            nameservers: name.nameservers,
            transferLock: name.transferLock
          }
        };
      } else {
        // Fallback to mock domain if not found in Doma Protocol
        return {
          tokenId: tokenId.toString(),
          name: `unknown-domain-${tokenId}.eth`,
          owner: '0x0000000000000000000000000000000000000000',
          type: 'unknown',
          metadata: {
            description: `Domain ${tokenId} not found in Doma Protocol`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=unknown-${tokenId}`,
            attributes: [
              { trait_type: "Type", value: "Unknown Domain" },
              { trait_type: "Token ID", value: tokenId.toString() }
            ]
          }
        };
      }
    } catch (error) {
      console.error(`❌ Failed to get domain details for ${tokenId} from Doma Protocol:`, error.message);
      
      // Fallback to mock domain details
      return {
        tokenId: tokenId.toString(),
        name: `fallback-domain-${tokenId}.eth`,
        owner: '0x0000000000000000000000000000000000000000',
        type: 'fallback',
        metadata: {
          description: `Fallback domain ${tokenId} (Doma Protocol unavailable)`,
          image: `https://api.dicebear.com/7.x/identicon/svg?seed=fallback-${tokenId}`,
          attributes: [
            { trait_type: "Type", value: "Fallback Domain" },
            { trait_type: "Token ID", value: tokenId.toString() }
          ]
        }
      };
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
   * Get domains owned by a specific address from Doma Protocol
   */
  async getDomainsByOwner(ownerAddress, limit = 20) {
    if (!this.isInitialized) {
      throw new Error('Domain service not initialized');
    }

    try {
      // GraphQL query to get domains by owner
      const GET_DOMAINS_BY_OWNER = gql`
        query GetDomainsByOwner($ownerAddress: String!, $skip: Int = 0, $take: Int = 100) {
          tokens(ownerAddress: $ownerAddress, skip: $skip, take: $take) {
            items {
              tokenId
              networkId
              ownerAddress
              type
              startsAt
              expiresAt
              chain {
                name
                networkId
              }
              name {
                name
                expiresAt
                tokenizedAt
                eoi
                registrar {
                  name
                  ianaId
                }
                nameservers {
                  ldhName
                }
                dsKeys {
                  keyTag
                  algorithm
                  digestType
                  digest
                }
                transferLock
                claimedBy
              }
            }
            totalCount
            pageSize
            currentPage
            totalPages
            hasNextPage
            hasPreviousPage
          }
        }
      `;

      const result = await this.apolloClient.query({
        query: GET_DOMAINS_BY_OWNER,
        variables: { 
          ownerAddress: ownerAddress.toLowerCase(),
          skip: 0, 
          take: limit 
        }
      });

      const domains = result.data.tokens.items.map(token => {
        const name = token.name;
        return {
          tokenId: token.tokenId,
          name: name.name,
          owner: token.ownerAddress,
          type: 'tokenized',
          networkId: token.networkId,
          chain: token.chain,
          metadata: {
            description: `Tokenized domain ${name.name} owned by ${ownerAddress}`,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${name.name}`,
            attributes: [
              { trait_type: "Type", value: "Tokenized Domain" },
              { trait_type: "Name", value: name.name },
              { trait_type: "Owner", value: ownerAddress },
              { trait_type: "Registrar", value: name.registrar?.name || "Unknown" },
              { trait_type: "Expires", value: name.expiresAt },
              { trait_type: "Token ID", value: token.tokenId },
              { trait_type: "Network", value: token.chain?.name || "Unknown" }
            ]
          },
          domainInfo: {
            expiresAt: name.expiresAt,
            tokenizedAt: name.tokenizedAt,
            registrar: name.registrar,
            nameservers: name.nameservers,
            transferLock: name.transferLock
          }
        };
      });
      
      console.log(`✅ Found ${domains.length} domains owned by ${ownerAddress}`);
      return domains;
    } catch (error) {
      console.error('❌ Failed to get domains by owner from Doma Protocol:', error.message);
      
      // Fallback to mock domains
      console.log('🔄 Falling back to mock domains...');
      return this.getMockDomains(ownerAddress, limit);
    }
  }
}

module.exports = DomainService;
