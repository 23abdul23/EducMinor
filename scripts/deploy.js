// Deployment script for the Axiom ERC721 contract.
// Usage:
//   npx hardhat run scripts/deploy.js --network sepolia
// Ensure you have SEPOLIA_RPC_URL and SEPOLIA_PRIVATE_KEY set in .env.

import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(balance),
    "ETH (network:",
    hre.network.name,
    ")"
  );

  const Axiom = await hre.ethers.getContractFactory("Axiom");
  const contract = await Axiom.deploy(deployer.address);

  console.log("Axiom deployment tx:", contract.deploymentTransaction().hash);
  await contract.waitForDeployment();

  console.log("Axiom deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
