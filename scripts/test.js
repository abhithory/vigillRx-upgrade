const PatientJson = require("../artifacts/contracts/Patient.sol/Patient.json");
const hre = require("hardhat");
const Web3 = require('web3')


async function main() {
    const Registrar = await hre.ethers.getContractFactory("Registrar");
    const registrar = await Registrar.deploy();
    await registrar.deployed();
    console.log(await registrar.owner());

    const _newPatient = await registrar.createPatient("0xBfEE95B3C2658164eCC7051A7F8BB374e167612F");
    const newPatient = await _newPatient.wait();
    const patientAddress =  newPatient.events[0].args[0];

    console.log("patient address",patientAddress);

    
    // const _provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
    // const _signer = new hre.ethers.Wallet("1d45a80cacabebb93722db58ea5ddd9165289497954bd83a929a61f482ca1a32", _provider);
    //  const contract = new hre.ethers.Contract(patientAddress, PatientJson.abi, _signer);
    // console.log(await contract.registrar());

    const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));


    const contract = new web3.eth.Contract(PatientJson.abi,patientAddress);
   


    return
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });