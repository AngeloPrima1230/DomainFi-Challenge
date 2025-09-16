'use client';

import { useState } from 'react';
import { useDomaMarketplace } from '../hooks/useDomaMarketplace';
import MarketplaceTab from '../components/MarketplaceTab';
import CreateListingModal from '../components/CreateListingModal';
import PlaceOfferModal from '../components/PlaceOfferModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const { 
    listings: marketplaceListings, 
    createListing,
    placeOffer
  } = useDomaMarketplace();
  
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Compact Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10">
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
