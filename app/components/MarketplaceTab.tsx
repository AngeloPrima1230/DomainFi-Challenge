'use client';

import { useState, useEffect } from 'react';
import { useDomaMarketplace, DomaListing, DomaOffer } from '../hooks/useDomaMarketplace';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { formatShort } from '../utils/format';
import FeeCalculator from './FeeCalculator';

interface MarketplaceTabProps {
  className?: string;
}

export default function MarketplaceTab({ className = '' }: MarketplaceTabProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'offers'>('listings');
  const [selectedListing, setSelectedListing] = useState<DomaListing | null>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);
  
  const { address } = useAccount();
  const {
    listings,
    offers,
    loading,
    error,
    supportedCurrencies,
    marketplaceFees,
    fetchListings,
    fetchOffers,
    createListing,
    placeOffer,
  } = useDomaMarketplace();

  useEffect(() => {
    fetchListings();
    fetchOffers();
  }, []);

  const handleCreateListing = async (listingData: Partial<DomaListing>) => {
    try {
      if (!address) {
        alert('Please connect your wallet first');
        return;
      }

      const newListing = await createListing({
        tokenId: listingData.tokenId || '1',
        name: listingData.name || 'example.com',
        price: listingData.price || '0.1',
        currency: listingData.currency || 'ETH',
        seller: address,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        chain: '11155111',
        orderbook: 'DOMA',
        contractAddress: '0x0000000000000000000000000000000000000000',
      });

      console.log('Listing created:', newListing);
      setShowCreateListing(false);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing');
    }
  };

  const handlePlaceOffer = async (offerData: Partial<DomaOffer>) => {
    try {
      if (!address) {
        alert('Please connect your wallet first');
        return;
      }

      const newOffer = await placeOffer({
        tokenId: offerData.tokenId || '1',
        name: offerData.name || 'example.com',
        price: offerData.price || '0.08',
        currency: offerData.currency || 'ETH',
        buyer: address,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
        chain: '11155111',
        orderbook: 'DOMA',
        contractAddress: '0x0000000000000000000000000000000000000000',
      });

      console.log('Offer placed:', newOffer);
      setShowPlaceOffer(false);
    } catch (error) {
      console.error('Error placing offer:', error);
      alert('Failed to place offer');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading marketplace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-semibold">Error Loading Marketplace</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <button
          onClick={() => { fetchListings(); fetchOffers(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doma Marketplace</h2>
          <p className="text-gray-600">Trade tokenized domains on the Doma Protocol</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateListing(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Listing
          </button>
          <button
            onClick={() => setShowPlaceOffer(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Place Offer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'listings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Offers ({offers.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Found</h3>
              <p className="text-gray-600 mb-4">Be the first to list a domain on the marketplace</p>
              <button
                onClick={() => setShowCreateListing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedListing(listing)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{listing.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">{listing.price} {listing.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seller:</span>
                      <span className="text-sm font-mono">{formatShort(listing.seller)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="text-sm">{new Date(listing.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orderbook:</span>
                      <span className="text-sm font-medium">{listing.orderbook}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Found</h3>
              <p className="text-gray-600 mb-4">Place an offer on a domain you're interested in</p>
              <button
                onClick={() => setShowPlaceOffer(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Place First Offer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      offer.status === 'active' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offer:</span>
                      <span className="font-semibold">{offer.price} {offer.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buyer:</span>
                      <span className="text-sm font-mono">{formatShort(offer.buyer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="text-sm">{new Date(offer.expiresAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orderbook:</span>
                      <span className="text-sm font-medium">{offer.orderbook}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Accept Offer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fee Calculator */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <FeeCalculator chainId="11155111" />
      </div>

      {/* Marketplace Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Currencies</h4>
            <div className="space-y-1">
              {supportedCurrencies.length > 0 ? (
                supportedCurrencies.map((currency, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {currency.symbol} ({currency.name})
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">ETH, USDC, wETH</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Marketplace Fees</h4>
            <div className="text-sm text-gray-600">
              {marketplaceFees ? (
                <div>
                  <div>Protocol Fee: {marketplaceFees.protocolFee}%</div>
                  <div>Royalty Fee: {marketplaceFees.royaltyFee}%</div>
                  <div>Total Fee: {marketplaceFees.totalFee}%</div>
                </div>
              ) : (
                <div>Protocol Fee: 0.5% + Royalties</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Networks</h4>
            <div className="text-sm text-gray-600">
              <div>• Sepolia Testnet</div>
              <div>• Base Sepolia</div>
              <div>• Doma Testnet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
