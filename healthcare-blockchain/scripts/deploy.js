const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const HealthcareRecords = await hre.ethers.getContractFactory("HealthcareRecords");
  
  console.log("Deploying HealthcareRecords contract...");
  
  const healthcareRecords = await HealthcareRecords.deploy();
  
  await healthcareRecords.waitForDeployment();
  
  const address = await healthcareRecords.getAddress();
  
  console.log("✅ HealthcareRecords deployed to:", address);
  console.log("Admin address:", (await hre.ethers.getSigners())[0].address);
  console.log("\n📝 Save this contract address for the frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });