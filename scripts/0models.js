const RegistrarJson = require("../artifacts/contracts/Registrar.sol/Registrar.json");
const PatientJson = require("../artifacts/contracts/Patient.sol/Patient.json");
const PrescriberJson = require("../artifacts/contracts/Prescriber.sol/Prescriber.json");
const PrescriptionJson = require("../artifacts/contracts/Prescription.sol/Prescription.json");
const PharmacyJson = require("../artifacts/contracts/Pharmacy.sol/Pharmacy.json");
const XLSX = require('xlsx');

const hre = require("hardhat");
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')




let _registrar;


class ConnectionData {
    constructor() {
        this.rpcUrl = "HTTP://127.0.0.1:7545";
        this.provider = new ethers.providers.JsonRpcProvider("HTTP://127.0.0.1:7545");
        this.defaultSigner = this.provider.getSigner();
        this.defaultAddress = this.provider.address;
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    }
    getCustomSigner(privateKey) {
        const signer = new ethers.Wallet(privateKey, this.provider);
        return signer;
    }

    getCustomWeb3(PRIVATE_KEY) {
        console.log("private keyy", PRIVATE_KEY);
        return new Web3(new HDWalletProvider(PRIVATE_KEY, this.rpcUrl));
    }
}



class Registrar {
    constructor() {
        this.contract = null;
        this.contract_address = null;
        this.connectionData = new ConnectionData();

        // this.deployRegistrar();
    }

    async deployRegistrar() {
        const Registrar = await hre.ethers.getContractFactory("Registrar");
        const registrar = await Registrar.deploy();
        await registrar.deployed();

        this.contract_address = registrar.address;
        // this.contract = registrar;
        this.contract = new ethers.Contract(registrar.address, RegistrarJson.abi, this.connectionData.defaultSigner);
        console.log(`Resigstrar contract Deployed ${registrar.address}`);
    }

    async new_patient(personal_address) {
        const _newPatient = await this.contract.createPatient(personal_address);
        const newPatient = await _newPatient.wait();
        console.log(`New Patient created: ${newPatient.events[0].args[0]}`);
        return newPatient.events[0].args[0];
    }

    async new_prescriber(personal_address, npi) {
        const _newPrescriber = await this.contract.createPrescriber(personal_address, npi);
        const newPrescriber = await _newPrescriber.wait();
        console.log(`New Prescriber created: ${newPrescriber.events[0].args[0]}`);

        return newPrescriber.events[0].args[0];
    }

    async new_pharmacy(personal_address, npi) {
        const _newPharmacy = await this.contract.createPharmacy(personal_address, npi);
        const newPharmacy = await _newPharmacy.wait();
        console.log(`New Pharmacy created: ${newPharmacy.events[0].args[0]}`);
        return newPharmacy.events[0].args[0];
    }
}

async function deployRegistrar() {
    _registrar = new Registrar();
    await _registrar.deployRegistrar()
}


class Roles {
    constructor(personal_address, privateKey,) {
        this.personal_address = personal_address;
        this.privateKey = privateKey;
    }
}


class Patient extends Roles {
    constructor(personal_address, privateKey) {
        super(personal_address, privateKey);
        this.contract = null;
        this.contract_address = null;
        this.runtime = {
            'add_permissioned': 0,
            'remove_permissioned': 0,
            'add_prescription_permissions': 0,
            'remove_prescription_permissions': 0,
            'request_fill': 0
        }
        this.gas_used = {
            'add_permissioned': 0,
            'remove_permissioned': 0,
            'add_prescription_permissions': 0,
            'remove_prescription_permissions': 0,
            'request_fill': 0
        }
        this.transactions = {
            'add_permissioned': 0,
            'remove_permissioned': 0,
            'add_prescription_permissions': 0,
            'remove_prescription_permissions': 0,
            'request_fill': 0
        }
    }

    to_dict() {
        return {
            'role': 'patient',
            'personal_address': this.personal_address,
            'contract_address': this.contract_address,
            'runtime': this.runtime,
            'gas_used': this.gas_used,
            'transactions': this.transactions
        }
    }

    async deployPatient() {
        this.contract_address = await _registrar.new_patient(this.personal_address);
        this.contract = await new ethers.Contract(this.contract_address, PatientJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async add_permissioned(presciber_address) {
        let start = Date.now();
        const tx_hash = await this.contract.addPermissionedPrescriber(presciber_address);
        const tx_receipt = await tx_hash.wait();

        console.log(`Patient:${this.contract_address} -> add_permissioned called to prescriber:${presciber_address}`);

        this.runtime['add_permissioned'] += Date.now() - start;
        this.gas_used['add_permissioned'] += tx_receipt.gasUsed
        this.transactions['add_permissioned'] += 1;
    }

    async remove_permissioned(presciber_address) {
        let start = Date.now();

        const tx_hash = await this.contract.removePermissionedPrescriber(presciber_address);
        const tx_receipt = await tx_hash.wait();
        console.log(`Patient:${this.contract_address} remove_permissioned called for prescriber:${presciber_address}`);


        this.runtime['remove_permissioned'] += Date.now() - start;
        this.gas_used['remove_permissioned'] += tx_receipt.gasUsed;
        this.transactions['remove_permissioned'] += 1;
    }

    async add_prescription_permissions(prescription_address, pharmacy_address) {
        let start = Date.now();
        const tx_hash = await this.contract.addPrescriptionPermissions(prescription_address, pharmacy_address);
        const tx_receipt = await tx_hash.wait();
        console.log(`Patient:${this.contract_address} add_prescription_permissions called for Pharmacy:${pharmacy_address} and Prescription:${prescription_address}`);


        this.runtime['add_prescription_permissions'] += Date.now() - start;
        this.gas_used['add_prescription_permissions'] += tx_receipt.gasUsed;
        this.transactions['add_prescription_permissions'] += 1;
    }

    async remove_prescription_permissions(presciber_address) {
        let start = Date.now();
        const tx_hash = await this.contract.removePrescriptionPermissions(presciber_address);
        const tx_receipt = await tx_hash.wait();
        console.log(`Patient:${this.contract_address} remove_prescription_permissions called for Presciber:${presciber_address}`);


        this.runtime['remove_prescription_permissions'] += Date.now() - start;
        this.gas_used['remove_prescription_permissions'] += tx_receipt.gasUsed;
        this.transactions['remove_prescription_permissions'] += 1;
    }

    async request_fill(prescription_address) {
        let start = Date.now();
        const tx_hash = await this.contract.requestFill(prescription_address);
        const tx_receipt = await tx_hash.wait();
        console.log(`Patient:${this.contract_address} request_fill called for Prescription:${prescription_address}`);


        this.runtime['request_fill'] += Date.now() - start;
        this.gas_used['request_fill'] += tx_receipt.gasUsed;
        this.transactions['request_fill'] += 1;
    }

    async get_prescriptions() {
        console.log(`Patient:${this.contract_address} get_prescriptions called`);

        return await this.contract.getPrescriptionList();
    }
}


class Provider extends Roles {
    constructor(personal_address, privateKey, npi) {
        super(personal_address, privateKey);
        this.npi = npi;
    }
}


class Prescriber extends Provider {
    constructor(personal_address, privateKey, npi) {
        super(personal_address, privateKey, npi);
        this.contract = null;
        this.contract_address = null;
        this.runtime = { 'new_prescription': 0, 'refill_prescription': 0 }
        this.gas_used = { 'new_prescription': 0, 'refill_prescription': 0 }
        this.transactions = { 'new_prescription': 0, 'refill_prescription': 0 }

    }
    to_dict() {
        return {
            'role': 'prescriber',
            'personal_address': this.personal_address,
            'contract_address': this.contract_address,
            'runtime': this.runtime,
            'gas_used': this.gas_used,
            'transactions': this.transactions
        }
    }

    async deployPrescriber() {
        // """Deploys new prescription contract to Ganache.
        this.contract_address = await _registrar.new_prescriber(this.personal_address, this.npi);
        this.contract = new ethers.Contract(this.contract_address, PrescriberJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async new_prescription(patient_address, ndc, quantity, refills) {
        let start = Date.now();
        const tx_hash = await this.contract.createPrescription(patient_address, ndc, quantity, refills);
        const tx_receipt = await tx_hash.wait();

        console.log(`Prescriber:${this.contract_address} new_prescription called for patient:${patient_address},quantity:${quantity}, refills:${refills}, ndc${ndc}`);


        this.runtime['new_prescription'] += Date.now() - start;
        this.gas_used['new_prescription'] += tx_receipt.gasUsed;
        this.transactions['new_prescription'] += 1;

        return tx_receipt.events[0]['args']['contractAddress'];
    }

    async refill_prescription(prescription_address, refill_count) {
        let start = Date.now();
        const tx_hash = await this.contract.refillPrescription(prescription_address,
            refill_count);
        const tx_receipt = await tx_hash.wait();
        console.log(`Prescriber:${this.contract_address} refill_prescription called for Prescription:${prescription_address} and refillcount:${refill_count}`);


        this.runtime['refill_prescription'] += Date.now() - start;
        this.gas_used['refill_prescription'] += tx_receipt.gasUsed;
        this.transactions['refill_prescription'] += 1;


    }

    async get_prescriptions() {
        console.log(`Prescriber:${this.contract_address} get_prescriptions called`);

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

    constructor(personal_address, privateKey, npi) {
        super(personal_address, privateKey, npi);
        this.contract = null;
        this.contract_address = null;
        this.runtime = { 'add_prescription': 0, 'fill_prescription': 0, 'request_refill': 0 }
        this.gas_used = { 'add_prescription': 0, 'fill_prescription': 0, 'request_refill': 0 }
        this.transactions = { 'add_prescription': 0, 'fill_prescription': 0, 'request_refill': 0 }
    }

    to_dict() {
        return {
            'role': 'pharmacy',
            'personal_address': this.personal_address,
            'contract_address': this.contract_address,
            'runtime': this.runtime,
            'gas_used': this.gas_used,
            'transactions': this.transactions
        }
    }
    async deployPharmacy() {
        this.contract_address = await _registrar.new_pharmacy(this.personal_address, this.npi);
        this.contract = new ethers.Contract(this.contract_address, PharmacyJson.abi, _registrar.connectionData.getCustomSigner(this.privateKey));
    }

    async add_prescription(prescription_address) {
        let start = Date.now()
        const tx_hash = await this.contract.addPrescription(prescription_address);
        const tx_receipt = await tx_hash.wait();

        console.log(`Pharmacy:${this.contract_address} add_prescription called for prescription:${prescription_address}`);


        this.runtime['add_prescription'] += Date.now() - start
        this.gas_used['add_prescription'] += tx_receipt.gasUsed
        this.transactions['add_prescription'] += 1

    }

    async fill_prescription(prescription_address, fill_count) {
        let start = Date.now()
        const tx_hash = await this.contract.fillPrescription(prescription_address,
            fill_count);
        const tx_receipt = await tx_hash.wait();
        console.log(`Pharmacy:${this.contract_address} fill_prescription called for prescription:${prescription_address}, fillcount:${fill_count}`);

        this.runtime['fill_prescription'] += Date.now() - start
        this.gas_used['fill_prescription'] += tx_receipt.gasUsed
        this.transactions['fill_prescription'] += 1
    }

    async request_refill(prescription_address) {
        let start = Date.now()
        const tx_hash = await this.contract.requestRefill(prescription_address);
        const tx_receipt = await tx_hash.wait();
        console.log(`Pharmacy:${this.contract_address} request_refill called prescription:${prescription_address}`);


        this.runtime['request_refill'] += Date.now() - start
        this.gas_used['request_refill'] += tx_receipt.gasUsed
        this.transactions['request_refill'] += 1
    }

    async get_prescriptions() {
        const patients = await this.contract.getPatientList();

        const pres = [];
        for (let i = 0; i < patients.length; i++) {
            let presForPatient = await this.contract.getPrescriptionList(patients[i]);
            pres.push(...presForPatient);
        }
        console.log(`Pharmacy:${this.contract_address} get_prescriptions called`);
        return pres;
    }
}

class DemoAccounts {
    constructor() {
        this.accounts = [];
        this.isAccountsFunded = false;
    }

    async AddNewAccountsInExel(total) {
        const allAccounts = [];
        for (let i = 0; i < total; i++) {
            let wallet = await ethers.Wallet.createRandom();
            allAccounts.push({ publicKey: wallet.address, privateKey: wallet.privateKey, mnemonic: wallet.mnemonic.phrase })
        }

        const ws = XLSX.utils.json_to_sheet(allAccounts)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Accounts')
        XLSX.writeFile(wb, './usedData/accounts.xlsx')

        console.log(`${total} Accounts data added in file`);
    }

    async FundAccountsAndLoad(InEachAccount) {
        console.log("Transferring ethers to accounts....");
        const file = XLSX.readFile("./usedData/accounts.xlsx");
        const dataJson = XLSX.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);

        for (let i = 0; i < dataJson.length; i++) {
            console.log(i);
            let tx = {
                to: dataJson[i].publicKey,
                value: ethers.utils.parseEther(String(InEachAccount), 'ether')
            };
            await _registrar.connectionData.defaultSigner.sendTransaction(tx);
        }
        this.accounts = dataJson;
        this.isAccountsFunded = true;
        console.log(`${InEachAccount} Ethers Transferred Succefully to All ${dataJson.length} accounts.`);
    }

}

class GenerateReports {
    constructor() {
    }

    saveOjectArrayToFile(_jsonArray) {
        const ws = XLSX.utils.json_to_sheet(_jsonArray)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Report')
        XLSX.writeFile(wb, './usedData/Reports.xlsx');

        console.log("Report succefully saved in file");
    }

    parshTxReport(data) {
        for (const [_fun, value] of Object.entries(data['runtime'])) {
            data[_fun + "_runtime"] = value;
        }

        for (const [_fun, value] of Object.entries(data['gas_used'])) {
            data[_fun + "_gas_used"] = value;
        }

        for (const [_fun, value] of Object.entries(data['transactions'])) {
            data[_fun + "_transactions"] = value;
        }
        delete data["runtime"];
        delete data["gas_used"];
        delete data["transactions"];

        return data;
    }
}


class Prescription {
    constructor(constract_address) {
        this.contract_address = constract_address;
        this.contract = new ethers.Contract(this.contract_address, PrescriptionJson.abi, _registrar.connectionData.defaultSigner);
    }

    async fillSigRequired() {
        return await this.contract.fillSigRequired();
    }
    async refillSigRequired() {
        return await this.contract.refillSigRequired();
    }
    async p() {
        return await this.contract.p();
    }
}

module.exports = { DemoAccounts, Pharmacy, Prescriber, Patient, Registrar, ConnectionData, Prescription, GenerateReports, deployRegistrar };
