const RegistrarJson = require("../artifacts/contracts/Registrar.sol/Registrar.json");
const PatientJson = require("../artifacts/contracts/Patient.sol/Patient.json");
const PrescriberJson = require("../artifacts/contracts/Prescriber.sol/Prescriber.json");
const PrescriptionJson = require("../artifacts/contracts/Prescription.sol/Prescription.json");
const PharmacyJson = require("../artifacts/contracts/Pharmacy.sol/Pharmacy.json");
const XLSX = require('xlsx');

const hre = require("hardhat");



class ConnectionData {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
        this.defaultSigner = this.provider.getSigner();
        this.defaultAddress = this.provider.address;
    }
    getCustomSigner(privateKey) {
        const signer = new ethers.Wallet(privateKey, this.provider);
        return signer;
    }
}



class Registrar {
    constructor() {
        this.contract = null;
        this.contract_address = null;
        this.connectionData = new ConnectionData();

        this.deployRegistrar();
    }

    async deployRegistrar() {
        const Registrar = await hre.ethers.getContractFactory("Registrar");
        const registrar = await Registrar.deploy();

        await registrar.deployed();

        console.log(`Resigstrar contract Deployed ${registrar.address}`);
        this.contract_address = registrar.address;
        this.contract = new ethers.Contract(registrar.address, RegistrarJson.abi, this.connectionData.defaultSigner);
    }

    async new_patient(personal_address) {
        const _newPatient = await this.contract.createPatient(personal_address);
        const newPatient = await _newPatient.wait();
        console.log(`New Patient Address: ${newPatient.events[0].args[0]}`);
        return newPatient.events[0].args[0];
    }

    async new_prescriber(personal_address, npi) {
        const _newPrescriber = await this.contract.createPrescriber(personal_address, npi);
        const newPrescriber = await _newPrescriber.wait();
        console.log(`New Prescriber Address: ${newPrescriber.events[0].args[0]}`);
        return newPrescriber.events[0].args[0];
    }

    async new_pharmacy(personal_address, npi) {
        const _newPharmacy = await this.contract.createPharmacy(personal_address, npi);
        const newPharmacy = await _newPharmacy.wait();
        console.log(`New Pharmacy Address: ${newPharmacy.events[0].args[0]}`);
        return newPharmacy.events[0].args[0];
    }
}

const _registrar = new Registrar();

class Roles {
    constructor(personal_address,privateKey) {
        this.personal_address = personal_address;
        this.privateKey = privateKey;
    }
}


class Patient extends Roles {
    constructor(personal_address,privateKey) {
        super(personal_address,privateKey);
        this.contract = null;
        this.contract_address = null;

        // this.deployPatient();
    }

    async deployPatient() {
        this.contract_address = await _registrar.new_patient(this.personal_address);
        this.contract = await new ethers.Contract(this.contract_address, PatientJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async add_permissioned(presciber_address) {
        const tx_hash = await this.contract.addPermissionedPrescriber(presciber_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async remove_permissioned(presciber_address) {
        const tx_hash = await this.contract.removePermissionedPrescriber(presciber_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async add_prescription_permissions(prescription_address, pharmacy_address) {
        const tx_hash = await this.contract.addPrescriptionPermissions(prescription_address,pharmacy_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async remove_prescription_permissions(presciber_address) {
        const tx_hash = await this.contract.removePrescriptionPermissions(presciber_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async request_fill(prescription_address) {
        const tx_hash = await this.contract.requestFill(prescription_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async get_prescriptions() {
        return await this.contract.getPrescriptionList();
    }
}


class Provider extends Roles {
    constructor(personal_address,privateKey, npi) {
        super(personal_address,privateKey);
        this.npi = npi;
    }
}


class Prescriber extends Provider {
    constructor(personal_address,privateKey, npi) {
        super(personal_address,privateKey, npi);
        this.contract = null;
        this.contract_address = null;

    }

    async deployPrescriber() {
        this.contract_address = await _registrar.new_prescriber(this.personal_address, this.npi);
        this.contract = new ethers.Contract(this.contract_address, PrescriberJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async new_prescription(patient_address, ndc, quantity, refills) {
        const tx_hash = await this.contract.createPrescription(patient_address, ndc, quantity, refills);
        const tx_receipt = await tx_hash.wait();
        console.log("new prescription contract:");
        console.log(tx_receipt.events[0]['args']['contractAddress']);

        return tx_receipt.events[0]['args']['contractAddress'];
    }

    async refill_prescription(prescription_address, refill_count) {
        const tx_hash = await this.contract.refillPrescription(prescription_address,
            refill_count);
        const tx_receipt = await tx_hash.wait();
        
    }

    async get_prescriptions(){
        const patients = await this.contract.getPatientList();
        const pres = [];
        for (let i = 0; i < patients.length; i++) {
            let presForPatient = await this.contract.getPrescriptionList(patients[i]);
            pres.push(...presForPatient);
        }
        return pres;
    }
}



class Pharmacy extends Provider {
    constructor(personal_address,privateKey, npi) {
        super(personal_address,privateKey, npi);
        this.contract = null;
        this.contract_address = null;

    }
    async deployPharmacy() {
        this.contract_address = await _registrar.new_pharmacy(this.personal_address, this.npi);
        this.contract = new ethers.Contract(this.contract_address, PharmacyJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async add_prescription(prescription_address) {
        const tx_hash = await this.contract.addPrescription(prescription_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async fill_prescription(prescription_address, fill_count) {
        const tx_hash = await this.contract.fillPrescription(prescription_address,
            fill_count);
        const tx_receipt = await tx_hash.wait();
        
    }

    async request_refill(prescription_address) {
        const tx_hash = await this.contract.requestRefill(prescription_address);
        const tx_receipt = await tx_hash.wait();
        
    }

    async get_prescriptions(){
        const patients = await this.contract.getPatientList();
        const pres = [];
        for (let i = 0; i < patients.length; i++) {
            let presForPatient = await this.contract.getPrescriptionList(patients[i]);
            pres.push(...presForPatient);
        }
        return pres;
    }
}



class DemoAccounts {
    constructor() {
        this.accounts = [];
    }

    async AddNewAccountsInExel(total) {
        const allAccounts = [];
        for (let i = 0; i < total; i++) {
            let wallet = await ethers.Wallet.createRandom();
            allAccounts.push({ publicKey: wallet.address, privateKey: wallet.privateKey })
        }

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Accounts')
        XLSX.writeFile(wb, './usedData/accounts.xlsx')

        console.log(`${total} Accounts data added in file`);
    }

    async FundAccountsAndLoad(InEachAccount) {
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
            await _registrar.connectionData.defaultSigner.sendTransaction(tx);
            // balance = await provider.getBalance(dataJson[i].publicKey);
            // console.log(balance);
        }
        this.accounts = dataJson;
        console.log(`${InEachAccount} Ethers Transferred Succefully!`);
    }

}


class Prescription {
    constructor(constract_address) {
        this.contract_address = constract_address;
        this.contract = new ethers.Contract(this.contract_address, PrescriptionJson.abi, _registrar.connectionData.defaultSigner);
    }

    async fillSigRequired(){
        return await this.contract.fillSigRequired();
    }
    async refillSigRequired(){
        return await this.contract.refillSigRequired();
    }
    async p(){
        return await this.contract.p();
    }
}

module.exports = { DemoAccounts, Pharmacy, Prescriber, Patient, Registrar, ConnectionData,Prescription };
