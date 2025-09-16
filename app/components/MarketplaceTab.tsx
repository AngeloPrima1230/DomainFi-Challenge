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

  // No blocking useEffect - data loads in background

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Compact Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">TAGHAUS Marketplace</h2>
          <p className="text-purple-300/70 text-sm">Trade tokenized domains on Doma Protocol</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { fetchListings(); fetchOffers(); }}
            className="px-3 py-2 bg-gradient-to-r from-slate-700/40 to-purple-800/40 backdrop-blur-md border border-purple-500/30 text-white hover:from-slate-700/60 hover:to-purple-800/60 hover:border-purple-400/50 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {/* Add create listing handler */}}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create Listing
          </button>
          <button
            onClick={() => {/* Add place offer handler */}}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Place Offer
          </button>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="border-b border-purple-500/20">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-4 border-b-2 text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'listings'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-purple-300/70 hover:text-purple-300 hover:border-purple-500/50'
            }`}
          >
            <span>Listings ({Array.isArray(listings) ? listings.length : 0})</span>
            {loading && activeTab === 'listings' && (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-400"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-2 px-4 border-b-2 text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeTab === 'offers'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-purple-300/70 hover:text-purple-300 hover:border-purple-500/50'
            }`}
          >
            <span>Offers ({Array.isArray(offers) ? offers.length : 0})</span>
            {loading && activeTab === 'offers' && (
              <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-400"></div>
            )}
          </button>
        </nav>
      </div>

      {/* Error Banner (non-blocking) */}
      {error && (
        <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-md border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-300 text-sm font-medium">Failed to load data</span>
            </div>
            <button
              onClick={() => { fetchListings(); fetchOffers(); }}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Compact Content */}
      {activeTab === 'listings' && (
        <div className="space-y-2">
          {!Array.isArray(listings) || listings.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-slate-800/30 to-purple-900/30 backdrop-blur-md rounded-xl border border-purple-500/20">
                  <svg className="w-12 h-12 mx-auto mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {loading ? 'Loading listings...' : 'No Listings Found'}
                  </h3>
                  <p className="text-purple-300/70 text-sm">
                    {loading ? 'Please wait while we fetch the latest data' : 'No domains listed for sale yet'}
                  </p>
                </div>
          ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(listings) && listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg border border-purple-500/20 p-4 hover:from-slate-800/60 hover:to-purple-900/60 hover:border-purple-400/40 transition-all cursor-pointer shadow-lg hover:shadow-xl"
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
                  
                      <button className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl">
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
          {!Array.isArray(offers) || offers.length === 0 ? (
                <div className="text-center py-8 bg-gradient-to-br from-slate-800/30 to-purple-900/30 backdrop-blur-md rounded-xl border border-purple-500/20">
                  <svg className="w-12 h-12 mx-auto mb-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {loading ? 'Loading offers...' : 'No Offers Found'}
                  </h3>
                  <p className="text-purple-300/70 text-sm">
                    {loading ? 'Please wait while we fetch the latest data' : 'No offers placed yet'}
                  </p>
                </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(offers) && offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-gradient-to-br from-slate-800/40 to-purple-900/40 backdrop-blur-md rounded-lg border border-purple-500/20 p-4 hover:from-slate-800/60 hover:to-purple-900/60 hover:border-purple-400/40 transition-all shadow-lg hover:shadow-xl"
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
                  
                      <button className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Accept Offer
                      </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

          {/* Compact Marketplace Info */}
          <div className="bg-gradient-to-br from-slate-800/30 to-purple-900/30 backdrop-blur-md rounded-xl border border-purple-500/20 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Marketplace Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Currencies</h4>
            <div className="space-y-1">
              {supportedCurrencies.length > 0 ? (
                supportedCurrencies.slice(0, 3).map((currency, index) => (
                  <div key={index} className="text-sm text-white/80">
                    {currency.symbol}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/80">ETH, USDC, wETH</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Fees</h4>
            <div className="text-sm text-white/80">
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
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Networks</h4>
            <div className="text-sm text-white/80">
              <div>• Doma Testnet</div>
              <div>• Sepolia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}