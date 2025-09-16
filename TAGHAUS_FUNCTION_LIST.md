# TAGHAUS - Complete Function List & ToDo Documentation

## 🎯 Project Overview
**Taghaus** is a decentralized domain auction marketplace built on Doma Protocol, featuring advanced auction mechanisms, transparent price discovery, and comprehensive domain analytics.

---

## 📋 Core Application Functions

### 🏠 **Landing Page (`app/page.tsx`)**
- **Domain Search**: Real-time search through 674,027+ tokenized domains
- **Search Suggestions**: Auto-complete with domain suggestions
- **Wallet Connection**: RainbowKit integration for Web3 wallet connection
- **Navigation**: Route to dashboard, marketplace, and other pages
- **Theme Support**: Dark/light mode toggle functionality

### 🏪 **Marketplace (`app/marketplace/page.tsx`)**
- **Domain Listings**: Browse active domain listings with filtering
- **Auction Cards**: Display domain information, pricing, and status
- **Search & Filter**: Advanced filtering by price, TLD, registrar
- **Real-time Updates**: Live data from Doma Protocol APIs
- **Analytics Dashboard**: Market insights and statistics

### 📊 **Dashboard (`app/dashboard/page.tsx`)**
- **Portfolio Management**: View owned domains and tokens
- **Activity Tracking**: Transaction history and domain activities
- **Analytics**: Performance metrics and portfolio value
- **Quick Actions**: Create listings, place offers, manage domains

### 📞 **Contact Form (`app/contact/page.tsx`)**
- **Form Validation**: Client-side and server-side validation
- **reCAPTCHA Integration**: Bot protection and spam prevention
- **Discord Webhook**: Automatic notifications to Discord
- **Rate Limiting**: 3 requests per minute per IP
- **Email Sanitization**: Input sanitization and security

---

## 🔧 API Routes & Backend Functions

### 📡 **Contact API (`app/api/contact/route.ts`)**
- **POST /api/contact**: Handle contact form submissions
- **Rate Limiting**: Prevent spam with IP-based rate limiting
- **Validation**: Form data validation and sanitization
- **reCAPTCHA**: Google reCAPTCHA verification
- **Discord Integration**: Send notifications to Discord webhook
- **Error Handling**: Comprehensive error handling and logging

### 📈 **Market Stats API (`app/api/market-stats/route.ts`)**
- **GET /api/market-stats**: Fetch market statistics
- **Volume Data**: Total trading volume and metrics
- **Price Analytics**: Average prices and trends
- **Domain Counts**: Total domains and active listings

### 💰 **Marketplace APIs**
- **GET /api/marketplace/currencies**: Supported currencies (ETH, USDC, wETH)
- **GET /api/marketplace/fees**: Marketplace fee structure
- **GET /api/marketplace/listings**: Active domain listings
- **GET /api/marketplace/offers**: Current offers and bids

### 💲 **Price API (`app/api/prices/route.ts`)**
- **GET /api/prices**: Real-time price data
- **Token Prices**: ETH, USDC, and other token prices
- **Oracle Integration**: Price feeds from multiple sources

---

## 🧩 Component Functions

### 🎴 **AuctionCard (`app/components/AuctionCard.tsx`)**
- **Domain Display**: Show domain name, price, and status
- **Owner Information**: Display seller/owner addresses
- **Expiry Dates**: Domain expiration and tokenization dates
- **Interactive Elements**: Hover effects and click handlers
- **Status Indicators**: Active, expired, or pending status

### 🏗️ **CreateAuctionModal (`app/components/CreateAuctionModal.tsx`)**
- **Auction Creation**: Form for creating new domain auctions
- **Auction Types**: English, Dutch, and Sealed Bid auctions
- **Price Setting**: Starting price and reserve price configuration
- **Duration Settings**: Auction duration and timing
- **Wallet Integration**: Connect wallet for auction creation

### 🏪 **MarketplaceTab (`app/components/MarketplaceTab.tsx`)**
- **Listings View**: Display active domain listings
- **Offers View**: Show current offers and bids
- **Tab Navigation**: Switch between listings and offers
- **Refresh Functionality**: Manual data refresh
- **Create Actions**: Buttons for creating listings and offers

### 📊 **AnalyticsDashboard (`app/components/AnalyticsDashboard.tsx`)**
- **Market Overview**: Total volume, active listings, domain counts
- **Price Distribution**: Price range analysis and charts
- **Top Domains**: Highest-priced domains and trends
- **Registrar Stats**: Performance by domain registrar
- **TLD Analysis**: Top-level domain statistics
- **Recent Activity**: Latest transactions and activities

### 🔍 **DomainDetailsModal (`app/components/DomainDetailsModal.tsx`)**
- **Domain Information**: Complete domain details and metadata
- **Token Information**: NFT token details and ownership
- **Activity History**: Transaction and activity logs
- **DNS Records**: Nameservers and DS keys
- **Registrar Details**: Registrar information and contact

### 💰 **FeeCalculator (`app/components/FeeCalculator.tsx`)**
- **Fee Calculation**: Calculate marketplace and protocol fees
- **Price Estimation**: Estimate total costs for transactions
- **Currency Support**: Multiple currency fee calculations
- **Transparent Pricing**: Clear breakdown of all fees

### 🎯 **BidModal (`app/components/BidModal.tsx`)**
- **Bid Placement**: Place bids on domain auctions
- **Bid Validation**: Ensure bid amounts are valid
- **Wallet Integration**: Connect wallet for bidding
- **Confirmation**: Bid confirmation and transaction signing

### 📝 **CreateListingModal (`app/components/CreateListingModal.tsx`)**
- **Listing Creation**: Create new domain listings
- **Price Setting**: Set listing price and currency
- **Duration Configuration**: Listing duration and expiry
- **Terms & Conditions**: Listing terms and conditions

### 💼 **PlaceOfferModal (`app/components/PlaceOfferModal.tsx`)**
- **Offer Placement**: Place offers on domains
- **Offer Terms**: Set offer price and conditions
- **Expiry Settings**: Offer expiration and timing
- **Wallet Integration**: Connect wallet for offers

---

## 🔗 Custom Hooks & Utilities

### 🌐 **useDomaSubgraph (`app/hooks/useDomaSubgraph.ts`)**
- **Domain Queries**: Fetch tokenized domains from Doma Protocol
- **Search Functionality**: Search domains by name, owner, or filters
- **Pagination**: Handle large datasets with pagination
- **Real-time Data**: Live data from Doma Subgraph
- **Activity Tracking**: Domain and token activity history
- **Command Status**: Track command execution status

### 🏪 **useDomaMarketplace (`app/hooks/useDomaMarketplace.ts`)**
- **Listings Management**: Fetch and manage domain listings
- **Offers Handling**: Handle domain offers and bids
- **Currency Support**: Supported currencies and pricing
- **Fee Structure**: Marketplace fee calculations
- **Orderbook Integration**: Doma and OpenSea orderbook support

### 🔨 **useAuctionContract (`app/hooks/useAuctionContract.ts`)**
- **Smart Contract Integration**: Interact with auction contracts
- **Auction Creation**: Create new domain auctions
- **Bid Management**: Place and manage bids
- **Auction Types**: Support for different auction mechanisms
- **Transaction Handling**: Handle blockchain transactions

### 💰 **useTokenPrices (`app/hooks/useTokenPrices.ts`)**
- **Price Feeds**: Real-time token price data
- **Multi-currency**: Support for ETH, USDC, wETH
- **Oracle Integration**: Multiple price oracle sources
- **Price Conversion**: Convert between different currencies

### 🎨 **ThemeContext (`app/contexts/ThemeContext.tsx`)**
- **Theme Management**: Dark/light mode switching
- **Theme Persistence**: Save theme preference
- **Component Styling**: Consistent theme across components
- **CSS Classes**: Dynamic theme-based CSS classes

---

## 🛠️ Utility Functions

### 📝 **Format Utilities (`app/utils/format.ts`)**
- **Address Formatting**: Format Ethereum addresses
- **Price Formatting**: Format prices with proper decimals
- **Date Formatting**: Format dates and timestamps
- **Number Formatting**: Format large numbers and percentages

### 💰 **Marketplace Fees (`app/utils/marketplaceFees.ts`)**
- **Fee Calculation**: Calculate marketplace and protocol fees
- **Fee Structure**: Define fee percentages and structures
- **Currency Support**: Fee calculations for different currencies
- **Transparent Pricing**: Clear fee breakdown

---

## 🎨 UI Components

### 🧭 **Header (`app/components/Header.tsx`)**
- **Navigation**: Main navigation menu
- **Wallet Connection**: RainbowKit wallet connection
- **Theme Toggle**: Dark/light mode switch
- **Logo & Branding**: Taghaus branding and logo

### 🦶 **Footer (`app/components/Footer.tsx`)**
- **Links**: Footer links and navigation
- **Social Media**: Social media links
- **Legal**: Terms, privacy, and legal links
- **Copyright**: Copyright and attribution

### 🎯 **ActivityTab (`app/components/ActivityTab.tsx`)**
- **Activity Feed**: Display recent activities
- **Transaction History**: Show transaction details
- **Filtering**: Filter activities by type
- **Pagination**: Handle large activity lists

---

## 🔧 Smart Contract Integration

### 📜 **Domain Auction Contract (`backend/contracts/DomainAuction.sol`)**
- **Auction Logic**: English, Dutch, and Sealed Bid auctions
- **Bid Management**: Handle bids and auction state
- **Settlement**: Automatic settlement and NFT transfers
- **Fee Collection**: Collect marketplace and protocol fees

### 🎫 **Mock NFT Contract (`backend/contracts/MockNFT.sol`)**
- **NFT Minting**: Mint domain NFTs
- **Ownership Transfer**: Transfer NFT ownership
- **Metadata**: Store domain metadata on-chain
- **Approval System**: Approve marketplace contracts

---

## 🚀 Deployment & Build

### ⚙️ **Build Configuration**
- **Next.js 15.5.3**: Latest Next.js framework
- **TypeScript**: Full TypeScript support
- **Tailwind CSS**: Utility-first CSS framework
- **Webpack**: Custom webpack configuration
- **Environment Variables**: Secure environment management

### 🌐 **Vercel Deployment**
- **Static Generation**: Optimized static site generation
- **API Routes**: Serverless API functions
- **Environment Variables**: Production environment setup
- **Build Optimization**: Optimized production builds

---

## 📊 Data Sources & APIs

### 🌐 **Doma Protocol Integration**
- **Subgraph**: Real-time domain data from Doma Subgraph
- **Marketplace API**: Domain listings and offers
- **Token Data**: NFT token information and ownership
- **Activity Feeds**: Transaction and activity history

### 🔗 **External APIs**
- **Price Oracles**: Real-time token price feeds
- **reCAPTCHA**: Google reCAPTCHA for form protection
- **Discord Webhooks**: Notification system
- **Blockchain RPCs**: Ethereum and Polygon RPC endpoints

---

## 🎯 Key Features Status

### ✅ **Working Features**
- Domain search and browsing
- Real-time data from Doma Protocol
- Wallet connection (RainbowKit)
- Contact form with Discord integration
- Market analytics and statistics
- Responsive design and theming
- Build and deployment (Vercel ready)

### 🔄 **In Development**
- Auction creation and management
- Bid placement and management
- Advanced filtering and search
- Portfolio management
- Real-time notifications

### 📋 **Planned Features**
- Mobile app integration
- Advanced analytics dashboard
- Social features and sharing
- Multi-language support
- Advanced auction mechanisms

---

## 🛠️ Development Commands

```bash
# Development
yarn dev                 # Start development server
yarn build              # Build for production
yarn start              # Start production server
yarn lint               # Run ESLint

# Smart Contracts
yarn compile            # Compile contracts
yarn test               # Run contract tests
yarn deploy:sepolia     # Deploy to Sepolia
yarn deploy:testnet     # Deploy to testnet

# Utilities
yarn type-check         # TypeScript type checking
yarn test:doma          # Test Doma API integration
```

---

## 📝 Notes for devAngel

This comprehensive function list covers all the major components and features of the Taghaus application. The build issues have been resolved, and the application is now ready for Vercel deployment. All TypeScript errors have been fixed, and the build process completes successfully.

The application integrates with Doma Protocol to provide real-time domain data, marketplace functionality, and comprehensive analytics. The codebase is well-structured with proper separation of concerns, custom hooks for data management, and a modern React/Next.js architecture.
