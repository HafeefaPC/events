import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployEventStorageContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("EventStorage", {
    from: deployer,
    args: [], // No constructor arguments needed
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to verify deployment
  const eventStorageContract = await hre.ethers.getContract<Contract>("EventStorage", deployer);
  
  console.log("EventStorage contract deployed successfully");
};

export default deployEventStorageContract;

deployEventStorageContract.tags = ["EventStorage"];