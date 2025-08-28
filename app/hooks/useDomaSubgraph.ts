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
      'API-Key': apiKey,
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
  };
}

