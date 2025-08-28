import { useState, useEffect } from 'react';
import { DomaOrderbookSDK, OrderbookType } from '@doma-protocol/orderbook-sdk';

// Doma API configuration
const API_KEY = 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';

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
}

export function useDomaMarketplace() {
  const [listings, setListings] = useState<DomaListing[]>([]);
  const [offers, setOffers] = useState<DomaOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdk, setSdk] = useState<DomaOrderbookSDK | null>(null);

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
              network: 'sepolia',
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
          ],
                     apiClientOptions: {
             baseUrl: 'https://api-testnet.doma.xyz',
             defaultHeaders: {
               'API-Key': API_KEY,
             },
           },
        });
        
        setSdk(domaSDK);
        console.log('Doma SDK initialized successfully');
      } catch (err) {
        console.error('Error initializing Doma SDK:', err);
        // Continue with fallback data
      }
    };

    initializeSDK();
  }, []);

  // Fetch marketplace listings using SDK
  const fetchListings = async () => {
    try {
      setLoading(true);
      
      if (sdk) {
        // Try to fetch using the SDK
        try {
          const supportedCurrencies = await sdk.getSupportedCurrencies({
            chainId: 'eip155:11155111',
            orderbook: OrderbookType.DOMA,
            contractAddress: '0x0000000000000000000000000000000000000000', // Mock contract address
          });
          console.log('Supported currencies:', supportedCurrencies);
        } catch (err) {
          console.log('SDK call failed, using fallback data');
        }
        
        // Try to fetch real listings from the API
        console.log('Attempting to fetch real listings from Doma API...');
      } else {
        // No SDK available, try to fetch from API directly
        console.log('SDK not available, attempting direct API call...');
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
          status: 'active'
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
      if (sdk) {
        console.log('Creating listing with SDK...');
        // SDK implementation would go here
        // For now, simulate the creation
      }
      
      // Simulate listing creation
      const simulatedListing: DomaListing = {
        ...listing,
        id: `sim-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setListings(prev => [simulatedListing, ...prev]);
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
        status: 'active'
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
    if (sdk) {
      fetchListings();
      fetchOffers();
    } else {
      // Load fallback data immediately if SDK is not available
      fetchListings();
      fetchOffers();
    }
  }, [sdk]);

  return {
    listings,
    offers,
    loading,
    error,
    sdk,
    fetchListings,
    fetchOffers,
    createListing,
    placeOffer,
    acceptOffer,
    cancelListing,
  };
}

