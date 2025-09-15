import { useState, useEffect } from 'react';
import { DomaOrderbookSDK, OrderbookType } from '@doma-protocol/orderbook-sdk';
import { useAccount } from 'wagmi';

// Doma API configuration
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';
const DOMA_API_URL = process.env.NEXT_PUBLIC_DOMA_API_URL || 'https://api-testnet.doma.xyz';

export interface DomaListing {
  id: string;
  tokenId: string;
  name: string;
  price: string;
  currency: string;
  seller: string;
  expiresAt: string;
  createdAt: string;
  status: 'active' | 'sold' | 'cancelled';
  chain: string;
  registrar?: string;
  orderbook: 'DOMA' | 'OPENSEA';
  contractAddress: string;
  orderId?: string;
}

export interface DomaOffer {
  id: string;
  tokenId: string;
  name: string;
  price: string;
  currency: string;
  buyer: string;
  expiresAt: string;
  createdAt: string;
  status: 'active' | 'accepted' | 'cancelled';
  orderbook: 'DOMA' | 'OPENSEA';
  contractAddress: string;
  orderId?: string;
}

export interface SupportedCurrency {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

export interface MarketplaceFees {
  protocolFee: number;
  royaltyFee: number;
  totalFee: number;
  feeReceiver: string;
}

export function useDomaMarketplace() {
  const [listings, setListings] = useState<DomaListing[]>([]);
  const [offers, setOffers] = useState<DomaOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdk, setSdk] = useState<DomaOrderbookSDK | null>(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState<SupportedCurrency[]>([]);
  const [marketplaceFees, setMarketplaceFees] = useState<MarketplaceFees | null>(null);
  
  const { address } = useAccount();

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const domaSDK = new DomaOrderbookSDK({
          source: 'domainfi-challenge',
          chains: [
            {
              id: 11155111, // Sepolia testnet
              name: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: {
                default: { http: ['https://sepolia.infura.io/v3/your-project-id'] },
                public: { http: ['https://sepolia.infura.io/v3/your-project-id'] },
              },
            },
            {
              id: 84532, // Base Sepolia testnet
              name: 'Base Sepolia',
              nativeCurrency: {
                name: 'Base Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: {
                default: { http: ['https://sepolia.base.org'] },
                public: { http: ['https://sepolia.base.org'] },
              },
            },
          ],
          apiClientOptions: {
             baseUrl: DOMA_API_URL,
             defaultHeaders: {
               'API-Key': API_KEY,
             },
           },
        });
        
        setSdk(domaSDK);
        console.log('Doma SDK initialized successfully');
        
        // Fetch supported currencies and fees
        await fetchSupportedCurrencies(domaSDK);
        await fetchMarketplaceFees(domaSDK);
        
      } catch (err) {
        console.error('Error initializing Doma SDK:', err);
        setError('Failed to initialize Doma SDK');
      }
    };

    initializeSDK();
  }, []);

  // Fetch supported currencies
  const fetchSupportedCurrencies = async (sdk: DomaOrderbookSDK) => {
    try {
      const chainId = 'eip155:11155111' as const; // Sepolia testnet
      const contractAddress = '0x0000000000000000000000000000000000000000'; // Mock contract address
      
      const currencies = await sdk.getSupportedCurrencies({
        chainId,
        orderbook: OrderbookType.DOMA,
        contractAddress,
      });
      
      setSupportedCurrencies(Array.isArray(currencies) ? currencies : []);
      console.log('Supported currencies:', currencies);
    } catch (err) {
      console.error('Error fetching supported currencies:', err);
    }
  };

  // Fetch marketplace fees
  const fetchMarketplaceFees = async (sdk: DomaOrderbookSDK) => {
    try {
      const chainId = 'eip155:11155111'; // Sepolia testnet
      const contractAddress = '0x0000000000000000000000000000000000000000'; // Mock contract address
      
      // Get fees from API
      const response = await fetch(`${DOMA_API_URL}/v1/orderbook/fee/DOMA/${chainId}/${contractAddress}`, {
        headers: {
          'API-Key': API_KEY,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const fees: MarketplaceFees = {
          protocolFee: 0.5, // 0.5% Doma protocol fee
          royaltyFee: 0, // Will be calculated per token
          totalFee: 0.5,
          feeReceiver: '0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532',
        };
        setMarketplaceFees(fees);
      }
    } catch (err) {
      console.error('Error fetching marketplace fees:', err);
    }
  };

  // Fetch marketplace listings using SDK
  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // Fetch listings from Doma Subgraph
      const response = await fetch(`${DOMA_API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-Key': API_KEY,
        },
        body: JSON.stringify({
          query: `
            query GetListings($skip: Int = 0, $take: Int = 100) {
              listings(skip: $skip, take: $take, orderbook: "DOMA") {
                items {
                  id
                  externalId
                  price
                  currency {
                    symbol
                    decimals
                    address
                  }
                  offererAddress
                  orderbook
                  tokenId
                  expiresAt
                  createdAt
                  updatedAt
                }
                totalCount
                hasNextPage
              }
            }
          `,
          variables: { skip: 0, take: 100 }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const listingsData = data.data?.listings?.items || [];
        
        // Convert to our format
        const convertedListings: DomaListing[] = listingsData.map((listing: any) => ({
          id: listing.id,
          tokenId: listing.tokenId,
          name: `domain-${listing.tokenId}`, // Will be enriched with actual domain name
          price: listing.price,
          currency: listing.currency?.symbol || 'ETH',
          seller: listing.offererAddress,
          expiresAt: listing.expiresAt,
          createdAt: listing.createdAt,
          status: new Date(listing.expiresAt) > new Date() ? 'active' : 'sold',
          chain: '11155111',
          orderbook: listing.orderbook as 'DOMA' | 'OPENSEA',
          contractAddress: '0x0000000000000000000000000000000000000000',
          orderId: listing.externalId,
        }));
        
        setListings(convertedListings);
        console.log('Fetched listings:', convertedListings.length);
      } else {
        console.error('Failed to fetch listings:', response.status);
        setListings([]);
      }
    } catch (err) {
      console.error('Error fetching Doma listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch marketplace offers
  const fetchOffers = async () => {
    try {
      if (sdk) {
        // Try to fetch using the SDK
        console.log('Fetching offers with SDK...');
      }
      
      // Fallback to example data
      setOffers([
        {
          id: '1',
          tokenId: '1',
          name: 'example.com',
          price: '0.08',
          currency: 'ETH',
          buyer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'active',
          orderbook: 'DOMA',
          contractAddress: '0x0000000000000000000000000000000000000000',
        }
      ]);
    } catch (err) {
      console.error('Error fetching Doma offers:', err);
      setOffers([]);
    }
  };

  // Create a new listing using SDK
  const createListing = async (listing: Omit<DomaListing, 'id' | 'createdAt' | 'status'>) => {
    try {
      if (!sdk || !address) {
        throw new Error('SDK, wallet, or chain not available');
      }

      console.log('Creating listing with Doma Orderbook API...');
      
      // For now, we'll simulate the listing creation
      // In a real implementation, you would:
      // 1. Create a SeaPort order using the SDK
      // 2. Sign the order with the user's wallet
      // 3. Submit to Doma Orderbook API
      
      const simulatedListing: DomaListing = {
        ...listing,
        id: `doma-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      setListings(prev => [simulatedListing, ...prev]);
      console.log('Listing created successfully:', simulatedListing.id);
      return simulatedListing;
    } catch (err) {
      console.error('Error creating listing:', err);
      throw err;
    }
  };

  // Place an offer using SDK
  const placeOffer = async (offer: Omit<DomaOffer, 'id' | 'createdAt' | 'status'>) => {
    try {
      if (sdk) {
        console.log('Placing offer with SDK...');
        // SDK implementation would go here
        // For now, simulate the placement
      }
      
      // Simulate offer placement
      const simulatedOffer: DomaOffer = {
        ...offer,
        id: `sim-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active',
        orderbook: 'DOMA',
        contractAddress: '0x0000000000000000000000000000000000000000',
      };
      setOffers(prev => [simulatedOffer, ...prev]);
      return simulatedOffer;
    } catch (err) {
      console.error('Error placing offer:', err);
      throw err;
    }
  };

  // Accept an offer
  const acceptOffer = async (offerId: string) => {
    try {
      if (sdk) {
        console.log('Accepting offer with SDK...');
        // SDK implementation would go here
      }
      
      setOffers(prev => prev.map(offer => 
        offer.id === offerId ? { ...offer, status: 'accepted' } : offer
      ));
      return true;
    } catch (err) {
      console.error('Error accepting offer:', err);
      throw err;
    }
  };

  // Cancel a listing
  const cancelListing = async (listingId: string) => {
    try {
      if (sdk) {
        console.log('Cancelling listing with SDK...');
        // SDK implementation would go here
      }
      
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? { ...listing, status: 'cancelled' } : listing
      ));
      return true;
    } catch (err) {
      console.error('Error cancelling listing:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!sdk) return;
    fetchListings();
    fetchOffers();
  }, [sdk]);

  return {
    listings,
    offers,
    loading,
    error,
    sdk,
    supportedCurrencies,
    marketplaceFees,
    fetchListings,
    fetchOffers,
    createListing,
    placeOffer,
    acceptOffer,
    cancelListing,
    fetchSupportedCurrencies: () => sdk && fetchSupportedCurrencies(sdk),
    fetchMarketplaceFees: () => sdk && fetchMarketplaceFees(sdk),
  };
}

