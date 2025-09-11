import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, gql, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// GraphQL query for tokenized names using Doma Protocol
const GET_TOKENIZED_NAMES = gql`
  query GetTokenizedNames($skip: Int = 0, $take: Int = 100) {
    names(skip: $skip, take: $take, sortOrder: DESC) {
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
          currency
          expiresAt
          orderbook
        }
      }
      activities {
        items {
          type
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    }
  }
`;

// GraphQL query for listings
const GET_LISTINGS = gql`
  query GetListings($skip: Float = 0, $take: Float = 100) {
    listings(skip: $skip, take: $take) {
      items {
        id
        externalId
        price
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
  query GetNameActivities($name: String!, $skip: Float, $take: Float) {
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
  query GetTokenActivities($tokenId: String!, $skip: Float, $take: Float) {
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
      correlationId
      type
      status
      createdAt
      updatedAt
      error
    }
  }
`;

// Create Apollo Client for Doma Protocol with API key authentication
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql',
});

// Add authentication headers - Use the correct API-Key header
const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMA_API_KEY || process.env.DOMA_API_KEY;
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
  currency: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  token: {
    tokenId: string;
    name: string;
    ownerAddress: string;
    chain: {
      name: string;
      networkId: string;
    };
  };
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

  useEffect(() => {
    fetchTokenizedNames();
    fetchListings();
  }, []);

  const fetchTokenizedNames = async (skip = 0, take = 100) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching tokenized names with API key:', process.env.NEXT_PUBLIC_DOMA_API_KEY ? 'Present' : 'Missing');
      
      const { data } = await client.query({
        query: GET_TOKENIZED_NAMES,
        variables: { skip: Number(skip), take: Number(take) },
        fetchPolicy: 'network-only',
      });

      if (data?.names?.items) {
        setNames(data.names.items);
        console.log('Successfully fetched tokenized names:', data.names.items.length);
      }
    } catch (err) {
      console.error('Error fetching tokenized names:', err);
      if (err.graphQLErrors) {
        err.graphQLErrors.forEach((error: any) => {
          console.error('GraphQL Error:', error.message, error.extensions);
        });
      }
      // Don't set error for API issues, just log them
      // setError(err instanceof Error ? err.message : 'Failed to fetch tokenized names');
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async (skip = 0, take = 100) => {
    try {
      const { data } = await client.query({
        query: GET_LISTINGS,
        variables: { skip: Number(skip), take: Number(take) },
        fetchPolicy: 'network-only',
      });

      if (data?.listings?.items) {
        setListings(data.listings.items);
        console.log('Successfully fetched listings:', data.listings.items.length);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
      // Don't set error for API issues, just log them
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

      return data.names?.items || [];
    } catch (err) {
      console.error('Error searching names:', err);
      return [];
    }
  };

  const getNamesByOwner = async (ownerAddress: string): Promise<TokenizedName[]> => {
    try {
      const { data } = await client.query({
        query: gql`
          query GetNamesByOwner($ownedBy: [AddressCAIP10!]!) {
            names(ownedBy: $ownedBy, take: 100) {
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
        variables: { ownedBy: [ownerAddress] },
        fetchPolicy: 'network-only',
      });

      return data.names?.items || [];
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
  };
}

