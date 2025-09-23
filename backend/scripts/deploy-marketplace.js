const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying TaghausMarketplace contract...");

  // Get the contract factory
  const TaghausMarketplace = await ethers.getContractFactory("TaghausMarketplace");
  
  // Deploy the contract
  const marketplace = await TaghausMarketplace.deploy();
  
  // Wait for deployment to complete
  await marketplace.waitForDeployment();
  
  const address = await marketplace.getAddress();
  
  console.log("✅ TaghausMarketplace deployed to:", address);
  console.log("📋 Contract details:");
  console.log("   - Network:", network.name);
  console.log("   - Chain ID:", network.config.chainId);
  console.log("   - Owner:", await marketplace.owner());
  console.log("   - Platform Fee:", await marketplace.platformFee(), "basis points");
  console.log("   - Fee Recipient:", await marketplace.feeRecipient());
  
  // Add some initial supported currencies
  console.log("🔧 Setting up initial configuration...");
  
  // Add ETH support (already supported by default)
  console.log("   - ETH support: ✅ (default)");
  
  // Add USDC support if available on this network
  const usdcAddress = getUSDCTokenAddress(network.name);
  if (usdcAddress && usdcAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      await marketplace.addSupportedCurrency(usdcAddress);
      console.log("   - USDC support: ✅");
    } catch (error) {
      console.log("   - USDC support: ❌ (failed to add)");
    }
  }
  
  // Add WETH support if available on this network
  const wethAddress = getWETHTokenAddress(network.name);
  if (wethAddress && wethAddress !== "0x0000000000000000000000000000000000000000") {
    try {
      await marketplace.addSupportedCurrency(wethAddress);
      console.log("   - WETH support: ✅");
    } catch (error) {
      console.log("   - WETH support: ❌ (failed to add)");
    }
  }
  
  // Verify the contract on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("⏳ Waiting for block confirmations...");
    await marketplace.deploymentTransaction().wait(6);
    
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Contract verification failed:", error.message);
    }
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: address,
    deployer: await marketplace.owner(),
    platformFee: (await marketplace.platformFee()).toString(),
    feeRecipient: await marketplace.feeRecipient(),
    deploymentTime: new Date().toISOString(),
    supportedCurrencies: {
      ETH: "0x0000000000000000000000000000000000000000",
      USDC: usdcAddress,
      WETH: wethAddress
    }
  };
  
  console.log("📄 Deployment info saved to marketplace-deployment-info.json");
  require("fs").writeFileSync(
    "marketplace-deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Marketplace deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("   1. Update your .env file with the marketplace contract address");
  console.log("   2. Add supported NFT contracts using addSupportedNFTContract()");
  console.log("   3. Test the marketplace functionality");
  console.log("   4. Integrate with your frontend");
  
  console.log("\n🔧 Available functions:");
  console.log("   - createToken(name, symbol, metadataURI)");
  console.log("   - burnToken(tokenId)");
  console.log("   - createMarketItem(nftContract, tokenId, price, currency, duration)");
  console.log("   - createMarketSale(itemId)");
  console.log("   - fetchMarketItems(offset, limit)");
  console.log("   - fetchOwnNFTs(user)");
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
