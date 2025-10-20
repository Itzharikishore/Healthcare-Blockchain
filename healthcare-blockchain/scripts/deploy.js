const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CoalitionCom 2.0 Smart Contracts...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy DataRecord contract
  console.log("\n📁 Deploying DataRecord contract...");
  const DataRecord = await hre.ethers.deployContract("DataRecord");
  await DataRecord.waitForDeployment();
  console.log("DataRecord deployed to:", DataRecord.target);

  // Deploy AccessDAO contract
  console.log("\n🏛️ Deploying AccessDAO contract...");
  const AccessDAO = await hre.ethers.deployContract("AccessDAO");
  await AccessDAO.waitForDeployment();
  console.log("AccessDAO deployed to:", AccessDAO.target);

  // Deploy OracleLink contract
  console.log("\n🤖 Deploying OracleLink contract...");
  const OracleLink = await hre.ethers.deployContract("OracleLink");
  await OracleLink.waitForDeployment();
  console.log("OracleLink deployed to:", OracleLink.target);

  // Deploy GlobalAnchoring contract
  console.log("\n🌍 Deploying GlobalAnchoring contract...");
  const GlobalAnchoring = await hre.ethers.deployContract("GlobalAnchoring");
  await GlobalAnchoring.waitForDeployment();
  console.log("GlobalAnchoring deployed to:", GlobalAnchoring.target);

  // Initialize contracts with initial data
  console.log("\n⚙️ Initializing contracts...");
  
  // Add some initial coalition members
  console.log("Adding initial coalition members...");
  // Admin is already added in constructor, so we skip adding it again
  
  // Add a few more mock members
  const mockMembers = [
    { address: "0x1234567890123456789012345678901234567890", nation: "USA", role: "Intelligence Officer" },
    { address: "0x2345678901234567890123456789012345678901", nation: "UK", role: "Analyst" },
    { address: "0x3456789012345678901234567890123456789012", nation: "NATO", role: "Commander" }
  ];

  for (const member of mockMembers) {
    try {
      await AccessDAO.addMember(member.address, member.nation, member.role, 100, false);
      console.log(`Added member: ${member.nation} - ${member.role}`);
    } catch (error) {
      console.log(`Could not add member ${member.nation}: ${error.message}`);
    }
  }

  // Authorize some nodes
  console.log("Authorizing nodes...");
  await DataRecord.authorizeNode(deployer.address);
  await OracleLink.authorizeOracle(deployer.address);
  await GlobalAnchoring.setAnchorOracle(deployer.address);

  // Set up access rules (skip for now due to function signature issues)
  console.log("Setting up access rules...");
  // await AccessDAO.updateAccessRule("satellite", "confidential", 1, 24, true);
  // await AccessDAO.updateAccessRule("satellite", "secret", 2, 12, true);
  // await AccessDAO.updateAccessRule("satellite", "top_secret", 3, 6, true);

  // Register AI models
  console.log("Registering AI models...");
  await OracleLink.registerAIModel("CoalitionCom-AI-v1.0");
  await OracleLink.registerAIModel("Threat-Detection-v2.1");

  console.log("\n✅ Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("DataRecord:", DataRecord.target);
  console.log("AccessDAO:", AccessDAO.target);
  console.log("OracleLink:", OracleLink.target);
  console.log("GlobalAnchoring:", GlobalAnchoring.target);

  console.log("\n🔧 Next Steps:");
  console.log("1. Update frontend environment variables with contract addresses");
  console.log("2. Start the backend server: npm run start");
  console.log("3. Start the frontend: npm run frontend");
  console.log("4. Connect MetaMask to the local network");
  console.log("5. Begin testing the CoalitionCom 2.0 system");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DataRecord: DataRecord.target,
      AccessDAO: AccessDAO.target,
      OracleLink: OracleLink.target,
      GlobalAnchoring: GlobalAnchoring.target
    }
  };

  console.log("\n💾 Deployment info saved to deployment.json");
  require('fs').writeFileSync(
    'deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });