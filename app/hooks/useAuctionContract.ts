import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useDomaSubgraph } from './useDomaSubgraph';

export interface Auction {
  id: string;
  auctionId: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  startingPrice: string;
  reservePrice: string;
  currentPrice: string;
  startTime: number;
  endTime: number;
  auctionType: number; // 0: ENGLISH, 1: DUTCH, 2: SEALED_BID
  status: number; // 0: ACTIVE, 1: ENDED, 2: CANCELLED, 3: SETTLED
  highestBidder: string;
  highestBid: string;
  isSettled: boolean;
  domainName?: string;
  domainExpiry?: string;
  registrar?: string;
}

export interface CreateAuctionParams {
  nftContract: string;
  tokenId: number;
  startingPrice: string;
  reservePrice: string;
  duration: number;
  auctionType: number;
}

export function useAuctionContract() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address } = useAccount();
  const { names, listings, loading: domaLoading, error: domaError, fetchTokenizedNames, fetchListings } = useDomaSubgraph();

  // Convert Doma listings to auction format
  useEffect(() => {
    if (!domaLoading && !domaError) {
      const convertedAuctions: Auction[] = listings.map((listing, index) => {
        const domainName = listing.token?.name || `domain-${index}`;
        const token = names.find(name => name.name === domainName);
        
        return {
          id: listing.id,
          auctionId: index + 1,
          seller: listing.offererAddress,
          nftContract: listing.token?.chain?.networkId || 'eip155:11155111', // Sepolia testnet
          tokenId: parseInt(listing.token?.tokenId || '0'),
          startingPrice: listing.price,
          reservePrice: listing.price, // Using listing price as reserve
          currentPrice: listing.price,
          startTime: Math.floor(new Date(listing.createdAt).getTime() / 1000),
          endTime: Math.floor(new Date(listing.expiresAt).getTime() / 1000),
          auctionType: 0, // ENGLISH auction
          status: new Date(listing.expiresAt) > new Date() ? 0 : 1, // 0: ACTIVE, 1: ENDED
          highestBidder: '0x0000000000000000000000000000000000000000',
          highestBid: '0.0',
          isSettled: false,
          domainName: domainName,
          domainExpiry: token?.expiresAt,
          registrar: token?.registrar?.name
        };
      });

      // Add some tokenized names that aren't listed yet as potential auctions
      const unlistedNames = names.filter(name => 
        !listings.some(listing => listing.token?.name === name.name)
      ).slice(0, 5);

      const potentialAuctions: Auction[] = unlistedNames.map((name, index) => ({
        id: `potential-${name.name}`,
        auctionId: listings.length + index + 1,
        seller: name.tokens[0]?.ownerAddress || '0x0000000000000000000000000000000000000000',
        nftContract: name.tokens[0]?.chain?.networkId || 'eip155:11155111',
        tokenId: parseInt(name.tokens[0]?.tokenId || '0'),
        startingPrice: '0.1', // Default starting price
        reservePrice: '0.05',
        currentPrice: '0.1',
        startTime: Math.floor(Date.now() / 1000),
        endTime: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        auctionType: 0,
        status: 0,
        highestBidder: '0x0000000000000000000000000000000000000000',
        highestBid: '0.0',
        isSettled: false,
        domainName: name.name,
        domainExpiry: name.expiresAt,
        registrar: name.registrar?.name
      }));

      setAuctions([...convertedAuctions, ...potentialAuctions]);
      setLoading(false);
    } else if (domaError) {
      setError(domaError);
      setLoading(false);
    }
  }, [names, listings, domaLoading, domaError]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchTokenizedNames(), fetchListings()]);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch auctions');
    }
  };

  const getAuctionById = async (auctionId: number): Promise<Auction | null> => {
    return auctions.find(auction => auction.auctionId === auctionId) || null;
  };

  const createAuction = async (params: CreateAuctionParams): Promise<number> => {
    // In a real implementation, this would interact with the smart contract
    console.log('Creating auction with params:', params);
    
    // For now, we'll simulate creating an auction
    const newAuction: Auction = {
      id: `new-${Date.now()}`,
      auctionId: auctions.length + 1,
      seller: address || '0x0000000000000000000000000000000000000000',
      nftContract: params.nftContract,
      tokenId: params.tokenId,
      startingPrice: params.startingPrice,
      reservePrice: params.reservePrice,
      currentPrice: params.startingPrice,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + params.duration,
      auctionType: params.auctionType,
      status: 0,
      highestBidder: '0x0000000000000000000000000000000000000000',
      highestBid: '0.0',
      isSettled: false
    };

    setAuctions(prev => [newAuction, ...prev]);
    return newAuction.auctionId;
  };

  const placeBid = async (auctionId: number, bidAmount: string): Promise<void> => {
    // In a real implementation, this would interact with the smart contract
    console.log(`Placing bid ${bidAmount} on auction ${auctionId}`);
    
    setAuctions(prev => prev.map(auction => 
      auction.auctionId === auctionId 
        ? { 
            ...auction, 
            currentPrice: bidAmount,
            highestBidder: address || '0x0000000000000000000000000000000000000000',
            highestBid: bidAmount
          }
        : auction
    ));
  };

  const placeDutchBid = async (auctionId: number, bidAmount: string): Promise<void> => {
    console.log(`Placing Dutch bid ${bidAmount} on auction ${auctionId}`);
    await placeBid(auctionId, bidAmount);
  };

  const endAuction = async (auctionId: number): Promise<void> => {
    console.log(`Ending auction ${auctionId}`);
    
    setAuctions(prev => prev.map(auction => 
      auction.auctionId === auctionId 
        ? { ...auction, status: 1 } // ENDED
        : auction
    ));
  };

  const settleAuction = async (auctionId: number): Promise<void> => {
    console.log(`Settling auction ${auctionId}`);
    
    setAuctions(prev => prev.map(auction => 
      auction.auctionId === auctionId 
        ? { ...auction, status: 3, isSettled: true } // SETTLED
        : auction
    ));
  };

  const cancelAuction = async (auctionId: number): Promise<void> => {
    console.log(`Cancelling auction ${auctionId}`);
    
    setAuctions(prev => prev.map(auction => 
      auction.auctionId === auctionId 
        ? { ...auction, status: 2 } // CANCELLED
        : auction
    ));
  };

  const getCurrentDutchPrice = async (auctionId: number): Promise<string> => {
    const auction = auctions.find(a => a.auctionId === auctionId);
    if (!auction) return '0';
    
    // Calculate Dutch auction price based on time elapsed
    const now = Math.floor(Date.now() / 1000);
    const timeElapsed = now - auction.startTime;
    const totalDuration = auction.endTime - auction.startTime;
    const priceRange = parseFloat(auction.startingPrice) - parseFloat(auction.reservePrice);
    const currentPrice = parseFloat(auction.startingPrice) - (priceRange * timeElapsed / totalDuration);
    
    return Math.max(currentPrice, parseFloat(auction.reservePrice)).toString();
  };

  const getAuctionBidders = async (auctionId: number): Promise<string[]> => {
    // In a real implementation, this would fetch from the smart contract
    const auction = auctions.find(a => a.auctionId === auctionId);
    return auction?.highestBidder !== '0x0000000000000000000000000000000000000000' 
      ? [auction.highestBidder] 
      : [];
  };

  return {
    auctions,
    loading,
    error,
    fetchAuctions,
    getAuctionById,
    createAuction,
    placeBid,
    placeDutchBid,
    endAuction,
    settleAuction,
    cancelAuction,
    getCurrentDutchPrice,
    getAuctionBidders,
  };
}

