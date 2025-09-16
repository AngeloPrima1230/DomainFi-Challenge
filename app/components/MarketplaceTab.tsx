'use client';

import { useState, useEffect } from 'react';
import { useDomaMarketplace, DomaListing, DomaOffer } from '../hooks/useDomaMarketplace';
import { useAccount } from 'wagmi';
import { formatAddress } from '../utils/format';

interface MarketplaceTabProps {
  className?: string;
}

export default function MarketplaceTab({ className = '' }: MarketplaceTabProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'offers'>('listings');
  const [selectedListing, setSelectedListing] = useState<DomaListing | null>(null);
  
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
  } = useDomaMarketplace();

  useEffect(() => {
    fetchListings();
    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
        <span className="ml-2 text-gray-300 text-sm">Loading marketplace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 text-center ${className}`}>
        <div className="text-red-400 mb-3">
          <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium">Error Loading Marketplace</p>
          <p className="text-xs text-gray-400">{error}</p>
        </div>
        <button
          onClick={() => { fetchListings(); fetchOffers(); }}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Doma Marketplace</h2>
          <p className="text-gray-400 text-xs">Trade tokenized domains</p>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="border-b border-white/20">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-1 px-2 border-b-2 text-xs font-medium ${
              activeTab === 'listings'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-1 px-2 border-b-2 text-xs font-medium ${
              activeTab === 'offers'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            Offers ({offers.length})
          </button>
        </nav>
      </div>

      {/* Compact Content */}
      {activeTab === 'listings' && (
        <div className="space-y-2">
          {listings.length === 0 ? (
            <div className="text-center py-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-sm font-medium text-white mb-1">No Listings Found</h3>
              <p className="text-gray-400 text-xs">No domains listed for sale yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white/10 backdrop-blur-md rounded-md border border-white/20 p-3 hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer"
                  onClick={() => setSelectedListing(listing)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white truncate">{listing.name}</h3>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      listing.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-medium">{listing.price} {listing.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seller:</span>
                      <span className="text-white font-mono text-xs">{formatAddress(listing.seller)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-white text-xs">{new Date(listing.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="space-y-2">
          {offers.length === 0 ? (
            <div className="text-center py-6 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-sm font-medium text-white mb-1">No Offers Found</h3>
              <p className="text-gray-400 text-xs">No offers placed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white/10 backdrop-blur-md rounded-md border border-white/20 p-3 hover:bg-white/15 hover:border-white/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white truncate">{offer.name}</h3>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      offer.status === 'active' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Offer:</span>
                      <span className="text-white font-medium">{offer.price} {offer.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Buyer:</span>
                      <span className="text-white font-mono text-xs">{formatAddress(offer.buyer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-white text-xs">{new Date(offer.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors">
                    Accept Offer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Marketplace Info */}
      <div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-3">
        <h3 className="text-sm font-semibold text-white mb-2">Marketplace Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <h4 className="text-xs font-medium text-white mb-1">Currencies</h4>
            <div className="space-y-0.5">
              {supportedCurrencies.length > 0 ? (
                supportedCurrencies.slice(0, 3).map((currency, index) => (
                  <div key={index} className="text-xs text-gray-400">
                    {currency.symbol}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">ETH, USDC, wETH</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white mb-1">Fees</h4>
            <div className="text-xs text-gray-400">
              {marketplaceFees ? (
                <div>
                  <div>Protocol: {marketplaceFees.protocolFee}%</div>
                  <div>Total: {marketplaceFees.totalFee}%</div>
                </div>
              ) : (
                <div>Protocol: 0.5%</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white mb-1">Networks</h4>
            <div className="text-xs text-gray-400">
              <div>• Doma Testnet</div>
              <div>• Sepolia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}