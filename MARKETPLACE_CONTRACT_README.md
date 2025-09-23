# Taghaus Marketplace Contract

A comprehensive marketplace contract following OpenSea SeaPort standards for domain NFT trading, built for the Taghaus project.

## 🎯 Overview

The `TaghausMarketplace` contract provides a complete marketplace solution for domain NFTs with the following core functions:

### ✅ Required Functions (All Implemented)

1. **Create Token** - `createToken(name, symbol, metadataURI)`
2. **Burn Token** - `burnToken(tokenId)`
3. **Create Market Item** - `createMarketItem(nftContract, tokenId, price, currency, duration)`
4. **Create Market Sale** - `createMarketSale(itemId)`
5. **Fetch Market Items** - `fetchMarketItems(offset, limit)`
6. **Fetch Own NFTs** - `fetchOwnNFTs(user)`

## 🏗️ Contract Architecture

### Core Components

- **Token Management**: Create and burn domain NFTs
- **Marketplace Operations**: List, buy, and manage NFT sales
- **Fee Management**: Configurable platform fees with automatic distribution
- **Multi-Currency Support**: ETH, USDC, WETH, and custom ERC20 tokens
- **Security Features**: Reentrancy protection, access controls, and pausable functionality

### Key Features

- ✅ **OpenSea SeaPort Standards**: Follows OpenSea protocol standards
- ✅ **Multi-Currency Support**: ETH, USDC, WETH, and custom tokens
- ✅ **Flexible Pricing**: Fixed price listings with expiration
- ✅ **Fee Management**: Configurable platform fees (default 2.5%)
- ✅ **Security**: ReentrancyGuard, Ownable, Pausable
- ✅ **Gas Optimized**: Efficient storage and operations
- ✅ **Event Logging**: Comprehensive event system for tracking

## 📋 Contract Functions

### Token Management

```solidity
// Create a new domain NFT
function createToken(
    string memory name,
    string memory symbol,
    string memory metadataURI
) external returns (uint256 tokenId)

// Burn a domain NFT (only by owner)
function burnToken(uint256 tokenId) external
```

### Marketplace Operations

```solidity
// List an NFT for sale
function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price,
    address currency,
    uint256 duration
) external returns (uint256 itemId)

// Buy an NFT
function createMarketSale(uint256 itemId) external payable

// Update listing price
function updateMarketItem(
    uint256 itemId,
    uint256 newPrice,
    address newCurrency
) external

// Cancel listing
function cancelMarketItem(uint256 itemId) external
```

### Data Retrieval

```solidity
// Fetch market items with pagination
function fetchMarketItems(
    uint256 offset,
    uint256 limit
) external view returns (MarketItem[] memory items, uint256 total)

// Fetch items by seller
function fetchMarketItemsBySeller(address seller) external view returns (MarketItem[] memory)

// Fetch items by buyer
function fetchMarketItemsByBuyer(address buyer) external view returns (MarketItem[] memory)

// Fetch user's created NFTs
function fetchOwnNFTs(address user) external view returns (TokenInfo[] memory)
```

### Admin Functions

```solidity
// Add supported currency
function addSupportedCurrency(address currency) external onlyOwner

// Add supported NFT contract
function addSupportedNFTContract(address nftContract) external onlyOwner

// Update platform fee
function updatePlatformFee(uint256 newFee) external onlyOwner

// Pause/unpause contract
function pause() external onlyOwner
function unpause() external onlyOwner
```

## 🔧 Deployment

### Prerequisites

```bash
npm install
npx hardhat compile
```

### Deploy Individual Contracts

```bash
# Deploy marketplace only
npx hardhat run scripts/deploy-marketplace.js --network sepolia

# Deploy auction contract only
npx hardhat run scripts/deploy.js --network sepolia
```

### Deploy All Contracts

```bash
# Deploy all contracts (recommended)
npx hardhat run scripts/deploy-all.js --network sepolia
```

### Supported Networks

- **Sepolia Testnet**: `--network sepolia`
- **Base Sepolia**: `--network base-sepolia`
- **Doma Testnet**: `--network doma`
- **Local Development**: `--network localhost`

## 🧪 Testing

Run comprehensive tests:

```bash
# Run all tests
npx hardhat test

# Run marketplace tests only
npx hardhat test test/TaghausMarketplace.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## 📊 Contract Statistics

### Gas Costs (Estimated)

- **Create Token**: ~150,000 gas
- **Create Market Item**: ~200,000 gas
- **Create Market Sale**: ~180,000 gas
- **Cancel Market Item**: ~80,000 gas

### Storage Layout

- **MarketItem**: 8 slots
- **MarketSale**: 6 slots
- **TokenInfo**: 6 slots

## 🔒 Security Features

### Access Control
- **Ownable**: Only owner can call admin functions
- **Pausable**: Emergency pause functionality
- **ReentrancyGuard**: Protection against reentrancy attacks

### Validation
- **Price Validation**: Minimum price requirements
- **Duration Limits**: 1 hour to 365 days
- **Currency Support**: Only supported currencies allowed
- **NFT Support**: Only supported NFT contracts allowed

### Fee Management
- **Configurable Fees**: 0-10% platform fee
- **Automatic Distribution**: Fees sent to fee recipient
- **Transparent**: All fees visible in events

## 🌐 Integration with Doma Protocol

The marketplace contract is designed to work seamlessly with Doma Protocol:

### Supported Features
- ✅ **Domain NFTs**: Full support for Doma domain tokens
- ✅ **Multi-Currency**: ETH, USDC, WETH support
- ✅ **Cross-Chain**: Compatible with Doma's multi-chain architecture
- ✅ **Fee Structure**: Compatible with Doma's fee model

### Integration Points
- **NFT Contracts**: Add Doma domain contracts as supported
- **Currency Support**: Configure supported payment tokens
- **Fee Recipients**: Set Doma protocol fee recipients

## 📈 Usage Examples

### Frontend Integration

```javascript
// Create a token
const tx = await marketplace.createToken(
  "example.eth",
  "EXAMPLE",
  "https://metadata.example.com/1"
);

// List for sale
const itemId = await marketplace.createMarketItem(
  nftContract,
  tokenId,
  ethers.parseEther("1.0"), // 1 ETH
  ethers.ZeroAddress, // ETH
  86400 // 1 day
);

// Buy NFT
await marketplace.createMarketSale(itemId, {
  value: ethers.parseEther("1.0")
});
```

### Event Listening

```javascript
// Listen for new listings
marketplace.on("MarketItemCreated", (itemId, nftContract, tokenId, seller, price, currency, expiresAt) => {
  console.log(`New listing: ${itemId} for ${ethers.formatEther(price)} ETH`);
});

// Listen for sales
marketplace.on("MarketItemSold", (itemId, buyer, price) => {
  console.log(`Item ${itemId} sold to ${buyer} for ${ethers.formatEther(price)} ETH`);
});
```

## 🔄 Workflow

### Complete Trading Flow

1. **Create Domain NFT**: User creates a domain token
2. **List for Sale**: User lists NFT on marketplace
3. **Browse Listings**: Users can fetch and browse available items
4. **Purchase**: Buyer purchases NFT with supported currency
5. **Settlement**: Automatic NFT transfer and fee distribution
6. **Ownership**: Buyer becomes new owner of domain NFT

### Admin Workflow

1. **Deploy Contract**: Deploy with initial configuration
2. **Add Currencies**: Add supported payment tokens
3. **Add NFT Contracts**: Add supported domain NFT contracts
4. **Configure Fees**: Set platform fee percentage
5. **Monitor**: Track activity through events

## 🚀 Next Steps

### Immediate Actions
1. Deploy contracts to testnet
2. Configure supported currencies and NFT contracts
3. Integrate with frontend
4. Test complete trading flow

### Future Enhancements
1. **Auction Integration**: Connect with existing auction contract
2. **Advanced Features**: Offers, bidding, royalties
3. **Cross-Chain**: Multi-chain domain trading
4. **Analytics**: Trading volume and statistics

## 📞 Support

For questions or issues:
- **Documentation**: Check this README and contract comments
- **Testing**: Run test suite for examples
- **Deployment**: Use provided deployment scripts
- **Integration**: Follow usage examples above

---

**Built for Taghaus - Decentralized Domain Auction Marketplace** 🏠
