const hre = require("hardhat");
const RegistrarJson = require("../artifacts/contracts/Registrar.sol/Registrar.json")

const address = "0xBdcEF67Ab2e93630eEC6110Ae27c9B2A1aC99444";
const npi = 123;

async function main() {
    const provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
    const signer = provider.getSigner();
    const Registrar = new hre.ethers.Contract(address, RegistrarJson.abi,signer);
    const CreatePharmacy = await Registrar.createPharmacy(address,npi);
    const createPharmacy = await CreatePharmacy.wait();
    console.log(` Pharmacy Address: ${createPharmacy.events[0].args[0]}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
