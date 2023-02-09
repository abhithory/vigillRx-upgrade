// const Web3 = require('web3');
// const web3 = new Web3('HTTP://127.0.0.1:7545');
// const hre = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
const signer = provider.getSigner();
const XLSX = require('xlsx');



// createWallets(10);
const createWallets = async (total) => {
    const allAccounts = []; 
    for (let i = 0; i < total; i++) {
        let wallet = await ethers.Wallet.createRandom();
        allAccounts.push({publicKey:wallet.address,privateKey:wallet.privateKey})
    }
    createExelFile(allAccounts);
}


const createExelFile = async function(data){
       const ws = XLSX.utils.json_to_sheet(data)
       const wb = XLSX.utils.book_new()
       XLSX.utils.book_append_sheet(wb, ws, 'Accounts')
       XLSX.writeFile(wb, './usedData/accounts.xlsx')

       console.log("accounts Created");
}

const sendEthersInEachAccount = async function (InEachAccount){
    const file = XLSX.readFile("./usedData/accounts.xlsx");
    const dataJson = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);

    for (let i = 0; i < dataJson.length; i++) {
        // console.log(dataJson[i].publicKey);
        // let balance = await provider.getBalance(dataJson[i].publicKey);
        // console.log(balance);
        let tx = {
            to: dataJson[i].publicKey,
            value: ethers.utils.parseEther(String(InEachAccount), 'ether')
        };
        await signer.sendTransaction(tx);
        // balance = await provider.getBalance(dataJson[i].publicKey);
        // console.log(balance);
    }

    console.log(`${InEachAccount} Ethers Transferred Succefully!`);
}


const deployContracts = async function (){
    const totalAccounts = 10;
    const patient_ratio = 60/100;
    const prescriber_ratio = 30/100;
    const pharmacy_ratio = 10/100;
    const role_contracts = {"patients":[],"prescribes":[],"pharmacies":[]};
    const npi_prescriber = 55555555;
    const npi_pharmacy = 55555555;

    for (let i = 0; i < (patient_ratio*totalAccounts); i++) {        
    }
    for (let i = 0; i < (prescriber_ratio*totalAccounts); i++) {        
    }
    for (let i = 0; i < (pharmacy_ratio*totalAccounts); i++) {        
    }
}

sendEthersInEachAccount(1);