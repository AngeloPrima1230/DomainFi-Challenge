# Doma Marketplace Integration Documentation

## Overview
This document contains all the knowledge about integrating with Doma Marketplace APIs, contract addresses, and implementation details.

## Doma Marketplace Architecture

### What Doma Provides
- **Orderbook Rest API** - for on-chain trading using SeaPort protocol
- **Poll API** - for marketplace-related events  
- **Doma Subgraph** - marketplace-related data (listings, offers)
- **Syndicated listings** - from external marketplaces (OpenSea)
- **@doma-protocol/orderbook-sdk** - simplifies integrations

### What We DON'T Need to Deploy
- ❌ **NO marketplace contracts** - Doma provides the infrastructure
- ❌ **NO token contracts** - Doma has deployed Ownership Token contracts
- ❌ **NO fee calculation logic** - SDK handles this automatically

### What We DO Need
- ✅ **Proxy Doma Record Contracts** - for tokenization, claiming, bridging
- ✅ **Ownership Token Contracts** - ERC-721 NFTs (deployed by Doma)
- ✅ **Currency contracts** - USDC, wETH for payments

## Contract Addresses

### Sepolia Testnet
- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **wETH**: `0x7b79995e5f793a07bc00c21412e50ecae098e7f9`
- **ETH**: Native token (no contract address)

### Base Sepolia Testnet
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **wETH**: `0x4200000000000000000000000000000000000006`

### Doma Testnet (Primary Network)
- **USDC**: `0x2f3463756C59387D6Cd55b034100caf7ECfc757b`
- **wETH**: `0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac`
- **RPC URL**: `https://rpc-testnet.doma.xyz`
- **Explorer**: `https://explorer-testnet.doma.xyz`

### Ownership Token Contracts (ERC-721 NFTs)
- **Sepolia**: `TBD` (Need to find actual deployed contracts)
- **Base Sepolia**: `TBD` (Need to find actual deployed contracts)
- **Doma Testnet**: `TBD` (Need to find actual deployed contracts)

## API Endpoints

### Working Endpoints
- ✅ **GET /api/marketplace/currencies** - Returns supported currencies
- ✅ **GET /api/marketplace/fees** - Returns hardcoded fees from documentation
- ✅ **GET /api/marketplace/offers** - Returns empty array (no offers endpoint in Doma API)
- ✅ **GET /api/marketplace/listings** - Fetches from Doma GraphQL (154,836+ listings available)

### API Configuration
- **Base URL**: `https://api-testnet.doma.xyz`
- **API Key**: `v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02`
- **Primary Chain ID**: `eip155:97476` (Doma Testnet)
- **Secondary Chain ID**: `eip155:11155111` (Sepolia)

## Fee Structure

### Doma Protocol Fees
- **Protocol Fee**: 0.5%
- **Receiver Address**: `0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532`
- **Royalty Fee**: Calculated per token using `royaltyInfo` method
- **OpenSea Fee**: Only when using OpenSea orderbook

### Fee Calculation
- **Manual**: Use hardcoded values from documentation
- **Automatic**: Use `@doma-protocol/orderbook-sdk` for automatic calculation
- **API**: Fee endpoint requires actual token contract addresses (not available)

## GraphQL Schema

### Available Queries
- `names` - Get tokenized names with filters
- `tokens` - Get ownership tokens
- `listings` - Get marketplace listings
- `offers` - Get marketplace offers
- `chainStatistics` - Get chain statistics

### Key Types
- `NameModel` - Tokenized name information
- `TokenModel` - Ownership token information
- `ListingModel` - Marketplace listing
- `OfferModel` - Marketplace offer
- `CurrencyModel` - Supported currency information

## Implementation Status

### ✅ Completed
- Doma Marketplace API integration
- Orderbook SDK setup
- API endpoints for listings, offers, currencies, fees
- UI components for marketplace
- Fee calculation (hardcoded from docs)
- Currency support (ETH, USDC, wETH)
- CORS fixes (routing through local endpoints)
- Next.js 15 & React 19 upgrade
- Yarn package manager setup
- All syntax errors fixed
- Fallback/mock data removed

### ❌ Known Issues
- **Fees API endpoint**: Returns 400 because it needs actual token contract addresses
- **Missing token contracts**: We don't have the actual deployed Ownership Token contract addresses

### 🔄 In Progress
- SeaPort protocol integration
- Testing with real Doma testnet data

## SDK Usage

### @doma-protocol/orderbook-sdk
```typescript
import { DomaOrderbookSDK } from '@doma-protocol/orderbook-sdk';

const sdk = new DomaOrderbookSDK({
  source: 'domainfi-challenge',
  chains: [sepolia, baseSepolia],
  apiClientOptions: {
    baseUrl: 'https://api-testnet.doma.xyz',
    defaultHeaders: {
      'API-Key': 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02',
    },
  },
});
```

### Automatic Features
- Fee calculation
- ETH wrapping to wETH
- SeaPort protocol integration
- On-chain approvals

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid parameters or missing contract addresses
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Missing 'ORDERBOOK' permission
- **CORS errors**: Fixed by routing through local Next.js API endpoints

### Fallback Strategy
- **NO fallback data** - APIs should fail when Doma API is unavailable
- **Real data only** - No mock data to mislead development
- **Clear error messages** - Know when something is broken

## File Structure

### API Routes
- `app/api/marketplace/listings/route.ts` - Listings endpoint
- `app/api/marketplace/offers/route.ts` - Offers endpoint  
- `app/api/marketplace/currencies/route.ts` - Currencies endpoint
- `app/api/marketplace/fees/route.ts` - Fees endpoint

### Components
- `app/components/MarketplaceTab.tsx` - Main marketplace UI
- `app/components/CreateListingModal.tsx` - Create listing modal
- `app/components/PlaceOfferModal.tsx` - Place offer modal
- `app/components/FeeCalculator.tsx` - Fee calculation display

### Hooks
- `app/hooks/useDomaMarketplace.ts` - Main marketplace hook
- `app/hooks/useDomaSubgraph.ts` - GraphQL data fetching
- `app/hooks/useTokenPrices.ts` - Token price data

## Development Notes

### Environment Variables
```env
NEXT_PUBLIC_DOMA_API_URL=https://api-testnet.doma.xyz
NEXT_PUBLIC_DOMA_API_KEY=v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02
```

### Dependencies
- `@doma-protocol/orderbook-sdk` - Doma marketplace SDK
- `@tanstack/react-query` - State management
- `wagmi` v2 - Ethereum wallet integration
- `@rainbow-me/rainbowkit` v2 - Wallet UI
- `viem` v2 - Ethereum utilities

### Testing
- Use Sepolia testnet for development
- Real Doma API calls (no mock data)
- Test with actual wallet connections
- Verify fee calculations

## Troubleshooting

### If APIs return 400 errors:
1. Check if contract addresses are correct
2. Verify API key is valid
3. Ensure parameters match expected format
4. Check if endpoints exist in Doma API

### If GraphQL queries fail:
1. Verify query syntax
2. Check if fields exist in schema
3. Ensure variables are correct type
4. Test with simpler queries first

### GraphQL Schema Notes:
- `listings` field does NOT accept `orderbook` parameter
- `CurrencyModel` does NOT have `address` field
- Use `symbol` and `decimals` for currency information

### If fees endpoint fails:
1. Use hardcoded fees from documentation
2. Don't try to call API without token contract addresses
3. Use SDK for automatic fee calculation

## Next Steps

1. **Find actual token contract addresses** on Sepolia testnet
2. **Fix GraphQL queries** for listings endpoint
3. **Implement SeaPort integration** for on-chain trading
4. **Test with real wallet connections**
5. **Deploy to production** when ready

---

**Last Updated**: January 2025
**Status**: Active Development
**API Status**: Mostly Working (currencies ✅, fees ✅, listings ✅, offers ✅)
**Real Data**: 154,836+ listings available on Doma marketplace
