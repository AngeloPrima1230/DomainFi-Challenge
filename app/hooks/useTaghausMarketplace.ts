import { useState, useEffect } from 'react';
import { useAccount, useContract, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';

// Contract ABI (simplified for key functions)
const MARKETPLACE_ABI = [
  // Token Management
  "function createToken(string memory name, string memory symbol, string memory metadataURI) external returns (uint256)",
  "function burnToken(uint256 tokenId) external",
  
  // Marketplace Operations
  "function createMarketItem(address nftContract, uint256 tokenId, uint256 price, address currency, uint256 duration) external returns (uint256)",
  "function createMarketSale(uint256 itemId) external payable",
  "function updateMarketItem(uint256 itemId, uint256 newPrice, address newCurrency) external",
  "function cancelMarketItem(uint256 itemId) external",
  
  // Data Retrieval
  "function fetchMarketItems(uint256 offset, uint256 limit) external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, address currency, bool sold, bool active, uint256 createdAt, uint256 expiresAt)[] memory items, uint256 total)",
  "function fetchOwnNFTs(address user) external view returns (tuple(uint256 tokenId, string name, string symbol, string metadataURI, address creator, uint256 totalSupply, bool exists)[] memory)",
  "function getMarketItem(uint256 itemId) external view returns (tuple(uint256 itemId, address nftContract, uint256 tokenId, address seller, address owner, uint256 price, address currency, bool sold, bool active, uint256 createdAt, uint256 expiresAt))",
  
  // Admin Functions
  "function addSupportedCurrency(address currency) external",
  "function addSupportedNFTContract(address nftContract) external",
  "function updatePlatformFee(uint256 newFee) external",
  
  // View Functions
  "function platformFee() external view returns (uint256)",
  "function feeRecipient() external view returns (address)",
  "function isCurrencySupported(address currency) external view returns (bool)",
  "function isNFTContractSupported(address nftContract) external view returns (bool)",
  
  // Events
  "event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, string symbol, string metadataURI)",
  "event TokenBurned(uint256 indexed tokenId, address indexed owner)",
  "event MarketItemCreated(uint256 indexed itemId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price, address currency, uint256 expiresAt)",
  "event MarketSaleCreated(uint256 indexed saleId, uint256 indexed itemId, address indexed buyer, address seller, uint256 price, address currency)",
  "event MarketItemSold(uint256 indexed itemId, address indexed buyer, uint256 price)"
] as const;

export interface MarketItem {
  itemId: number;
  nftContract: string;
  tokenId: number;
  seller: string;
  owner: string;
  price: string;
  currency: string;
  sold: boolean;
  active: boolean;
  createdAt: number;
  expiresAt: number;
}

export interface TokenInfo {
  tokenId: number;
  name: string;
  symbol: string;
  metadataURI: string;
  creator: string;
  totalSupply: number;
  exists: boolean;
}

export interface MarketplaceStats {
  totalItems: number;
  totalSales: number;
  totalTokens: number;
  platformFee: number;
  feeRecipient: string;
}

export function useTaghausMarketplace(contractAddress?: string) {
  const { address } = useAccount();
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [userTokens, setUserTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract instance
  const marketplace = useContract({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
  });

  // Contract reads
  const { data: platformFee } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'platformFee',
  });

  const { data: feeRecipient } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'feeRecipient',
  });

  // Contract writes
  const { write: createToken, data: createTokenData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'createToken',
  });

  const { write: createMarketItem, data: createMarketItemData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'createMarketItem',
  });

  const { write: createMarketSale, data: createMarketSaleData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'createMarketSale',
  });

  const { write: cancelMarketItem, data: cancelMarketItemData } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: MARKETPLACE_ABI,
    functionName: 'cancelMarketItem',
  });

  // Wait for transactions
  const { isLoading: isCreatingToken } = useWaitForTransaction({
    hash: createTokenData?.hash,
  });

  const { isLoading: isCreatingMarketItem } = useWaitForTransaction({
    hash: createMarketItemData?.hash,
  });

  const { isLoading: isCreatingMarketSale } = useWaitForTransaction({
    hash: createMarketSaleData?.hash,
  });

  const { isLoading: isCancellingMarketItem } = useWaitForTransaction({
    hash: cancelMarketItemData?.hash,
  });

  // Fetch market items
  const fetchMarketItems = async (offset: number = 0, limit: number = 50) => {
    if (!marketplace) return;

    try {
      setLoading(true);
      setError(null);

      const [items, total] = await marketplace.fetchMarketItems(offset, limit);
      
      const formattedItems: MarketItem[] = items.map((item: any) => ({
        itemId: Number(item.itemId),
        nftContract: item.nftContract,
        tokenId: Number(item.tokenId),
        seller: item.seller,
        owner: item.owner,
        price: item.price.toString(),
        currency: item.currency,
        sold: item.sold,
        active: item.active,
        createdAt: Number(item.createdAt),
        expiresAt: Number(item.expiresAt),
      }));

      setMarketItems(formattedItems);
      return { items: formattedItems, total: Number(total) };
    } catch (err: any) {
      setError(err.message || 'Failed to fetch market items');
      return { items: [], total: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's tokens
  const fetchUserTokens = async (userAddress?: string) => {
    if (!marketplace || !userAddress) return;

    try {
      setLoading(true);
      setError(null);

      const tokens = await marketplace.fetchOwnNFTs(userAddress);
      
      const formattedTokens: TokenInfo[] = tokens.map((token: any) => ({
        tokenId: Number(token.tokenId),
        name: token.name,
        symbol: token.symbol,
        metadataURI: token.metadataURI,
        creator: token.creator,
        totalSupply: Number(token.totalSupply),
        exists: token.exists,
      }));

      setUserTokens(formattedTokens);
      return formattedTokens;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user tokens');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new token
  const createNewToken = async (
    name: string,
    symbol: string,
    metadataURI: string
  ) => {
    if (!createToken) {
      throw new Error('Contract not available');
    }

    try {
      createToken({
        args: [name, symbol, metadataURI],
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create token');
    }
  };

  // Create a market item
  const createNewMarketItem = async (
    nftContract: string,
    tokenId: number,
    price: string,
    currency: string = '0x0000000000000000000000000000000000000000', // ETH
    duration: number = 86400 // 1 day
  ) => {
    if (!createMarketItem) {
      throw new Error('Contract not available');
    }

    try {
      createMarketItem({
        args: [nftContract, tokenId, ethers.parseEther(price), currency, duration],
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create market item');
    }
  };

  // Create a market sale
  const createNewMarketSale = async (
    itemId: number,
    price: string
  ) => {
    if (!createMarketSale) {
      throw new Error('Contract not available');
    }

    try {
      createMarketSale({
        args: [itemId],
        value: ethers.parseEther(price),
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create market sale');
    }
  };

  // Cancel market item
  const cancelItem = async (itemId: number) => {
    if (!cancelMarketItem) {
      throw new Error('Contract not available');
    }

    try {
      cancelMarketItem({
        args: [itemId],
      });
    } catch (err: any) {
      throw new Error(err.message || 'Failed to cancel market item');
    }
  };

  // Get marketplace stats
  const getMarketplaceStats = (): MarketplaceStats => {
    return {
      totalItems: marketItems.length,
      totalSales: marketItems.filter(item => item.sold).length,
      totalTokens: userTokens.length,
      platformFee: platformFee ? Number(platformFee) : 0,
      feeRecipient: feeRecipient || '',
    };
  };

  // Load data on mount
  useEffect(() => {
    if (marketplace && address) {
      fetchMarketItems();
      fetchUserTokens(address);
    }
  }, [marketplace, address]);

  return {
    // Data
    marketItems,
    userTokens,
    loading: loading || isCreatingToken || isCreatingMarketItem || isCreatingMarketSale || isCancellingMarketItem,
    error,
    
    // Contract
    marketplace,
    platformFee: platformFee ? Number(platformFee) : 0,
    feeRecipient,
    
    // Functions
    fetchMarketItems,
    fetchUserTokens,
    createNewToken,
    createNewMarketItem,
    createNewMarketSale,
    cancelItem,
    getMarketplaceStats,
    
    // Transaction states
    isCreatingToken,
    isCreatingMarketItem,
    isCreatingMarketSale,
    isCancellingMarketItem,
  };
}
