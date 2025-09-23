// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
// Counters is deprecated in OZ 5.x, using manual counter instead

/**
 * @title TaghausMarketplace
 * @dev Comprehensive marketplace contract following OpenSea SeaPort standards
 * Supports domain NFT trading with full marketplace functionality
 */
contract TaghausMarketplace is ReentrancyGuard, Ownable, Pausable {

    // ============ STRUCTS ============
    
    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        address currency; // Token address (address(0) for ETH)
        bool sold;
        bool active;
        uint256 createdAt;
        uint256 expiresAt;
    }

    struct MarketSale {
        uint256 saleId;
        uint256 itemId;
        address buyer;
        address seller;
        uint256 price;
        address currency;
        uint256 timestamp;
        bool completed;
    }

    struct TokenInfo {
        uint256 tokenId;
        string name;
        string symbol;
        string metadataURI;
        address creator;
        uint256 totalSupply;
        bool exists;
    }

    // ============ STATE VARIABLES ============
    
    uint256 private _itemIds;
    uint256 private _saleIds;
    uint256 private _tokenIds;

    // Mappings
    mapping(uint256 => MarketItem) public marketItems;
    mapping(uint256 => MarketSale) public marketSales;
    mapping(uint256 => TokenInfo) public tokens;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256[]) public userMarketItems;
    mapping(address => uint256[]) public userSales;
    mapping(address => bool) public supportedCurrencies;
    mapping(address => bool) public supportedNFTContracts;

    // Platform fees (in basis points, 100 = 1%)
    uint256 public platformFee = 250; // 2.5%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Fee recipient
    address public feeRecipient;
    
    // Minimum listing duration
    uint256 public constant MIN_LISTING_DURATION = 1 hours;
    uint256 public constant MAX_LISTING_DURATION = 365 days;

    // ============ EVENTS ============
    
    event TokenCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string symbol,
        string metadataURI
    );

    event TokenBurned(
        uint256 indexed tokenId,
        address indexed owner
    );

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price,
        address currency,
        uint256 expiresAt
    );

    event MarketSaleCreated(
        uint256 indexed saleId,
        uint256 indexed itemId,
        address indexed buyer,
        address seller,
        uint256 price,
        address currency
    );

    event MarketItemUpdated(
        uint256 indexed itemId,
        uint256 newPrice,
        address newCurrency
    );

    event MarketItemCancelled(
        uint256 indexed itemId
    );

    event MarketItemSold(
        uint256 indexed itemId,
        address indexed buyer,
        uint256 price
    );

    event CurrencySupportUpdated(
        address indexed currency,
        bool supported
    );

    event NFTContractSupportUpdated(
        address indexed nftContract,
        bool supported
    );

    event PlatformFeeUpdated(
        uint256 newFee
    );

    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
        
        // Support ETH by default
        supportedCurrencies[address(0)] = true;
    }

    // ============ TOKEN MANAGEMENT ============

    /**
     * @dev Create a new token (domain NFT)
     * @param name Token name
     * @param symbol Token symbol
     * @param metadataURI Metadata URI
     * @return tokenId The created token ID
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory metadataURI
    ) external returns (uint256) {
        uint256 tokenId = _tokenIds;
        _tokenIds++;

        tokens[tokenId] = TokenInfo({
            tokenId: tokenId,
            name: name,
            symbol: symbol,
            metadataURI: metadataURI,
            creator: msg.sender,
            totalSupply: 1,
            exists: true
        });

        userTokens[msg.sender].push(tokenId);

        emit TokenCreated(tokenId, msg.sender, name, symbol, metadataURI);
        
        return tokenId;
    }

    /**
     * @dev Burn a token (only by owner)
     * @param tokenId Token ID to burn
     */
    function burnToken(uint256 tokenId) external {
        require(tokens[tokenId].exists, "Token does not exist");
        require(tokens[tokenId].creator == msg.sender, "Not token owner");
        
        // Check if token is listed for sale
        for (uint256 i = 0; i < _itemIds; i++) {
            if (marketItems[i].tokenId == tokenId && marketItems[i].active) {
                require(marketItems[i].sold, "Token is listed for sale");
            }
        }

        tokens[tokenId].exists = false;
        tokens[tokenId].totalSupply = 0;

        emit TokenBurned(tokenId, msg.sender);
    }

    // ============ MARKETPLACE FUNCTIONS ============

    /**
     * @dev Create a market item (list NFT for sale)
     * @param nftContract Address of the NFT contract
     * @param tokenId Token ID to list
     * @param price Price in wei
     * @param currency Currency address (address(0) for ETH)
     * @param duration Listing duration in seconds
     * @return itemId The created market item ID
     */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address currency,
        uint256 duration
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(supportedNFTContracts[nftContract], "NFT contract not supported");
        require(supportedCurrencies[currency], "Currency not supported");
        require(price > 0, "Price must be greater than 0");
        require(duration >= MIN_LISTING_DURATION, "Duration too short");
        require(duration <= MAX_LISTING_DURATION, "Duration too long");

        // Transfer NFT to marketplace
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        uint256 itemId = _itemIds;
        _itemIds++;

        marketItems[itemId] = MarketItem({
            itemId: itemId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            owner: address(this),
            price: price,
            currency: currency,
            sold: false,
            active: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });

        userMarketItems[msg.sender].push(itemId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            price,
            currency,
            marketItems[itemId].expiresAt
        );

        return itemId;
    }

    /**
     * @dev Create a market sale (buy an NFT)
     * @param itemId Market item ID to buy
     * @return saleId The created sale ID
     */
    function createMarketSale(uint256 itemId) external payable nonReentrant whenNotPaused returns (uint256) {
        MarketItem storage item = marketItems[itemId];
        require(item.active, "Item not active");
        require(!item.sold, "Item already sold");
        require(block.timestamp <= item.expiresAt, "Listing expired");
        require(msg.sender != item.seller, "Cannot buy own item");

        uint256 saleId = _saleIds;
        _saleIds++;

        // Handle payment
        if (item.currency == address(0)) {
            // ETH payment
            require(msg.value >= item.price, "Insufficient payment");
            
            // Calculate fees
            uint256 platformFeeAmount = (item.price * platformFee) / BASIS_POINTS;
            uint256 sellerAmount = item.price - platformFeeAmount;

            // Transfer payments
            payable(feeRecipient).transfer(platformFeeAmount);
            payable(item.seller).transfer(sellerAmount);

            // Refund excess
            if (msg.value > item.price) {
                payable(msg.sender).transfer(msg.value - item.price);
            }
        } else {
            // ERC20 payment
            IERC20 currency = IERC20(item.currency);
            require(currency.balanceOf(msg.sender) >= item.price, "Insufficient balance");
            require(currency.allowance(msg.sender, address(this)) >= item.price, "Insufficient allowance");

            // Calculate fees
            uint256 platformFeeAmount = (item.price * platformFee) / BASIS_POINTS;
            uint256 sellerAmount = item.price - platformFeeAmount;

            // Transfer payments
            currency.transferFrom(msg.sender, feeRecipient, platformFeeAmount);
            currency.transferFrom(msg.sender, item.seller, sellerAmount);
        }

        // Transfer NFT to buyer
        IERC721(item.nftContract).transferFrom(address(this), msg.sender, item.tokenId);

        // Update item status
        item.sold = true;
        item.active = false;
        item.owner = msg.sender;

        // Create sale record
        marketSales[saleId] = MarketSale({
            saleId: saleId,
            itemId: itemId,
            buyer: msg.sender,
            seller: item.seller,
            price: item.price,
            currency: item.currency,
            timestamp: block.timestamp,
            completed: true
        });

        userSales[msg.sender].push(saleId);

        emit MarketSaleCreated(saleId, itemId, msg.sender, item.seller, item.price, item.currency);
        emit MarketItemSold(itemId, msg.sender, item.price);

        return saleId;
    }

    /**
     * @dev Fetch market items with pagination
     * @param offset Starting index
     * @param limit Number of items to fetch
     * @return items Array of market items
     * @return total Total number of items
     */
    function fetchMarketItems(
        uint256 offset,
        uint256 limit
    ) external view returns (MarketItem[] memory items, uint256 total) {
        total = _itemIds;
        uint256 end = offset + limit;
        if (end > total) end = total;
        
        uint256 count = end - offset;
        items = new MarketItem[](count);
        
        for (uint256 i = 0; i < count; i++) {
            items[i] = marketItems[offset + i];
        }
    }

    /**
     * @dev Fetch market items by seller
     * @param seller Seller address
     * @return items Array of market items
     */
    function fetchMarketItemsBySeller(address seller) external view returns (MarketItem[] memory items) {
        uint256[] memory itemIds = userMarketItems[seller];
        items = new MarketItem[](itemIds.length);
        
        for (uint256 i = 0; i < itemIds.length; i++) {
            items[i] = marketItems[itemIds[i]];
        }
    }

    /**
     * @dev Fetch market items by buyer
     * @param buyer Buyer address
     * @return items Array of market items bought
     */
    function fetchMarketItemsByBuyer(address buyer) external view returns (MarketItem[] memory items) {
        uint256[] memory saleIds = userSales[buyer];
        items = new MarketItem[](saleIds.length);
        
        for (uint256 i = 0; i < saleIds.length; i++) {
            MarketSale storage sale = marketSales[saleIds[i]];
            items[i] = marketItems[sale.itemId];
        }
    }

    /**
     * @dev Fetch own NFTs (tokens created by user)
     * @param user User address
     * @return tokens Array of token info
     */
    function fetchOwnNFTs(address user) external view returns (TokenInfo[] memory tokens) {
        uint256[] memory tokenIds = userTokens[user];
        tokens = new TokenInfo[](tokenIds.length);
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokens[i] = tokens[tokenIds[i]];
        }
    }

    /**
     * @dev Update market item price
     * @param itemId Market item ID
     * @param newPrice New price
     * @param newCurrency New currency address
     */
    function updateMarketItem(
        uint256 itemId,
        uint256 newPrice,
        address newCurrency
    ) external {
        MarketItem storage item = marketItems[itemId];
        require(item.seller == msg.sender, "Not the seller");
        require(item.active, "Item not active");
        require(!item.sold, "Item already sold");
        require(supportedCurrencies[newCurrency], "Currency not supported");
        require(newPrice > 0, "Price must be greater than 0");

        item.price = newPrice;
        item.currency = newCurrency;

        emit MarketItemUpdated(itemId, newPrice, newCurrency);
    }

    /**
     * @dev Cancel market item
     * @param itemId Market item ID
     */
    function cancelMarketItem(uint256 itemId) external nonReentrant {
        MarketItem storage item = marketItems[itemId];
        require(item.seller == msg.sender, "Not the seller");
        require(item.active, "Item not active");
        require(!item.sold, "Item already sold");

        item.active = false;

        // Return NFT to seller
        IERC721(item.nftContract).transferFrom(address(this), item.seller, item.tokenId);

        emit MarketItemCancelled(itemId);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Add supported currency
     * @param currency Currency address
     */
    function addSupportedCurrency(address currency) external onlyOwner {
        supportedCurrencies[currency] = true;
        emit CurrencySupportUpdated(currency, true);
    }

    /**
     * @dev Remove supported currency
     * @param currency Currency address
     */
    function removeSupportedCurrency(address currency) external onlyOwner {
        supportedCurrencies[currency] = false;
        emit CurrencySupportUpdated(currency, false);
    }

    /**
     * @dev Add supported NFT contract
     * @param nftContract NFT contract address
     */
    function addSupportedNFTContract(address nftContract) external onlyOwner {
        supportedNFTContracts[nftContract] = true;
        emit NFTContractSupportUpdated(nftContract, true);
    }

    /**
     * @dev Remove supported NFT contract
     * @param nftContract NFT contract address
     */
    function removeSupportedNFTContract(address nftContract) external onlyOwner {
        supportedNFTContracts[nftContract] = false;
        emit NFTContractSupportUpdated(nftContract, false);
    }

    /**
     * @dev Update platform fee
     * @param newFee New fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Emergency withdraw ERC20
     * @param token Token address
     */
    function emergencyWithdrawERC20(address token) external onlyOwner {
        IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get market item by ID
     * @param itemId Market item ID
     * @return Market item
     */
    function getMarketItem(uint256 itemId) external view returns (MarketItem memory) {
        return marketItems[itemId];
    }

    /**
     * @dev Get market sale by ID
     * @param saleId Market sale ID
     * @return Market sale
     */
    function getMarketSale(uint256 saleId) external view returns (MarketSale memory) {
        return marketSales[saleId];
    }

    /**
     * @dev Get token info by ID
     * @param tokenId Token ID
     * @return Token info
     */
    function getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory) {
        return tokens[tokenId];
    }

    /**
     * @dev Get total market items count
     * @return Total count
     */
    function getTotalMarketItems() external view returns (uint256) {
        return _itemIds;
    }

    /**
     * @dev Get total sales count
     * @return Total count
     */
    function getTotalSales() external view returns (uint256) {
        return _saleIds;
    }

    /**
     * @dev Get total tokens count
     * @return Total count
     */
    function getTotalTokens() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Check if currency is supported
     * @param currency Currency address
     * @return Supported status
     */
    function isCurrencySupported(address currency) external view returns (bool) {
        return supportedCurrencies[currency];
    }

    /**
     * @dev Check if NFT contract is supported
     * @param nftContract NFT contract address
     * @return Supported status
     */
    function isNFTContractSupported(address nftContract) external view returns (bool) {
        return supportedNFTContracts[nftContract];
    }
}
