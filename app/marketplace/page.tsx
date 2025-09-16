'use client';

import { useState } from 'react';
import { useDomaMarketplace } from '../hooks/useDomaMarketplace';
import MarketplaceTab from '../components/MarketplaceTab';
import CreateListingModal from '../components/CreateListingModal';
import PlaceOfferModal from '../components/PlaceOfferModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function MarketplacePage() {
  const { 
    listings: marketplaceListings, 
    createListing,
    placeOffer
  } = useDomaMarketplace();
  
  const { address, isConnected } = useAccount();
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Doma Protocol</h1>
                <p className="text-sm text-gray-300">Domain Marketplace</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="/" 
                className="text-white hover:text-blue-400 transition-colors font-medium"
              >
                Home
              </a>
              <a 
                href="/marketplace" 
                className="text-blue-400 font-medium"
              >
                Marketplace
              </a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {marketplaceListings.length.toLocaleString()} listings available
              </span>
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">
                    Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => setShowCreateListing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Listing
                  </button>
                  <button
                    onClick={() => setShowPlaceOffer(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Place Offer
                  </button>
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
          <MarketplaceTab />
        </div>
      </main>

      {/* Modals */}
      <CreateListingModal
        isOpen={showCreateListing}
        onClose={() => setShowCreateListing(false)}
        onSubmit={createListing}
      />
      
      <PlaceOfferModal
        isOpen={showPlaceOffer}
        onClose={() => setShowPlaceOffer(false)}
        onSubmit={placeOffer}
      />
    </div>
  );
}
