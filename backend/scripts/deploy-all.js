const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying all Taghaus contracts...");

  // Deploy DomainAuction contract
  console.log("\n📦 Deploying DomainAuction contract...");
  const DomainAuction = await ethers.getContractFactory("DomainAuction");
  const domainAuction = await DomainAuction.deploy();
  await domainAuction.waitForDeployment();
  const auctionAddress = await domainAuction.getAddress();
  console.log("✅ DomainAuction deployed to:", auctionAddress);

  // Deploy TaghausMarketplace contract
  console.log("\n📦 Deploying TaghausMarketplace contract...");
  const TaghausMarketplace = await ethers.getContractFactory("TaghausMarketplace");
  const marketplace = await TaghausMarketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ TaghausMarketplace deployed to:", marketplaceAddress);

  // Deploy MockNFT contract for testing
  console.log("\n📦 Deploying MockNFT contract...");
  const MockNFT = await ethers.getContractFactory("MockNFT");
  const mockNFT = await MockNFT.deploy();
  await mockNFT.waitForDeployment();
  const mockNFTAddress = await mockNFT.getAddress();
  console.log("✅ MockNFT deployed to:", mockNFTAddress);

  console.log("\n📋 Contract details:");
  console.log("   - Network:", network.name);
  console.log("   - Chain ID:", network.config.chainId);
  console.log("   - DomainAuction:", auctionAddress);
  console.log("   - TaghausMarketplace:", marketplaceAddress);
  console.log("   - MockNFT:", mockNFTAddress);
  console.log("   - Owner:", await domainAuction.owner());

  // Setup marketplace configuration
  console.log("\n🔧 Setting up marketplace configuration...");
  
  // Add MockNFT as supported NFT contract
  try {
    await marketplace.addSupportedNFTContract(mockNFTAddress);
    console.log("   - MockNFT support: ✅");
  } catch (error) {
    console.log("   - MockNFT support: ❌ (failed to add)");
  }

  // Add supported currencies
  const usdcAddress = getUSDCTokenAddress(network.name);
  const wethAddress = getWETHTokenAddress(network.name);
  
  if (usdcAddress && usdcAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      await marketplace.addSupportedCurrency(usdcAddress);
      console.log("   - USDC support: ✅");
    } catch (error) {
      console.log("   - USDC support: ❌ (failed to add)");
    }
  }
  
  if (wethAddress && wethAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      await marketplace.addSupportedCurrency(wethAddress);
      console.log("   - WETH support: ✅");
    } catch (error) {
      console.log("   - WETH support: ❌ (failed to add)");
    }
  }

  // Verify contracts on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await Promise.all([
      domainAuction.deploymentTransaction().wait(6),
      marketplace.deploymentTransaction().wait(6),
      mockNFT.deploymentTransaction().wait(6)
    ]);
    
    console.log("🔍 Verifying contracts on Etherscan...");
    
    // Verify DomainAuction
    try {
      await hre.run("verify:verify", {
        address: auctionAddress,
        constructorArguments: [],
      });
      console.log("✅ DomainAuction verified on Etherscan");
    } catch (error) {
      console.log("⚠️  DomainAuction verification failed:", error.message);
    }

    // Verify TaghausMarketplace
    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [],
      });
      console.log("✅ TaghausMarketplace verified on Etherscan");
    } catch (error) {
      console.log("⚠️  TaghausMarketplace verification failed:", error.message);
    }

    // Verify MockNFT
    try {
      await hre.run("verify:verify", {
        address: mockNFTAddress,
        constructorArguments: [],
      });
      console.log("✅ MockNFT verified on Etherscan");
    } catch (error) {
      console.log("⚠️  MockNFT verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contracts: {
      DomainAuction: {
        address: auctionAddress,
        platformFee: (await domainAuction.platformFee()).toString()
      },
      TaghausMarketplace: {
        address: marketplaceAddress,
        platformFee: (await marketplace.platformFee()).toString(),
        feeRecipient: await marketplace.feeRecipient()
      },
      MockNFT: {
        address: mockNFTAddress
      }
    },
    deployer: await domainAuction.owner(),
    deploymentTime: new Date().toISOString(),
    supportedCurrencies: {
      ETH: "0x0000000000000000000000000000000000000000",
      USDC: usdcAddress,
      WETH: wethAddress
    },
    supportedNFTContracts: {
      MockNFT: mockNFTAddress
    }
  };
  
  console.log("📄 Deployment info saved to all-contracts-deployment-info.json");
  require("fs").writeFileSync(
    "all-contracts-deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 All contracts deployed successfully!");
  console.log("📝 Next steps:");
  console.log("   1. Update your .env file with the contract addresses");
  console.log("   2. Update your frontend configuration");
  console.log("   3. Test the marketplace functionality");
  console.log("   4. Integrate with Doma Protocol");
  
  console.log("\n🔧 Available marketplace functions:");
  console.log("   - createToken(name, symbol, metadataURI)");
  console.log("   - burnToken(tokenId)");
  console.log("   - createMarketItem(nftContract, tokenId, price, currency, duration)");
  console.log("   - createMarketSale(itemId)");
  console.log("   - fetchMarketItems(offset, limit)");
  console.log("   - fetchOwnNFTs(user)");
  
  console.log("\n🔧 Available auction functions:");
  console.log("   - createAuction(nftContract, tokenId, startingPrice, reservePrice, duration, auctionType)");
  console.log("   - placeBid(auctionId)");
  console.log("   - settleAuction(auctionId)");
  console.log("   - cancelAuction(auctionId)");
}

// Helper function to get USDC token address based on network
function getUSDCTokenAddress(networkName) {
  const usdcAddresses = {
    "sepolia": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "doma": "0x2f3463756C59387D6Cd55b034100caf7ECfc757b",
    "mainnet": "0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C4", // Example
    "localhost": "0x0000000000000000000000000000000000000000",
    "hardhat": "0x0000000000000000000000000000000000000000"
  };
  
  return usdcAddresses[networkName] || "0x0000000000000000000000000000000000000000";
}

// Helper function to get WETH token address based on network
function getWETHTokenAddress(networkName) {
  const wethAddresses = {
    "sepolia": "0x7b79995e5f793a07bc00c21412e50ecae098e7f9",
    "base-sepolia": "0x4200000000000000000000000000000000000006",
    "doma": "0x6f898cd313dcEe4D28A87F675BD93C471868B0Ac",
    "mainnet": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "localhost": "0x0000000000000000000000000000000000000000",
    "hardhat": "0x0000000000000000000000000000000000000000"
  };
  
  return wethAddresses[networkName] || "0x0000000000000000000000000000000000000000";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });