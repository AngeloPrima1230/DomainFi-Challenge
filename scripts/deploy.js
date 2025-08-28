const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying DomainAuction contract...");

  // Get the contract factory
  const DomainAuction = await ethers.getContractFactory("DomainAuction");
  
  // Deploy the contract
  const domainAuction = await DomainAuction.deploy();
  
  // Wait for deployment to complete
  await domainAuction.waitForDeployment();
  
  const address = await domainAuction.getAddress();
  
  console.log("✅ DomainAuction deployed to:", address);
  console.log("📋 Contract details:");
  console.log("   - Network:", network.name);
  console.log("   - Chain ID:", network.config.chainId);
  console.log("   - Owner:", await domainAuction.owner());
  console.log("   - Platform Fee:", await domainAuction.platformFee(), "basis points");
  
  // Verify the contract on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("⏳ Waiting for block confirmations...");
    await domainAuction.deploymentTransaction().wait(6);
    
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
    deployer: await domainAuction.owner(),
    deploymentTime: new Date().toISOString(),
  };
  
  console.log("📄 Deployment info saved to deployment-info.json");
  require("fs").writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("   1. Update your .env file with the contract address");
  console.log("   2. Start the frontend development server");
  console.log("   3. Test the auction functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

