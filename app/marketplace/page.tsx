'use client';

import { useState } from 'react';
import { useDomaMarketplace } from '../hooks/useDomaMarketplace';
import MarketplaceTab from '../components/MarketplaceTab';
import CreateListingModal from '../components/CreateListingModal';
import PlaceOfferModal from '../components/PlaceOfferModal';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';

export default function MarketplacePage() {
  const { 
    listings: marketplaceListings, 
    createListing,
    placeOffer
  } = useDomaMarketplace();
  
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { getThemeClasses } = useTheme();
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showPlaceOffer, setShowPlaceOffer] = useState(false);

  return (
    <div className={`min-h-screen ${getThemeClasses('background')}`}>
      {/* Compact Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className={`${getThemeClasses('section')} rounded-xl p-6`}>
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
