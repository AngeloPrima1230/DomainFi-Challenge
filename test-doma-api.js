const { ApolloClient, InMemoryCache, gql, createHttpLink, from } = require('@apollo/client');
const { setContext } = require('@apollo/client/link/context');

// GraphQL query for tokenized names
const GET_TOKENIZED_NAMES = gql`
  query GetTokenizedNames($skip: Int = 0, $take: Int = 10) {
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

// GraphQL query for listings
const GET_LISTINGS = gql`
  query GetListings($skip: Float = 0, $take: Float = 10) {
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

// Create Apollo Client for Doma Protocol
const httpLink = createHttpLink({
  uri: 'https://api-testnet.doma.xyz/graphql',
});

const authLink = setContext((_, { headers }) => {
  const apiKey = 'v1.8f6347c32950c1bfaedc4b29676fcaa14a6586ed8586338b24fdfc6c69df8b02';
  
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

async function testDomaAPI() {
  console.log('🔍 Testing Doma Protocol API...\n');

  try {
    // Test tokenized names query
    console.log('📊 Fetching tokenized names...');
    const namesResult = await client.query({
      query: GET_TOKENIZED_NAMES,
      variables: { skip: 0, take: 5 },
      fetchPolicy: 'network-only',
    });

    if (namesResult.data?.names?.items) {
      console.log(`✅ Found ${namesResult.data.names.items.length} tokenized names`);
      console.log(`📈 Total count: ${namesResult.data.names.totalCount}`);
      
      namesResult.data.names.items.forEach((name, index) => {
        console.log(`\n${index + 1}. ${name.name}`);
        console.log(`   Registrar: ${name.registrar?.name || 'Unknown'}`);
        console.log(`   Expires: ${name.expiresAt}`);
        console.log(`   Tokenized: ${name.tokenizedAt}`);
        console.log(`   Tokens: ${name.tokens?.length || 0}`);
      });
    } else {
      console.log('❌ No tokenized names found');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test listings query
    console.log('🏪 Fetching marketplace listings...');
    const listingsResult = await client.query({
      query: GET_LISTINGS,
      variables: { skip: 0, take: 5 },
      fetchPolicy: 'network-only',
    });

    if (listingsResult.data?.listings?.items) {
      console.log(`✅ Found ${listingsResult.data.listings.items.length} listings`);
      console.log(`📈 Total count: ${listingsResult.data.listings.totalCount}`);
      
      listingsResult.data.listings.items.forEach((listing, index) => {
        console.log(`\n${index + 1}. Listing ID: ${listing.id}`);
        console.log(`   Price: ${listing.price}`);
        console.log(`   Orderbook: ${listing.orderbook}`);
        console.log(`   Token ID: ${listing.tokenId}`);
        console.log(`   Expires: ${listing.expiresAt}`);
      });
    } else {
      console.log('❌ No listings found');
    }

  } catch (error) {
    console.error('❌ Error testing Doma API:', error);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error('GraphQL Error:', err.message, err.extensions);
      });
    }
  }
}

testDomaAPI();
