# Taghaus Backend

This is the backend infrastructure for Taghaus - a decentralized domain auction marketplace. The backend is completely isolated from the frontend to avoid dependency conflicts.

## 🏗️ Architecture

```
Backend Services
├── Smart Contracts (Solidity)
│   ├── DomainAuction.sol - Main auction contract
│   └── Deployment scripts
├── WebSocket Server (Node.js)
│   ├── Real-time auction updates
│   └── Event broadcasting
├── Blockchain Event Listener
│   ├── Contract event monitoring
│   └── Database updates
└── API Server (Express.js)
    ├── REST endpoints
    └── Health checks
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Required: PRIVATE_KEY, ALCHEMY_API_KEY, ETHERSCAN_API_KEY
```

### 3. Compile Smart Contracts
```bash
npm run compile
```

### 4. Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

### 5. Start Backend Services
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🎯 **Real Domain Integration with Doma Protocol**

**Problem**: We need domains to create auctions, but we don't have any!

**Solution**: ✅ **SOLVED** - Real Doma Protocol integration implemented!

### 🚀 **Real Tokenized Domains from Doma Protocol**

The backend now fetches **real tokenized domains** from Doma Protocol's GraphQL API, giving you access to 674,000+ actual domains!

### Quick Start with Real Domains

#### 1. Configure Doma Protocol
```bash
# Add to your .env file
DOMA_SUBGRAPH_URL=https://api-testnet.doma.xyz/graphql
DOMA_API_KEY=your_doma_api_key_here
```

#### 2. Deploy Smart Contracts
```bash
npm run deploy:all
# Deploys DomainAuction contract (MockNFT optional for testing)
```

#### 3. Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:3001
```

#### 4. Get Real Domains for Auction
```bash
# Get REAL tokenized domains owned by a user
curl "http://localhost:3001/api/domains/owned/0x1234...?limit=10"

# Get domains available for auction creation
curl "http://localhost:3001/api/domains/available?owner=0x1234...&limit=10"
```

### 🔄 **Fallback System**
- **Primary**: Real domains from Doma Protocol GraphQL
- **Fallback**: Mock domains if Doma Protocol is unavailable
- **Testing**: MockNFT domains for development

### Domain API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/domains/test` | POST | Create test domains |
| `/api/domains/available` | GET | Get available domains |
| `/api/domains/owned/:owner` | GET | Get domains by owner |
| `/api/domains/:tokenId` | GET | Get domain details |
| `/api/domains/:tokenId/check-auction` | POST | Check if domain can be auctioned |

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm run test` | Run smart contract tests |
| `npm run deploy:all` | **Deploy ALL contracts + create test domains** |
| `npm run deploy:sepolia` | Deploy DomainAuction only to Sepolia |
| `npm run deploy:testnet` | Deploy to Polygon Mumbai |
| `npm run deploy:local` | Deploy to local Hardhat network |
| `npm run node` | Start local Hardhat node |
| `npm run dev` | Start backend server in development |
| `npm start` | Start backend server in production |

## 🔧 Configuration

### Environment Variables

#### Required for Deployment
```env
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
ETHEREUM_SEPOLIA_RPC=https://sepolia.infura.io/v3/your_infura_key
```

#### Backend Server
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

#### WebSocket Configuration
```env
WS_PORT=3002
```

## 🎯 Smart Contract Features

### DomainAuction Contract
- **English Auctions**: Traditional ascending price with time limits
- **Dutch Auctions**: Descending price until first bidder
- **Sealed Bid Auctions**: Blind bidding with commitment-reveal scheme
- **Platform Fees**: Configurable fee structure (0.5% default)
- **Security**: ReentrancyGuard, Ownable, proper access controls

### Key Functions
- `createAuction()` - Create new auction
- `placeBid()` - Place bid on English auction
- `placeDutchBid()` - Place bid on Dutch auction
- `submitSealedBid()` - Submit sealed bid commitment
- `revealSealedBid()` - Reveal sealed bid
- `endAuction()` - End auction after time limit
- `settleAuction()` - Settle auction and transfer NFT
- `cancelAuction()` - Cancel auction (seller only)

## 🌐 API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Contract Information
```
GET /api/contracts
```
Returns deployed contract addresses and network info.

### Domain Management
```
GET /api/domains/available?owner=0x...&limit=10
POST /api/domains/test
GET /api/domains/owned/:owner?limit=20
GET /api/domains/:tokenId
POST /api/domains/:tokenId/check-auction
```
Manage domains for auction creation.

## 🔌 WebSocket Events

### Client → Server
- `join_auction` - Join auction room for real-time updates
- `leave_auction` - Leave auction room

### Server → Client
- `auction_event` - General auction events (created, ended, settled, cancelled)
- `new_bid` - New bid placed on auction

## 📡 Blockchain Event Monitoring

The backend automatically monitors smart contract events:

- **AuctionCreated** - New auction created
- **BidPlaced** - New bid placed
- **AuctionEnded** - Auction ended
- **AuctionSettled** - Auction settled
- **AuctionCancelled** - Auction cancelled

Events are automatically broadcast to connected WebSocket clients.

## 🧪 Testing

### Smart Contract Tests
```bash
npm run test
```

### Manual Testing
1. Deploy contracts to local network: `npm run node` (in separate terminal)
2. Deploy to local: `npm run deploy:local`
3. Start backend: `npm run dev`
4. Test WebSocket connection and API endpoints

## 🚀 Deployment

### Prerequisites
1. **Sepolia ETH**: Get from [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Alchemy Account**: Sign up at [Alchemy](https://www.alchemy.com/)
3. **Etherscan API Key**: Get from [Etherscan](https://etherscan.io/apis)

### Smart Contract Deployment
```bash
# 1. Set up environment
cp env.example .env
# Edit .env with your keys

# 2. Deploy to Sepolia
npm run deploy:sepolia

# 3. Update .env with contract address from deployment-info.json
```

### Backend Server Deployment

#### Local Development
```bash
npm run dev  # Runs on http://localhost:3001
```

#### Production (Vercel)
```bash
npm i -g vercel
vercel
# Set environment variables in Vercel dashboard
```

#### Production (Railway)
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Environment Variables for Production
```env
# Blockchain
PRIVATE_KEY=your_private_key
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key
ETHEREUM_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Doma Protocol
DOMA_SUBGRAPH_URL=https://api-testnet.doma.xyz/graphql
DOMA_API_KEY=your_doma_api_key

# Contracts (after deployment)
AUCTION_CONTRACT_ADDRESS=0x...
MOCK_NFT_CONTRACT_ADDRESS=0x... # Optional

# Server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🔒 Security

- Private keys should never be committed to version control
- Use environment variables for all sensitive data
- Smart contracts include reentrancy protection
- Proper access controls on all functions
- Platform fees are configurable by owner

## 📊 Monitoring

The backend includes:
- Health check endpoint
- WebSocket connection monitoring
- Blockchain event logging
- Error handling and logging

## 🤝 Integration with Frontend

The backend provides:
1. **Contract Addresses** - Via `/api/contracts` endpoint
2. **Real-time Updates** - Via WebSocket events
3. **Event Broadcasting** - Automatic auction event notifications

Frontend should:
1. Fetch contract addresses from backend API
2. Connect to WebSocket for real-time updates
3. Use contract addresses for direct blockchain interactions

## 🐛 Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Ensure OpenZeppelin contracts are installed
   - Check Solidity version compatibility

2. **Deployment Failures**
   - Verify private key and RPC URL
   - Ensure sufficient ETH for gas fees
   - Check network connectivity

3. **WebSocket Connection Issues**
   - Verify CORS configuration
   - Check port availability
   - Ensure frontend URL matches CORS_ORIGIN

4. **Event Listener Issues**
   - Verify contract address is set
   - Check RPC provider connectivity
   - Ensure contract is deployed and verified

## 📝 Next Steps

1. **Deploy Smart Contracts** - Get contracts live on Sepolia
2. **Test Integration** - Verify frontend can connect to backend
3. **Add Database** - Implement persistent storage
4. **Add Authentication** - User management and JWT tokens
5. **Add Analytics** - Auction performance tracking
6. **Add Notifications** - Email/SMS notifications for auction events

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract documentation
3. Check blockchain explorer for transaction status
4. Verify environment configuration
