
const hre = require("hardhat");

async function main() {
    const Registrar = await hre.ethers.getContractFactory("Registrar");
    const registrar = await Registrar.deploy();

    await registrar.deployed();

  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });