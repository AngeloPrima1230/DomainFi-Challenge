import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

console.log('📁 useDomaSubgraph.ts file loaded');

// GraphQL query for tokenized names using Doma Protocol
const GET_TOKENIZED_NAMES = gql`
  query GetTokenizedNames(
    $skip: Int = 0, 
    $take: Int = 100, 
    $ownedBy: [AddressCAIP10!], 
    $name: String, 
    $networkIds: [String!], 
    $registrarIanaIds: [Int!], 
    $tlds: [String!], 
    $fractionalized: Boolean, 
    $listed: Boolean, 
    $active: Boolean, 
    $priceRangeMin: Float, 
    $priceRangeMax: Float, 
    $priceRangeCurrency: String, 
    $claimStatus: NamesQueryClaimStatus, 
    $sortBy: NamesQuerySortBy
  ) {
    names(
      skip: $skip, 
      take: $take, 
      sortOrder: DESC,
      ownedBy: $ownedBy,
      name: $name,
      networkIds: $networkIds,
      registrarIanaIds: $registrarIanaIds,
      tlds: $tlds,
      fractionalized: $fractionalized,
      listed: $listed,
      active: $active,
      priceRangeMin: $priceRangeMin,
      priceRangeMax: $priceRangeMax,
      priceRangeCurrency: $priceRangeCurrency,
      claimStatus: $claimStatus,
      sortBy: $sortBy
    ) {
      items {
        name
        expiresAt
        tokenizedAt
        eoi
        registrar {
          name
          ianaId
        }
        nameservers {
          ldhName
        }
        dsKeys {
          keyTag
          algorithm
          digestType
          digest
        }
        transferLock
        claimedBy
        tokens {
          tokenId
          networkId
          ownerAddress
          type
          startsAt
          expiresAt
          chain {
            name
            networkId
          }
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
`;

// GraphQL query for domain details
const GET_NAME_DETAILS = gql`
  query GetNameDetails($name: String!) {
    name(name: $name) {
      name
      expiresAt
      tokenizedAt
      eoi
      registrar {
        name
        ianaId
        websiteUrl
        supportEmail
      }
      nameservers {
        ldhName
      }
      dsKeys {
        keyTag
        algorithm
        digestType
        digest
      }
      transferLock
      claimedBy
      tokens {
        tokenId
        networkId
        ownerAddress
        type
        startsAt
        expiresAt
        chain {
          name
          networkId
        }
        listings {
          id
          price
          currency {
            symbol
            decimals
          }
          expiresAt
          orderbook
        }
      }
    }
  }
`;

const GET_LISTINGS = gql`
  query GetListings($skip: Int = 0, $take: Int = 100) {
    listings(skip: $skip, take: $take) {
      items {
        id
        externalId
        price
        currency {
          symbol
          decimals
        }
        offererAddress
        orderbook
        tokenId
        expiresAt
        createdAt
        updatedAt
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
`;

// GraphQL query for name activities
const GET_NAME_ACTIVITIES = gql`
  query GetNameActivities($name: String!, $skip: Int, $take: Int) {
    nameActivities(name: $name, skip: $skip, take: $take, sortOrder: DESC) {
      items {
        __typename
        ... on NameClaimedActivity {
          type
          txHash
          sld
          tld
          createdAt
          claimedBy
        }
        ... on NameDetokenizedActivity {
          type
          txHash
          sld
          tld
          createdAt
          networkId
        }
        ... on NameClaimRequestedActivity {
          type
          txHash
          sld
          tld
          createdAt
        }
        ... on NameRenewedActivity {
          type
          txHash
          sld
          tld
          createdAt
          expiresAt
        }
        ... on NameTokenizedActivity {
          type
          txHash
          sld
          tld
          createdAt
          networkId
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
`;

// GraphQL query for token activities
const GET_TOKEN_ACTIVITIES = gql`
  query GetTokenActivities($tokenId: String!, $skip: Int, $take: Int) {
    tokenActivities(tokenId: $tokenId, skip: $skip, take: $take, sortOrder: DESC) {
      items {
        __typename
        ... on TokenMintedActivity {
          type
          networkId
          txHash
          finalized
          tokenId
          createdAt
        }
        ... on TokenListedActivity {
          type
          networkId
          txHash
          finalized
          tokenId
          createdAt
        }
        ... on TokenListingCancelledActivity {
          type
          networkId
          txHash
          finalized
          tokenId
          createdAt
        }
        ... on TokenBoughtOutActivity {
          type
          networkId
          txHash
          finalized
          tokenId
          createdAt
        }
        ... on TokenFractionalizedActivity {
          type
          networkId
          txHash
          finalized
          tokenId
          createdAt
        }
      }
      totalCount
      pageSize
      currentPage
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
`;

// GraphQL query for command status
const GET_COMMAND_STATUS = gql`
  query GetCommandStatus($correlationId: String!) {
    command(correlationId: $correlationId) {
      type
      status
      source
      serverCommandId
      clientCommandId
      failureReason
      registrar { name ianaId }
      createdAt
      updatedAt
    }
  }
`;

//GraphQL query for names total count
const GET_NAMES_COUNT = gql`
  query GetNamesCount {
    names(skip: 0, take: 1) {
      totalCount
    }
  }
`;

// Create Apollo Client for Doma Protocol with API key authentication
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql',
});

// Add authentication headers - Use the correct API-Key header
const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';
  return {
    headers: {
      ...headers,
      ...(apiKey ? { 'API-Key': apiKey as string } : {}),
      'Content-Type': 'application/json',
    }
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export interface TokenizedName {
  name: string;
  expiresAt: string;
  tokenizedAt: string;
  eoi: boolean;
  registrar: {
    name: string;
    ianaId: number;
  };
  nameservers: string[];
  dsKeys: string[];
  transferLock: boolean;
  claimedBy: string;
  tokens: Array<{
    tokenId: string;
    networkId: string;
    ownerAddress: string;
    type: 'OWNERSHIP' | 'SYNTHETIC';
    startsAt: string;
    expiresAt: string;
    chain: {
      name: string;
      networkId: string;
    };
  }>;
}

export interface Listing {
  id: string;
  externalId: string;
  price: string;
  offererAddress: string;
  orderbook: 'DOMA' | 'OPENSEA';
  currency: {
    symbol: string;
    decimals: number;
  };
  tokenId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NameActivity {
  __typename?: string;
  type?: string;
  txHash?: string;
  sld?: string;
  tld?: string;
  createdAt?: string;
  claimedBy?: string;
  networkId?: string;
  expiresAt?: string;
}

export interface TokenActivity {
  __typename?: string;
  type?: string;
  networkId?: string;
  txHash?: string;
  finalized?: boolean;
  tokenId?: string;
  createdAt?: string;
}

export interface CommandStatus {
  correlationId: string;
  type: string;
  status: 'PENDING' | 'FINALIZING' | 'SUCCEEDED' | 'FAILED' | 'PARTIALLY_SUCCEEDED';
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export function useDomaSubgraph() {
  const [names, setNames] = useState<TokenizedName[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [namesTotalCount, setNamesTotalCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return; // Prevent multiple initializations
    
    console.log('🔄 Initializing Doma Subgraph hook');
    setInitialized(true);
    
    // Load initial data
    fetchNameCount();
    fetchTokenizedNames('', 0, 100); // Load first 100 names without search term (API max 100)
    fetchListings('', 0, 100); // Load first 100 listings without search term
  }, [initialized]);

  const fetchTokenizedNames = async (
    name?: string, 
    skip = 0, 
    take = 15, 
    append = false,
    filters?: {
      ownedBy?: string[];
      networkIds?: string[];
      registrarIanaIds?: number[];
      tlds?: string[];
      fractionalized?: boolean;
      listed?: boolean;
      active?: boolean;
      priceRangeMin?: number;
      priceRangeMax?: number;
      priceRangeCurrency?: string;
      claimStatus?: 'CLAIMED' | 'UNCLAIMED' | 'ALL';
      sortBy?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Only log on first fetch or when filters change
      if (skip === 0 && !append) {
        console.log('🔍 Fetching tokenized names with filters:', filters);
      }
      
      const { data } = await client.query({
        query: GET_TOKENIZED_NAMES,
        variables: { 
          skip: Number(skip), 
          take: Number(take),
          name: name || null,
          ...filters
        },
        fetchPolicy: 'network-only',
      });

      const newItems = data?.names?.items || [];
      
      // Only log on first fetch or when filters change
      if (skip === 0 && !append) {
        console.log('✅ Fetched', newItems.length, 'names (total available:', data?.names?.totalCount, ')');
      }

      setNames(prev => append ? [...prev, ...newItems] : newItems);

      if(!name || name === '' || name === null || name === undefined) {
        setNamesTotalCount(data?.names?.totalCount ?? 0);
      }

      return {
        items: newItems,
        totalCount: data?.names?.totalCount ?? 0,
        hasNextPage: data?.names?.hasNextPage ?? false,
      };
    } catch (err) {
      console.error('Error fetching tokenized names:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async (name?: string, skip = 0, take = 15, append = false) => {
    try {
      const { data } = await client.query({
        query: GET_LISTINGS,
        variables: { skip: Number(skip), take: Number(take) },
        fetchPolicy: 'network-only',
      });

      const items = data?.listings?.items || [];
      const filtered = name
        ? items.filter((l: any) => {
            const n = l?.token?.name || l?.name || '';
            return n.toLowerCase().includes(name.toLowerCase());
          })
        : items;

      setListings(prev => append ? [...prev, ...filtered] : filtered);

      return {
        items: filtered,
        totalCount: data?.listings?.totalCount ?? 0,
        hasNextPage: data?.listings?.hasNextPage ?? false,
      };
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const getNameDetails = async (name: string): Promise<TokenizedName | null> => {
    try {
      const { data } = await client.query({
        query: GET_NAME_DETAILS,
        variables: { name },
        fetchPolicy: 'network-only',
      });

      return data.name;
    } catch (err) {
      console.error('Error fetching name details:', err);
      return null;
    }
  };

  const searchNames = async (searchTerm: string): Promise<TokenizedName[]> => {
    try {
      const { data } = await client.query({
        query: gql`
          query SearchNames($name: String!) {
            names(name: $name, take: 20) {
              items {
                name
                expiresAt
                tokenizedAt
                eoi
                registrar {
                  name
                  ianaId
                }
                nameservers {
                  ldhName
                }
                dsKeys {
                  keyTag
                  algorithm
                  digestType
                  digest
                }
                transferLock
                claimedBy
                tokens {
                  tokenId
                  networkId
                  ownerAddress
                  type
                  chain {
                    name
                    networkId
                  }
                }
              }
            }
          }
        `,
        variables: { name: searchTerm },
        fetchPolicy: 'network-only',
      });

      return data?.names?.items || [];
    } catch (err) {
      console.error('Error searching names:', err);
      return [];
    }
  };

  const getNamesByOwner = async (ownerAddress: string): Promise<TokenizedName[]> => {
    try {
      console.log('🔍 Fetching domains for owner:', ownerAddress);
      // Use the main query with ownedBy filter instead of a separate query
      const result = await fetchTokenizedNames('', 0, 100, false, {
        ownedBy: [ownerAddress]
      });
      console.log('✅ Found', result?.items?.length || 0, 'domains for owner');
      return result?.items || [];
    } catch (err) {
      console.error('Error fetching names by owner:', err);
      return [];
    }
  };

  // Fetch name activities
  const getNameActivities = async (name: string, skip = 0, take = 50): Promise<PaginatedResponse<NameActivity>> => {
    try {
      const { data } = await client.query({
        query: GET_NAME_ACTIVITIES,
        variables: { 
          name, 
          skip: skip > 0 ? Number(skip) : null, 
          take: Number(take) 
        },
        fetchPolicy: 'network-only',
      });

      return data.nameActivities || { items: [], totalCount: 0, pageSize: take, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    } catch (err) {
      console.error('Error fetching name activities:', err);
      return { items: [], totalCount: 0, pageSize: take, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }
  };

  // Fetch token activities
  const getTokenActivities = async (tokenId: string, skip = 0, take = 50): Promise<PaginatedResponse<TokenActivity>> => {
    try {
      const { data } = await client.query({
        query: GET_TOKEN_ACTIVITIES,
        variables: { 
          tokenId, 
          skip: skip > 0 ? Number(skip) : null, 
          take: Number(take) 
        },
        fetchPolicy: 'network-only',
      });

      return data.tokenActivities || { items: [], totalCount: 0, pageSize: take, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    } catch (err) {
      console.error('Error fetching token activities:', err);
      return { items: [], totalCount: 0, pageSize: take, currentPage: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
    }
  };

  // Fetch command status
  const getCommandStatus = async (correlationId: string): Promise<CommandStatus | null> => {
    try {
      const { data } = await client.query({
        query: GET_COMMAND_STATUS,
        variables: { correlationId },
        fetchPolicy: 'network-only',
      });

      return data.command;
    } catch (err) {
      console.error('Error fetching command status:', err);
      return null;
    }
  };

  const fetchNameCount = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await client.query({
        query: GET_NAMES_COUNT,
        fetchPolicy: 'network-only',
      });

      setNamesTotalCount(data?.names?.totalCount ?? 0);
    } catch (err) {
      console.error('Error fetching names count:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch names count');
    } finally {
      setLoading(false);
    }
  };

  return {
    names,
    listings,
    loading,
    error,
    fetchTokenizedNames,
    fetchListings,
    getNameDetails,
    searchNames,
    getNamesByOwner,
    getNameActivities,
    getTokenActivities,
    getCommandStatus,
    // new:
    namesTotalCount,
    fetchNameCount,
  };
}

