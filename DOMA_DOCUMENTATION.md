# Doma Protocol Documentation

## Table of Contents
- [About Doma Protocol](#about-doma-protocol)
  - [What is DomainFi](#what-is-domainfi)
  - [Key Innovations](#key-innovations)
- [Why Build on Doma](#why-build-on-doma)
  - [For Registrars and Registries](#for-registrars-and-registries)
  - [For Blockchain Ecosystems](#for-blockchain-ecosystems)
  - [For Developers](#for-developers)
  - [For Domain Holders](#for-domain-holders)
- [Protocol Overview](#protocol-overview)
  - [DomainFi Innovation Steps](#domainfi-innovation-steps)
  - [Stakeholder Benefits Overview](#stakeholder-benefits-overview)
- [Technical Architecture](#technical-architecture)
  - [Core Components](#core-components)
  - [Supported Use Cases](#supported-use-cases)
- [Domain Infrastructure 101](#domain-infrastructure-101)
  - [Domains](#domains)
  - [Registrants](#registrants)
  - [Registrars](#registrars)
  - [Registries](#registries)
- [Domain NFT Marketplace](#domain-nft-marketplace)
  - [Overview](#overview)
  - [Key Benefits](#key-benefits-of-domain-nft-marketplaces)
  - [Technical Implementation](#technical-implementation)
  - [Integration with Traditional Infrastructure](#integration-with-traditional-infrastructure)
  - [Use Cases](#use-cases)
  - [Security Considerations](#security-considerations)
- [Doma Multi-Chain Subgraph](#doma-multi-chain-subgraph)
  - [Endpoints](#endpoints)
  - [Queries](#queries)
  - [Mutations](#mutations)
  - [Data Models](#data-models)
  - [Enums](#enums)
  - [Input Types](#input-types)
- [Doma Smart Contracts API](#doma-smart-contracts-api)
  - [Protocol Overview](#protocol-overview-1)
  - [EVM-Compatible Chains](#evm-compatible-chains)
  - [Solana](#solana)
- [Doma Marketplace](#doma-marketplace)
  - [How to Use Orderbook API](#how-to-use-orderbook-api)
  - [Marketplace Fees](#marketplace-fees)
  - [Supported Currencies](#supported-currencies)
  - [Making ETH Offers](#making-eth-offers)
  - [Seaport Protocol](#seaport-protocol)

---

## About Doma Protocol

### What is DomainFi

DomainFi represents a new economic paradigm for the domain industry, addressing significant challenges in the current $340B+ domain ecosystem. Traditional domain management faces several critical limitations:

- The domain industry has historically maintained high barriers to entry through strict ICANN accreditation requirements
- Secondary market trading suffers from opacity and high friction, often requiring intermediary escrow services and long transfer times
- Domains lack programmability and standardized developer interfaces

> **The Doma Protocol revolutionizes this landscape by transforming domains into programmable, blockchain-based assets.**

This transformation enables DomainFi through several key innovations:

### Key Innovations

#### 1. Trusted Domain Tokenization
- Provides a secure onramp for any Registrar or Registry to tokenize domains onto the blockchain
- Maintains full compliance with ICANN regulations
- Ensures seamless integration with existing domain infrastructure

#### 2. State Synchronization
- Implements bi-directional synchronization between on-chain assets and ICANN registries
- Maintains consistent domain metadata and state across web2 and web3 environments
- Provides real-time updates for domain state changes

#### 3. Composable Domain Rights
- Enables splitting domains into synthetic tokens representing specific rights and permissions
- Facilitates granular control over domain management capabilities
- Supports innovative financial instruments based on domain rights

#### 4. DomainFi Application Infrastructure
The protocol provides comprehensive APIs and smart contracts enabling developers to build innovative applications such as:

- Instant-settlement secondary marketplaces
- Fractional domain ownership structures
- Domain-collateralized lending platforms
- Automated domain rental and leasing systems
- On-chain domain parking yield generation

Through these capabilities, DomainFi transforms traditional domains into dynamic, programmable assets that can participate in the broader web3 financial ecosystem.

---

## Why Build on Doma

The Doma Protocol creates substantial value for multiple stakeholders across the domain and blockchain ecosystems:

### For Registrars and Registries

**Secure Tokenization Infrastructure**
- A fully compliant system for converting traditional domains into blockchain assets
- Built-in ICANN requirement handling and automated compliance checks

**Multi-Chain Integration**
- Native support for major Layer1 and Layer2 blockchains
- Enables registrars to offer domain tokenization across multiple popular networks without additional infrastructure

**Enhanced Revenue Streams**
- New revenue opportunities through tokenization services
- Domain rights tokenization
- Integration with DomainFi applications

**Automated State Management**
- Streamlined handling of tokenized domains
- Automated synchronization between blockchain and traditional DNS infrastructure

### For Blockchain Ecosystems

**Real-World Asset Integration**
- Direct integration of the $300B+ domain market as on-chain assets
- Brings significant real-world value onto blockchain networks

**Transaction Volume Growth**
- Increased network activity through DomainFi transactions
- Includes trading, lending, and permission management

**Cross-Chain Opportunities**
- Enhanced interoperability through standardized domain asset handling
- Works across different blockchain networks

**DomainFi Ecosystem Expansion**
- New opportunities for dApps and protocols
- Incorporates domain-based financial products and services

### For Developers

**Reseller APIs**
- Enable domain sales through NFT marketplaces and dApps
- No need for ICANN accreditation

**Smart Contract Libraries**
- Pre-built, audited smart contracts for common domain management operations

**Flexible Permission System**
- Programmable domain primitives enabling creative applications of domain rights and permissions

**Subgraph Integration**
- GraphQL-based subgraph for efficient querying of domain metadata and transaction history

**Cross-Chain Development Tools**
- Infrastructure for building applications that work seamlessly across multiple blockchain networks

### For Domain Holders

**Financial Utility**
- Multiple options for leveraging domain value
- Includes fractional ownership, collateralized lending, and yield generation

**Enhanced Liquidity**
- Instant access to secondary markets
- No traditional escrow services or lengthy transfer processes

**Granular Permission Control**
- Ability to split domain rights into specific permissions for different use cases
- Maintains overall ownership while enabling flexible usage

**Web3 Integration**
- Seamless integration with web3 applications
- Use as digital identity and wallet resolution

**Revenue Generation**
- Multiple paths for generating revenue from domain assets
- Includes parking, leasing, and permission trading

---

> **Ready to unlock the full potential of domains?** Explore our protocol overview to start building the future of DomainFi today.

---

## Technical Architecture

### Core Components

1. **Domain Tokenization Layer**
   - Smart contracts for domain representation
   - ICANN compliance mechanisms
   - Multi-chain support infrastructure

2. **State Synchronization Engine**
   - Bi-directional sync between blockchain and DNS
   - Real-time state management
   - Conflict resolution protocols

3. **Permission Management System**
   - Composable rights framework
   - Granular permission controls
   - Token-based permission representation

4. **Developer Tooling**
   - APIs and SDKs
   - Smart contract libraries
   - Subgraph integration
   - Cross-chain development tools

### Supported Use Cases

- **Domain Trading**: Instant settlement secondary markets
- **Fractional Ownership**: Split domain rights among multiple parties
- **Domain Lending**: Use domains as collateral for loans
- **Domain Leasing**: Automated rental and leasing systems
- **Yield Generation**: On-chain domain parking with yield
- **Permission Trading**: Trade specific domain rights and permissions

---

## Protocol Overview

### DomainFi Innovation Steps

The Doma Protocol revolutionizes the domain landscape through a structured approach:

{% stepper %}
{% step %}
**Trusted Domain Tokenization**

* Provides a secure onramp for any Registrar or Registry to tokenize domains onto the blockchain
* Maintains full compliance with ICANN regulations
* Ensures seamless integration with existing domain infrastructure
{% endstep %}

{% step %}
**State Synchronization**

* Implements bi-directional synchronization between on-chain assets and ICANN registries
* Maintains consistent domain metadata and state across web2 and web3 environments
* Provides real-time updates for domain state changes
{% endstep %}

{% step %}
**Composable Domain Rights**

* Enables splitting domains into synthetic tokens representing specific rights and permissions
* Facilitates granular control over domain management capabilities
* Supports innovative financial instruments based on domain rights
{% endstep %}

{% step %}
**DomainFi Application Infrastructure**

The protocol provides comprehensive APIs and smart contracts enabling developers to build innovative applications such as:

* Instant-settlement secondary marketplaces
* Fractional domain ownership structures
* Domain-collateralized lending platforms
* Automated domain rental and leasing systems
* On-chain domain parking yield generation
{% endstep %}
{% endstepper %}

### Stakeholder Benefits Overview

#### **For Registrars and Registries**:

* **Secure Tokenization Infrastructure**: A fully compliant system for converting traditional domains into blockchain assets, with built-in ICANN requirement handling and automated compliance checks
* **Multi-Chain Integration**: Native support for major Layer1 and Layer2 blockchains, enabling registrars to offer domain tokenization across multiple popular networks without additional infrastructure
* **Enhanced Revenue Streams**: New revenue opportunities through tokenization services, domain rights tokenization, and integration with DomainFi applications
* **Automated State Management**: Streamlined handling of tokenized domains with automated synchronization between blockchain and traditional DNS infrastructure

#### **For Blockchain Ecosystems**:

* **Real-World Asset Integration**: Direct integration of the $300B+ domain market as on-chain assets, bringing significant real-world value onto blockchain networks
* **Transaction Volume Growth**: Increased network activity through DomainFi transactions, including trading, lending, and permission management
* **Cross-Chain Opportunities**: Enhanced interoperability through standardized domain asset handling across different blockchain networks
* **DomainFi Ecosystem Expansion**: New opportunities for dApps and protocols to incorporate domain-based financial products and services

#### **For Developers**:

* **Reseller APIs:** Enable domain sales through NFT marketplaces and dApps without the need for ICANN accreditation.
* **Smart Contract Libraries**: Pre-built, audited smart contracts for common domain management operations
* **Flexible Permission System**: Programmable domain primitives enabling creative applications of domain rights and permissions
* **Subgraph Integration**: GraphQL-based subgraph for efficient querying of domain metadata and transaction history
* **Cross-Chain Development Tools**: Infrastructure for building applications that work seamlessly across multiple blockchain networks

#### **For Domain Holders**:

* **Financial Utility**: Multiple options for leveraging domain value, including fractional ownership, collateralized lending, and yield generation
* **Enhanced Liquidity**: Instant access to secondary markets without traditional escrow services or lengthy transfer processes
* **Granular Permission Control**: Ability to split domain rights into specific permissions for different use cases while maintaining overall ownership
* **Web3 Integration**: Seamless integration with web3 applications, including use as digital identity and wallet resolution
* **Revenue Generation**: Multiple paths for generating revenue from domain assets through parking, leasing, and permission trading

> Ready to unlock the full potential of domains? Explore our [protocol overview](readme/protocol-overview) to start building the future of DomainFi today.

---

## Domain Infrastructure 101

### Domains

A domain (or domain name) is a human-readable address traditionally used to access websites on the internet. However, with the rise of blockchain and web3, domains can also be used as human-readable identifiers for crypto wallet addresses without users having to memorize a complex string of alphanumerics.

**Example:**
* Domain Name: example.com
* Resolves to IP Address: 192.0.2.1
* Resolves to wallet address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e

**Structure of a Domain Name:**
* **Top-Level Domain (TLD)**: The extension at the end (e.g., .com, .org, .net, .gov).
* **Second-Level Domain (SLD)**: The main part of the domain (e.g., example in example.com).
* **Subdomain (Optional)**: A prefix added before the main domain (e.g., blog.example.com).

Domains are purchased and registered through an ICANN-accredited registrar or website using reseller APIs provided by an ICANN-accredited registrar.

Domains can be registered for 1 to 10 years at a time (with the exception of some ccTLDs such as .uk, .de, .ca which have different maximum registration periods). Domains can continue to be renewed indefinitely as long as registration fees are paid.

Registrars are required to collect contact details of the domain registrant to satisfy ICANN regulations. Contact info typically includes PII such as Full Name, Email Address, Phone Number and Mailing address. Most registrars offer free privacy protection so this contact information is redacted in public records such as WHOIS and RDAP.

### Registrants

A registrant is the legal owner of a domain name. This can be an individual, business, or organization that registers and holds the rights to a domain.

**Registrant Responsibilities include:**
* **Maintaining Ownership**: The registrant must ensure the domain is renewed on time.
* **Updating Contact Information**: Keeping registrant details accurate to avoid suspension.
* **Managing Domain Settings**: Configuring DNS, email, website settings, and wallet mappings.
* **Transferring or Selling the Domain**: The registrant has the right to transfer the domain to another owner or registrar.

### Registrars

A registrar is a company accredited to sell, register, and manage domain names on behalf of individuals and businesses. Registrars act as intermediaries between registrants (domain owners) and registries (organizations that manage TLDs like .com or .org).

**Role of a Registrar:**
* **Domain Registration**: Allows users to search, purchase, and register domain names.
* **DNS Management**: Provides tools to manage domain settings (e.g., pointing a domain to a website).
* **WHOIS & Privacy Protection**: Maintains registrant details and offers privacy protection services.
* **Renewals & Transfers**: Manages domain renewals, transfers between registrars, and expiration reminders.

### Registries

A registry is the organization responsible for managing and maintaining a Top-Level Domain (TLD), such as .com, .org, or country-code TLDs like .uk or .ca.

**Role of a Registry:**
* Maintains the official database of all registered domains under its TLD.
* Sets policies and pricing for domain registrations.
* Provides the infrastructure for domain name resolution (translating domain names to IP addresses).
* Works with registrars (like GoDaddy, Namecheap) to sell domains, but does not sell directly to consumers in most cases.

---

## Domain NFT Marketplace

### Overview

The Doma Protocol enables the creation of domain marketplaces based on NFTs, revolutionizing how domains are traded and managed. This approach combines the traditional domain infrastructure with blockchain technology to create a more efficient, transparent, and programmable domain trading ecosystem.

### Key Benefits of Domain NFT Marketplaces

**Instant Settlement**
- No more waiting for domain transfers or escrow services
- Immediate ownership transfer upon NFT purchase
- Automated domain management through smart contracts

**Enhanced Liquidity**
- Fractional ownership of premium domains
- Secondary market trading without traditional barriers
- Global accessibility 24/7

**Transparent Pricing**
- Public auction mechanisms
- Real-time market data and analytics
- Eliminates opaque pricing in traditional domain sales

**Programmable Features**
- Automated royalty distribution to original owners
- Built-in revenue sharing mechanisms
- Customizable trading rules and restrictions

### Technical Implementation

#### Smart Contract Architecture

```solidity
// Domain NFT Contract Structure
contract DomainNFT {
    struct Domain {
        string name;
        string tld;
        uint256 registrationDate;
        uint256 expiryDate;
        address owner;
        string ipfsMetadata;
        bool isActive;
    }
    
    mapping(uint256 => Domain) public domains;
    mapping(string => uint256) public domainToTokenId;
}
```

#### Domain Tokenization Process

1. **Domain Verification**: Verify domain ownership through ICANN-compliant processes
2. **Metadata Storage**: Store domain metadata on IPFS for decentralization
3. **NFT Minting**: Create unique NFT representing domain ownership
4. **Registry Integration**: Sync with traditional DNS infrastructure
5. **Marketplace Listing**: Enable trading on decentralized marketplaces

#### Marketplace Features

**Auction System**
- Time-based auctions for premium domains
- Reserve price mechanisms
- Automatic settlement upon auction completion

**Fixed Price Sales**
- Direct purchase options
- Bulk domain packages
- Negotiation capabilities through smart contracts

**Fractional Ownership**
- Split domain ownership into multiple tokens
- Revenue sharing among fractional owners
- Voting rights for domain management decisions

### Integration with Traditional Infrastructure

#### ICANN Compliance
- Maintains full compliance with ICANN regulations
- Automated WHOIS updates through smart contracts
- Privacy protection integration

#### DNS Synchronization
- Real-time DNS record updates
- Automated A/AAAA record management
- Subdomain creation and management

#### Registrar Partnerships
- API integration with existing registrars
- Automated domain transfers
- Bulk domain management capabilities

### Use Cases

#### For Domain Investors
- **Portfolio Management**: Manage multiple domains through a single interface
- **Automated Trading**: Set up automated buy/sell orders
- **Revenue Generation**: Earn from domain parking and leasing

#### For Businesses
- **Brand Protection**: Secure relevant domains for brand protection
- **Instant Acquisition**: Quickly acquire domains for new projects
- **Cost Optimization**: Reduce domain acquisition costs through efficient markets

#### For Developers
- **API Access**: Integrate domain marketplace functionality into applications
- **Custom Marketplaces**: Build specialized domain trading platforms
- **Analytics**: Access comprehensive domain market data

### Security Considerations

#### Smart Contract Security
- Comprehensive auditing of all smart contracts
- Multi-signature wallet support for high-value domains
- Emergency pause mechanisms for critical issues

#### Domain Security
- DNSSEC integration for enhanced security
- Automated security monitoring
- Insurance mechanisms for domain protection

#### Regulatory Compliance
- KYC/AML integration for regulatory compliance
- Tax reporting automation
- Legal framework adherence

---

## Doma Multi-Chain Subgraph

The Doma Subgraph provides consolidated data about names tokenized on the Doma Protocol. This data includes information about names, name tokens, and associated activities. It also includes aggregated marketplace offers and listing information.

### Endpoints

* **Testnet**: [https://api-testnet.doma.xyz/graphql](https://api-testnet.doma.xyz/graphql)
* **Mainnet**: Coming soon...

### Queries

#### `names`

Get paginated list of tokenized names, with optional filters and sorting.

| Argument           | Type                                                   | Description                                          |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------- |
| `skip`             | `Int`                                                  | Number of records to skip for pagination.            |
| `take`             | `Int`                                                  | Number of records to return per page (max 100).      |
| `ownedBy`          | `[AddressCAIP10!]`                                     | Filter by owner addresses (CAIP-10 format).          |
| `claimStatus`      | [`NamesQueryClaimStatus`](#type-namesqueryclaimstatus) | Filter by claim status (CLAIMED, UNCLAIMED, or ALL). |
| `name`             | `String`                                               | Filter by name (domain).                             |
| `networkIds`       | `[String!]`                                            | Filter by network IDs (CAIP-2 format).               |
| `registrarIanaIds` | `[Int!]`                                               | Filter by registrar IANA IDs.                        |
| `tlds`             | `[String!]`                                            | Filter by TLDs.                                      |
| `sortOrder`        | [`SortOrderType`](#type-sortordertype)                 | Sort order for names (DESC or ASC). Default is DESC. |

**Returns:** [`PaginatedNamesResponse!`](#type-paginatednamesresponse)

#### `name`

Get information about a specific tokenized name.

| Argument | Type      | Description                |
| -------- | --------- | -------------------------- |
| `name`   | `String!` | Name to fetch information. |

**Returns:** [`NameModel!`](#type-namemodel)

#### `tokens`

Get paginated list of tokens, with optional filters and sorting.

| Argument | Type      | Description                                     |
| -------- | --------- | ----------------------------------------------- |
| `skip`   | `Int`     | Number of records to skip for pagination.       |
| `take`   | `Int`     | Number of records to return per page (max 100). |
| `name`   | `String!` | Name (domain) to query tokens for.              |

**Returns:** [`PaginatedTokensResponse!`](#type-paginatedtokensresponse)

#### `token`

Get information about a specific token by its ID.

| Argument  | Type      | Description                    |
| --------- | --------- | ------------------------------ |
| `tokenId` | `String!` | Token id to fetch information. |

**Returns:** [`TokenModel!`](#type-tokenmodel)

#### `command`

Get information about a specific command by its correlation ID. Useful to track status of client-initiated operations (e.g. bridging a name).

| Argument        | Type      | Description                                          |
| --------------- | --------- | ---------------------------------------------------- |
| `correlationId` | `String!` | Command correlation (relay) id to fetch information. |

**Returns:** [`CommandModel!`](#type-commandmodel)

#### `nameActivities`

Get paginated list of activities related to a specific name.

| Argument    | Type                                         | Description                                               |
| ----------- | -------------------------------------------- | --------------------------------------------------------- |
| `name`      | `String!`                                    | Name (domain) to query activities for.                    |
| `skip`      | `Float`                                      | Number of records to skip for pagination.                 |
| `take`      | `Float`                                      | Number of records to return per page (max 100).           |
| `type`      | [`NameActivityType`](#type-nameactivitytype) | Filter by activity type.                                  |
| `sortOrder` | [`SortOrderType`](#type-sortordertype)       | Sort order for activities (DESC or ASC). Default is DESC. |

**Returns:** [`PaginatedNameActivitiesResponse!`](#type-paginatednameactivitiesresponse)

#### `tokenActivities`

Get paginated list of activities related to a specific token.

| Argument    | Type                                           | Description                                               |
| ----------- | ---------------------------------------------- | --------------------------------------------------------- |
| `tokenId`   | `String!`                                      | Token ID to query activities for.                         |
| `skip`      | `Float`                                        | Number of records to skip for pagination.                 |
| `take`      | `Float`                                        | Number of records to return per page (max 100).           |
| `type`      | [`TokenActivityType`](#type-tokenactivitytype) | Filter by activity type.                                  |
| `sortOrder` | [`SortOrderType`](#type-sortordertype)         | Sort order for activities (DESC or ASC). Default is DESC. |

**Returns:** [`PaginatedTokenActivitiesResponse!`](#type-paginatedtokenactivitiesresponse)

#### `listings`

Get paginated list of "Buy Now" secondary sale listings for tokenized names, with optional filters.

| Argument           | Type        | Description                                     |
| ------------------ | ----------- | ----------------------------------------------- |
| `skip`             | `Float`     | Number of records to skip for pagination.       |
| `take`             | `Float`     | Number of records to return per page (max 100). |
| `tlds`             | `[String!]` | Filter by TLDs.                                 |
| `createdSince`     | `DateTime`  | Filter listings created since this date.        |
| `sld`              | `String`    | Second-level domain (SLD) name.                 |
| `networkIds`       | `[String!]` | Filter by network IDs (CAIP-2 format).          |
| `registrarIanaIds` | `[Int!]`    | Filter by registrar IANA IDs.                   |

**Returns:** [`PaginatedNameListingsResponse!`](#type-paginatednamelistingsresponse)

#### `offers`

Get paginated list of offers for tokenized names, with optional filters.

| Argument    | Type                                   | Description                                           |
| ----------- | -------------------------------------- | ----------------------------------------------------- |
| `tokenId`   | `String`                               | Token ID to query offers for.                         |
| `offeredBy` | `[AddressCAIP10!]`                     | Filter by offerer addresses (CAIP-10 format).         |
| `skip`      | `Float`                                | Number of records to skip for pagination.             |
| `take`      | `Float`                                | Number of records to return per page (max 100).       |
| `status`    | [`OfferStatus`](#type-offerstatus)     | Filter by offer status (ACTIVE, EXPIRED, All).        |
| `sortOrder` | [`SortOrderType`](#type-sortordertype) | Sort order for offers (DESC or ASC). Default is DESC. |

**Returns:** [`PaginatedNameOffersResponse!`](#type-paginatednameoffersresponse)

#### `nameStatistics`

Get statistics for a specific tokenized name.

| Argument  | Type      | Description                                                                 |
| --------- | --------- | --------------------------------------------------------------------------- |
| `tokenId` | `String!` | Name Ownership Token ID that identifies a name to retrieve statistics from. |

**Returns:** [`NameStatisticsModel!`](#type-namestatisticsmodel)

### Mutations

#### `generateMetadata`

Generate metadata for a list of tokens based on their attributes. Useful to pre-create metadata before generating synthetic tokens.

| Argument | Type                                                                                   | Description                                        |
| -------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `tokens` | [`[TokenMetadataGenerationRequestInput!]!`](#type-tokenmetadatagenerationrequestinput) | List of synthetic tokens to generate metadata for. |

**Returns:** `[String!]!`

#### `initiateEmailVerification`

Initiate email verification process for a given email address. Used to verify contact information before claiming a tokenized name.

| Argument | Type      | Description                                   |
| -------- | --------- | --------------------------------------------- |
| `email`  | `String!` | Email address to initiate email verification. |

**Returns:** `Boolean!`

#### `completeEmailVerification`

Complete email verification process by providing the verification code sent to the email address. Returns a proof of email verification that can be used to upload registrant contacts.

| Argument | Type      | Description                                   |
| -------- | --------- | --------------------------------------------- |
| `code`   | `String!` | Email verification code.                      |
| `email`  | `String!` | Email that was used to initiate verification. |

**Returns:** `String!`

#### `uploadRegistrantContacts`

Upload registrant contact information along with proof of email verification. This is used to claim a tokenized name and associate it with the provided contact details.

| Argument                 | Type                                                      | Description                                                                            |
| ------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `contact`                | [`RegistrantContactInput!`](#type-registrantcontactinput) | Registrant contact information.                                                        |
| `emailVerificationProof` | `String!`                                                 | Proof of email verification, obtained after completing the email verification process. |
| `networkId`              | `String!`                                                 | Network ID (CAIP-2 format) where the name is being claimed.                            |
| `registrarIanaId`        | `Int!`                                                    | IANA ID of the registrar where the name is being claimed.                              |

**Returns:** [`ProofOfContactsVoucherResponseModel!`](#type-proofofcontactsvoucherresponsemodel)

#### `uploadVerifiedRegistrantContacts`

Upload verified registrant contact information without email verification proof. This is used to claim a tokenized name with pre-verified email. Requires additional VERIFIED_CONTACTS_UPLOAD permission to use.

| Argument          | Type                                                      | Description                                                                |
| ----------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `contact`         | [`RegistrantContactInput!`](#type-registrantcontactinput) | Registrant contact information, including name, email, address, and phone. |
| `networkId`       | `String!`                                                 | Network ID (CAIP-2 format) where the name is being claimed.                |
| `registrarIanaId` | `Int!`                                                    | IANA ID of the registrar where the name is being claimed.                  |

**Returns:** [`ProofOfContactsVoucherResponseModel!`](#type-proofofcontactsvoucherresponsemodel)

### Data Models

#### Core Models

**ChainModel**
- `name`: Name of the blockchain network
- `networkId`: Network ID in CAIP-2 format

**RegistrarModel**
- `name`: Registrar name
- `ianaId`: IANA ID of the registrar
- `publicKeys`: Registrar public keys
- `websiteUrl`: Registrar website URL
- `supportEmail`: Registrar support email address

**NameModel**
- `name`: Name (domain)
- `expiresAt`: Expiration date of the name
- `tokenizedAt`: Date and time when the name was tokenized
- `eoi`: Whether the name is an expression of interest (EOI)
- `registrar`: Registrar associated with the name
- `nameservers`: List of nameservers for the name
- `dsKeys`: DNSSEC DS Keys for the name
- `transferLock`: Whether transfer lock is enabled
- `claimedBy`: Wallet address that claimed the name
- `tokens`: Tokens associated with the name
- `activities`: Activities associated with the name

**TokenModel**
- `tokenId`: Token ID
- `networkId`: Network ID in CAIP-2 format
- `ownerAddress`: Owner address in CAIP-10 format
- `type`: Type of token (OWNERSHIP or SYNTHETIC)
- `startsAt`: Start date of the token validity
- `expiresAt`: Expiration date of the token
- `activities`: List of activities for the token
- `explorerUrl`: Explorer URL for the token
- `tokenAddress`: Token contract address
- `createdAt`: Date and time when the token was created
- `chain`: Blockchain network information
- `listings`: Listings associated with the token
- `openseaCollectionSlug`: OpenSea collection slug

#### Activity Models

**Token Activities**
- `TokenMintedActivity`: Token minting events
- `TokenTransferredActivity`: Token transfer events
- `TokenListedActivity`: Token listing events
- `TokenOfferReceivedActivity`: Token offer events
- `TokenListingCancelledActivity`: Listing cancellation events
- `TokenOfferCancelledActivity`: Offer cancellation events
- `TokenPurchasedActivity`: Token purchase events

**Name Activities**
- `NameClaimedActivity`: Name claim events
- `NameRenewedActivity`: Name renewal events
- `NameDetokenizedActivity`: Name detokenization events
- `NameTokenizedActivity`: Name tokenization events

#### Marketplace Models

**ListingModel**
- `id`: Listing ID
- `externalId`: External order ID
- `price`: Listing price
- `offererAddress`: Offerer address in CAIP-10 format
- `orderbook`: Orderbook type (DOMA or OPENSEA)
- `currency`: Currency used for the listing
- `expiresAt`: Expiration date of the listing
- `createdAt`: Date and time when the listing was created
- `updatedAt`: Date and time when the listing was last updated

**OfferModel**
- `id`: Offer ID
- `externalId`: External offer ID
- `price`: Offer price
- `offererAddress`: Offerer address in CAIP-10 format
- `orderbook`: Orderbook type
- `currency`: Currency used for the offer
- `expiresAt`: Expiration date of the offer
- `createdAt`: Date and time when the offer was created

#### Pagination Models

All paginated responses include:
- `items`: List of items for the current page
- `totalCount`: Total number of items matching the query
- `pageSize`: Number of items per page
- `currentPage`: Current page number (1-based)
- `totalPages`: Total number of pages available
- `hasPreviousPage`: Indicates if there is a previous page
- `hasNextPage`: Indicates if there is a next page

### Enums

**CommandType**
- `TOKENIZE`: Tokenize a domain name
- `APPROVE_TOKENIZATION`: Approve a tokenization request
- `REJECT_TOKENIZATION`: Reject a tokenization request
- `APPROVE_CLAIM_REQUEST`: Approve a claim request for a domain
- `REJECT_CLAIM_REQUEST`: Reject a claim request for a domain
- `RENEW`: Renew a domain name
- `UPDATE`: Update domain (both nameservers and DNSSEC DS keys)
- `UPDATE_NAMESERVERS`: Update nameservers for a domain
- `UPDATE_DS_KEYS`: Update DNSSEC DS keys for a domain
- `DETOKENIZE`: Detokenize a domain name
- `DELETE`: Delete a domain or token (only for expired domains)
- `COMPLIANCE_LOCK_STATUS_CHANGE`: Change compliance lock status
- `COMPLIANCE_DETOKENIZE`: Detokenize a domain due to compliance reasons
- `UPDATE_METADATA`: Update metadata for a token
- `SET_REVERSE_MAPPING`: Set reverse mapping for an address
- `VOUCHER_PAYMENT`: Process a voucher payment
- `REQUEST_TOKENIZATION`: User-initiated request to tokenize a domain
- `TRANSFER_HOOK`: Transfer hook event
- `REQUEST_CLAIM`: User-initiated request to claim a domain
- `REQUEST_DETOKENIZATION`: User-initiated request to detokenize a domain
- `REQUEST_BRIDGE`: User-initiated request to bridge a token
- `UNKNOWN`: Unknown or unsupported command type

**CommandStatus**
- `PENDING`: Command is pending
- `FINALIZING`: Command is finalizing
- `SUCCEEDED`: Command has succeeded
- `FAILED`: Command has failed
- `PARTIALLY_SUCCEEDED`: Command partially succeeded

**TokenType**
- `OWNERSHIP`: Ownership token
- `SYNTHETIC`: Synthetic token (Not supported yet)

**TokenActivityType**
- `MINTED`: Token was minted
- `TRANSFERRED`: Token was transferred
- `LISTED`: Token was listed for sale in the marketplace
- `OFFER_RECEIVED`: An offer was received for the token
- `LISTING_CANCELLED`: A listing for the token was cancelled
- `OFFER_CANCELLED`: An offer for the token was cancelled
- `PURCHASED`: Token was purchased in the marketplace

**NameActivityType**
- `TOKENIZED`: Name was tokenized
- `CLAIMED`: Name was claimed by a wallet address
- `RENEWED`: Name was renewed
- `DETOKENIZED`: Name was detokenized

**OrderbookType**
- `DOMA`: Doma orderbook (primary)
- `OPENSEA`: OpenSea orderbook

**SortOrderType**
- `DESC`: Descending order
- `ASC`: Ascending order

### Input Types

**TokenMetadataGenerationRequestInput**
- `name`: Name (domain) for which to generate metadata
- `networkId`: Network ID in CAIP-2 format
- `type`: Type of token to generate metadata for
- `startsAt`: Optional start date for the token validity period
- `expiresAt`: Expiration date for the token

**RegistrantContactInput**
- `name`: Full name of the registrant
- `organization`: Organization name of the registrant (optional)
- `email`: Email address of the registrant
- `phone`: Phone number of the registrant
- `fax`: Fax number of the registrant (optional)
- `street`: Street address of the registrant
- `city`: City of the registrant
- `state`: State or province of the registrant
- `postalCode`: Postal code of the registrant
- `countryCode`: Country code of the registrant (ISO 3166-1 alpha-2)

---

## Doma Smart Contracts API

### Protocol Overview

The Doma Protocol consists of several smart contracts that work together to enable domain tokenization and management across multiple blockchain networks.

**Core Contract Architecture:**

* **Doma Record:** Main contract that holds information about a domain and issues Name Tokens. Serves as a coordination point for cross-chain operations. Exposes a Registrar-facing API that provides a full suite of operations to manage domains.
* **Doma Forwarder:** [EIP-2771](https://eips.ethereum.org/EIPS/eip-2771) Trusted Forwarder, that relays meta transactions from a Registrar to Doma Record contract. Optional, since Registrars can submit transactions directly to the Doma Record contract.
* **Doma Gateway:** [ERC-7786](https://erc7786.org/) Gateway Source, deployed on each supported chain. This contract allows sending messages to contracts on other chains.
* **Proxy Doma Record:** Supporting contract, facilitates communication between users and contracts on each tokenization chain with the Doma Record contract. Used to abstract Doma Chain from end-users and provides core domain-management operations (like claiming and bridging).
* **Ownership Token:** Regular [ERC-721](https://eips.ethereum.org/EIPS/eip-721) NFT contract (or equivalent on non-EVM chains), with some modifications to support expiration and compliance operations.

### EVM-Compatible Chains

#### Proxy Doma Record Contracts

Methods on this contract require protocol fees to be paid by a user. Fees are denominated in USDC, but are paid in native gas coin.

##### Request Tokenization

This method requires a voucher signed by a sponsoring Registrar using [EIP-712](https://eips.ethereum.org/EIPS/eip-712) standard. This voucher is obtained when user initiates a tokenization on a Registrar.

```solidity
/**
 * @notice Request tokenization of given names.
 * Relays message to Doma Record contract on Doma Chain, for Registrar to approve or reject.
 * @param voucher Tokenization voucher. Used to pre-clear tokenization, before final approval.
 * @param signature Signature of the voucher, signed by a Registrar.
 */
function requestTokenization(
    TokenizationVoucher calldata voucher,
    bytes calldata signature
) public payable;

/**
 * @notice Tokenization voucher, obtained from a Registrar.
 * @param names List of names to tokenize.
 * @param nonce Unique nonce to prevent voucher reuse (replay attacks).
 * @param expiresAt Expiration date of the voucher (UNIX seconds).
 * @param ownerAddress Minted Ownership Token owner address. Must be equal to transaction sender.
 */
struct TokenizationVoucher {
    IDomaRecord.NameInfo[] names;
    uint256 nonce;
    uint256 expiresAt;
    address ownerAddress;
}
```

##### Claim Domain Ownership

This method requires a proof of provided contacts voucher signed by either Doma PII Storage, or by Registrar. Can only be called on a chain with a valid Ownership token. Will work even if domain is in expired state, to be able to claim and renew.

```solidity
/**
* @notice Claim ownership of a given Domain, using Ownership token.
* Relays message to Doma Record contract on Doma Chain.
* @param tokenId Id of an Ownership Token.
* @param isSynthetic Whether it's a regular or permissioned (synthetic) ownership token.
* @param proofOfContactsVoucher Voucher that proves Registrant contact information has been verified and stored in an off-chain storage.
* @param signature Signature of the voucher, signed by an off-chain storage (either Registrar or Doma-provided storage).
*/
function claimOwnership(
   uint256 tokenId,
   bool isSynthetic,
   ProofOfContactsVoucher calldata proofOfContactsVoucher,
   bytes calldata signature
) public payable;

/**
* @notice Proof of Contacts voucher, obtained from a Registrar or Doma-provided storage.
* @param registrantHandle Handle of a registrant in an off-chain storage.
* @param proofSource Source of the proof-of-contacts voucher. 1 - Registrar, 2 - Doma.
* @param nonce Unique nonce to prevent voucher reuse (replay attacks).
* @param expiresAt Expiration date of the voucher (UNIX seconds).
*/
struct ProofOfContactsVoucher {
   uint256 registrantHandle;
   IDomaRecord.ProofOfContactsSource proofSource;
   uint256 nonce;
   uint256 expiresAt;
}
```

##### Bridge

Move token to another supported chain, can only be called on a source chain.

```solidity
/**
* @notice Move token to another chain.
* Relays message to Doma Record contract on Doma Chain.
* @param tokenId Id of an Ownership Token.
* @param isSynthetic Whether it's a regular or permissioned (synthetic) ownership token.
* @param targetChainId CAIP-2 Chain ID of the target chain.
* @param targetOwnerAddress Wallet address on a target chain.
*/
function bridge(
   uint256 tokenId,
   bool isSynthetic,
   string calldata targetChainId,
   string calldata targetOwnerAddress
) public payable;
```

##### Detokenize

Request domain detokenization. Will only work with an Ownership token, and requires domain ownership to be claimed. Method does not require fees. Synthetic Ownership Token could be used only if there's no other Synthetic Token in existence.

```solidity
/**
* @dev Request detokenization of a Domain, using Ownership token.
* Relays message to Doma Record contract on Doma Chain, for validation and further processing.
* @param tokenId Id of an Ownership Token.
* @param isSynthetic Whether it's a regular or permissioned (synthetic) ownership token.
*/
function requestDetokenization(uint256 tokenId, bool isSynthetic) public;
```

#### Ownership Token Contract

Ownership token contract is a regular ERC-721 token with some additional functionality and restrictions:

* Additional `expirationOf` function is provided to check expiration date. After expiration, token will become non-transferrable, and could either be renewed or deleted by a registrar.
* Additional `registrarOf` function is provided to get owning registrar IANA id.
* Token could be burned by a Registrar, if conditions are met (domain is claimed by a current token owner).
* Registrar retains the right to burn token even if conditions are not met (domain is not claimed by a current token owner), for compliance reason (e.g. in case of lost UDRP dispute over the domain).
* Registrar can lock token transfer for compliance reasons (e.g. in case of UDPR dispute is in progress).
* [ERC-2981](https://eips.ethereum.org/EIPS/eip-2981) standard is used to configure royalties information.

##### Get Expiration Date

```solidity
/**
* @notice Returns expiration date for a token. After this date, token transfer will be blocked.
* @param id Token ID.
* @return uint256 Unix timestamp in seconds.
*/
function expirationOf(uint256 id) external view returns (uint256) {
   return _expirations[id];
}
```

##### Get Registrar IANA id

```solidity
/**
* @notice Returns registrar IANA ID for a token.
* @param id Token ID.
* @return uint256 Registrar IANA ID.
*/
function registrarOf(uint256 id) external view returns (uint256) {
   return _registrarIanaIds[id];
}
```

##### Get Transfer Lock Status

```solidity
/**
* @notice Returns transfer lock status for a token. If 'true', token cannot be transferred.
* @param id Token ID.
*/
function lockStatusOf(uint256 id) external view returns (bool) {
   return _transferLocks[id];
}
```

##### Non-Standard Events

In addition to standard ERC-721 events, new events are emitted to track tokens lifecycle.

```solidity
/**
* @notice Emitted when an ownership token is minted.
* Emitted together with standard ERC-721 Transfer event, but contains additional information.
* @param tokenId The ID of the ownership token.
* @param registrarIanaId The IANA ID of a sponsoring registrar.
* @param to The address that received the ownership token.
* @param sld The second-level domain of the name. E.g. "example" in "example.com".
* @param tld The top-level domain of the name. E.g. "com" in "example.com".
* @param expiresAt The expiration date of the name (UNIX seconds).
* @param correlationId Correlation id associated with a mint event. Used by registrars to track on-chain operations.
*/
event OwnershipTokenMinted(
   uint256 indexed tokenId,
   uint256 registrarIanaId,
   address to,
   string sld,
   string tld,
   uint256 expiresAt,
   string correlationId
);

/**
* @notice Emitted when name token is renewed.
* @param tokenId The ID of the name token.
* @param expiresAt The expiration date of the name token (UNIX seconds).
* @param correlationId Correlation id associated with a renewal event. Used by registrars to track on-chain operations.
*/
event NameTokenRenewed(uint256 indexed tokenId, uint256 expiresAt, string correlationId);

/**
* @notice Emitted when name token is burned.
* Similar to ERC721 `Transfer` event with zero `to`, but with an additional correlation id included.
* @param tokenId The ID of the name token.
* @param owner Owner address at the time of burning.
* @param correlationId Correlation id associated with a burn event. Used by registrars to track on-chain operations.
*/
event NameTokenBurned(uint256 indexed tokenId, address owner, string correlationId);

/**
* @notice Emitted when name token is locked or unlocked.
* @param tokenId The ID of the name token.
* @param isTransferLocked Whether token transfer is locked or not.
* @param correlationId Correlation id associated with a lock status change event. Used by registrars to track on-chain operations.
*/
event LockStatusChanged(uint256 indexed tokenId, bool isTransferLocked, string correlationId);

/**
* @notice Emitted when metadata is updated for a token.
* Can happen when token is renewed.
* Follows IERC4906 Metadata Update Extension.
*/
event MetadataUpdate(uint256 tokenId);
```

### Solana

On Solana, Doma Protocol integrates with Solana Records Service (SRS) program to issue and tokenize domains.

**Solana Integration Architecture:**

* Doma Protocol owns a Permissioned Class on the SRS program, which is used to issue and manage tokenized domains.
* [Token 22](https://spl.solana.com/token-2022) is used as an underlying NFT standard.
* SRS Program retains full control over minted NFTs (since it can sign on behalf of mint account, which has full authority delegation), so compliance operations are performed through SRS, using Proxy Doma Record PDA as a Class Authority to authorize operations.
* Doma Gateway exists as part of Proxy Doma Record Program.

---

## Doma Marketplace

Doma Marketplace is provided to simplify trading of tokenized names on-chain. It has following components:

* **Orderbook Rest API** for on-chain trading using [SeaPort protocol](https://github.com/ProjectOpenSea/seaport).
* **Poll API** for marketplace-related events.
* **Marketplace-related data** (listings, offers) in [Doma Subgraph](#doma-multi-chain-subgraph).
* **Syndicated listings and offers** from external marketplaces (OpenSea).
* **`@doma-protocol/orderbook-sdk`** to simplify integrations of Doma Marketplace.

### How to Use Orderbook API

* It's highly recommended to use [`@doma-protocol/orderbook-sdk`](https://www.npmjs.com/package/@doma-protocol/orderbook-sdk) to interact with Orderbook API, since it abstracts underlying complexities of working with Seaport Protocol, granting on-chain approvals, and computing fees.
* When not using `@doma-protocol/orderbook-sdk`, [`seaport-js`](https://github.com/ProjectOpenSea/seaport-js) library is recommended (which is used by SDK under the hood).

### Marketplace Fees

Doma Orderbook API enforces inclusion of following fees into consideration items:

* **Doma Protocol Fee**
  * Receiver Address: `0x2E7cC63800e77BB8c662c45Ef33D1cCc23861532`
  * Percentage: 0.5%
* **Name Token Royalties**. Can be fetched by calling [`royaltyInfo`](https://eips.ethereum.org/EIPS/eip-2981) method on an [Ownership Token Smart contract](#ownership-token-contract).
* **OpenSea Fee** (only when creating a listing/offer on OpenSea orderbook). Collection fee value can be fetched using [Get Collection API](https://docs.opensea.io/reference/get_collection) (required fee values from response should be included).
  * Since OpenSea API will also include royalty items, they should be filtered out to prevent double inclusion into considerations.

To simplify fees calculation, Fee Information API is provided.

> **Note**: When using `@doma-protocol/orderbook-sdk`, fees are calculated automatically.

### Supported Currencies

Currently, following currencies are supported on Doma Marketplace:

**Mainnets:**
* _TBD_

**Testnets:**
* **Sepolia:**
  * Gas Token (ETH)
  * USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
* **Base Sepolia:**
  * Gas Token (ETH)
  * USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
* **Doma:**
  * Gas Token (ETH)
  * USDC: `0x2f3463756C59387D6Cd55b034100caf7ECfc757b`

Supported currencies can be fetched programmatically using Currencies API.

> **Note**: `@doma-protocol/orderbook-sdk` provides a helper `getSupportedCurrencies` method, which returns list of all supported currencies.

### Making ETH Offers

Since SeaPort doesn't support making offers in ETH (as it's a native gas token, not an ERC-20), ETH should be wrapped to wETH using a wrapper contract.

**Supported wETH contract addresses:**

**Mainnets:**
* _TBD_

**Testnets:**
* Sepolia: `0x7b79995e5f793a07bc00c21412e50ecae098e7f9`
* Base Sepolia: `0x4200000000000000000000000000000000000006`
* Doma Testnet: `0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac`

> **Note**: When using `@doma-protocol/orderbook-sdk`, wrapping is performed automatically.

### Seaport Protocol

Seaport is a marketplace protocol for safely and efficiently buying and selling NFTs. Each listing contains an arbitrary number of items that the offerer is willing to give (the "offer") along with an arbitrary number of items that must be received along with their respective receivers (the "consideration").

**Key Features:**
* **Arbitrary Offers**: Support for complex multi-item offers
* **Consideration Items**: Flexible receiving requirements
* **Safety**: Built-in security mechanisms for NFT trading
* **Efficiency**: Optimized for gas-efficient transactions

**Repository Structure:**
* **seaport-core**: Core protocol implementation
* **seaport-types**: TypeScript type definitions
* **seaport-sol**: Solidity smart contracts

---

*This documentation is based on the Doma Protocol specifications and is designed to help developers, registrars, and domain holders understand and leverage the full potential of DomainFi.*
