const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying all contracts to Sepolia testnet...");

  // Deploy MockNFT contract first
  console.log("\n📦 Deploying MockNFT contract...");
  const MockNFT = await ethers.getContractFactory("MockNFT");
  const mockNFT = await MockNFT.deploy();
  await mockNFT.waitForDeployment();
  const mockNFTAddress = await mockNFT.getAddress();
  console.log("✅ MockNFT deployed to:", mockNFTAddress);

  // Deploy DomainAuction contract
  console.log("\n🏛️ Deploying DomainAuction contract...");
  const DomainAuction = await ethers.getContractFactory("DomainAuction");
  const domainAuction = await DomainAuction.deploy();
  await domainAuction.waitForDeployment();
  const auctionAddress = await domainAuction.getAddress();
  console.log("✅ DomainAuction deployed to:", auctionAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await mockNFT.deploymentTransaction().wait(6);
  await domainAuction.deploymentTransaction().wait(6);

  // Verify contracts on Etherscan
  console.log("\n🔍 Verifying contracts on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: mockNFTAddress,
      constructorArguments: [],
    });
    console.log("✅ MockNFT verified on Etherscan");
  } catch (error) {
    console.log("⚠️  MockNFT verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: auctionAddress,
      constructorArguments: [],
    });
    console.log("✅ DomainAuction verified on Etherscan");
  } catch (error) {
    console.log("⚠️  DomainAuction verification failed:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    contracts: {
      mockNFT: {
        address: mockNFTAddress,
        name: "MockNFT",
        symbol: "MNFT"
      },
      domainAuction: {
        address: auctionAddress,
        name: "DomainAuction",
        platformFee: "0.5%"
      }
    },
    deployer: await domainAuction.owner(),
    deploymentTime: new Date().toISOString(),
  };

  console.log("\n📄 Deployment info saved to deployment-info.json");
  require("fs").writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("\n📋 Contract Details:");
  console.log("   - Network: Sepolia Testnet");
  console.log("   - Chain ID: 11155111");
  console.log("   - MockNFT:", mockNFTAddress);
  console.log("   - DomainAuction:", auctionAddress);
  console.log("   - Owner:", await domainAuction.owner());
  console.log("   - Platform Fee:", await domainAuction.platformFee(), "basis points");

  console.log("\n📝 Next steps:");
  console.log("   1. Update your .env file with the contract addresses:");
  console.log(`      MOCK_NFT_CONTRACT_ADDRESS=${mockNFTAddress}`);
  console.log(`      AUCTION_CONTRACT_ADDRESS=${auctionAddress}`);
  console.log("   2. Start the backend server: npm run dev");
  console.log("   3. Test domain creation: POST /api/domains/test");
  console.log("   4. Create your first auction!");

  // Create some test domains for immediate testing
  console.log("\n🎯 Creating test domains for immediate testing...");
  try {
    const [deployer] = await ethers.getSigners();
    console.log("   - Deployer address:", deployer.address);
    
    // Mint 5 test domains to the deployer
    for (let i = 1; i <= 5; i++) {
      const tx = await mockNFT.mint(deployer.address, i);
      await tx.wait();
      console.log(`   - Minted test domain ${i} to ${deployer.address}`);
    }
    
    console.log("✅ Test domains created! You can now create auctions.");
  } catch (error) {
    console.log("⚠️  Failed to create test domains:", error.message);
    console.log("   You can create them manually later using the API.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
