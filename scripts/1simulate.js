const { Patient, Prescriber, Pharmacy, DemoAccounts, Prescription } = require('./0models.js');

// Data

const pool_size = 10;
const num_cycles = 10;
const patient_ratio = 60 / 100;
const prescriber_ratio = 30 / 100;
const pharmacy_ratio = 10 / 100;
const role_pool = { "patients": [], "prescribes": [], "pharmacies": [] };
const npi = 55555555;




const deploy_role_pool = async function () {

    const demoAccounts = new DemoAccounts();
    if (demoAccounts.accounts.length < pool_size) {
        await demoAccounts.FundAccountsAndLoad(1);
    }

    let currentAccount = 0;
    for (let i = 0; i < (pool_size * patient_ratio); i++) {
        let patient = new Patient(demoAccounts.accounts[currentAccount].publicKey, demoAccounts.accounts[currentAccount].privateKey);
        await patient.deployPatient();
        role_pool['patients'].push(patient);
        currentAccount++;
    }

    for (let i = 0; i < (pool_size * prescriber_ratio); i++) {
        let prescriber = new Prescriber(demoAccounts.accounts[currentAccount].publicKey, demoAccounts.accounts[currentAccount].privateKey, npi);
        await prescriber.deployPrescriber(prescriber);
        role_pool['prescribes'].push(prescriber);
        currentAccount++;
    }

    for (let i = 0; i < (pool_size * pharmacy_ratio); i++) {
        let pharmacy = new Pharmacy(demoAccounts.accounts[currentAccount].publicKey, demoAccounts.accounts[currentAccount].privateKey, npi);
        await pharmacy.deployPharmacy();
        role_pool['pharmacies'].push(pharmacy);
        currentAccount++;
    }

    // console.log(role_pool);
    console.log("===== Role pool deployment complete =====");
};

const simulate_patient = async function (patient) {
    if (!patient) return;
    let prescriptions = await patient.get_prescriptions();
    if (prescriptions.length < 1) {
        // const randomValue = Math.floor(Math.random() * role_pool['prescribes'].length);
        const randomValue = 0;
        console.log(randomValue);
        const prescriber = role_pool['prescribes'][randomValue];

        await patient.add_permissioned(prescriber.contract_address);

        const ndc = 5555555555;
        const quantity = 5;
        const refills = 5;

        const prescription_address = await prescriber.new_prescription(
            patient.contract_address,
            ndc,
            quantity,
            refills
        )

        const pharmacy = role_pool['pharmacies'][Math.floor(Math.random() * role_pool['pharmacies'].length)];

        await patient.add_prescription_permissions(prescription_address, pharmacy.contract_address);

        await pharmacy.add_prescription(prescription_address);

        console.log("Demo prescription added for patient.");
    }

    prescriptions = await patient.get_prescriptions();

    for (let i = 0; i < prescriptions.length; i++) {
        const _prescription = new Prescription(prescriptions[i]);

        const fill_sig = await _prescription.refillSigRequired();
        const refill_sig = await _prescription.refillSigRequired();

        if (!fill_sig && !refill_sig) {
            await patient.request_fill(prescriptions[i])
        }

        console.log("Patient Simulation Complete");
    }
}

const simulate_prescriber = async function (prescriber) {
    const prescriptions = await prescriber.get_prescriptions();

    for (let i = 0; i < prescriptions.length; i++) {
        let prescription = new Prescription(prescriptions[i]);
        const refillSigRequired = await prescription.refillSigRequired();
        if (refillSigRequired) {
            await prescriber.refill_prescription(
                prescriptions[i],
                5
                );
        }
    }
    console.log("Prescriber simulation Completed");
}

const simulate_pharmacy = async function(pharmacy){
    const prescriptions = await pharmacy.get_prescriptions();
    for (let i = 0; i < prescriptions.length; i++) {
        let prescription = new Prescription(prescriptions[i]);
        const fillSigRequired = await prescription.fillSigRequired();
        const fill_count = await prescription.p();
        if (fillSigRequired && fill_count[3]) {
            await pharmacy.fill_prescription(prescriptions[i],1);
        } else {
            await pharmacy.request_refill(prescriptions[i]);

        }
    }
    console.log("Pharmcy simulation Completed");
}

const main = async function () {
    await deploy_role_pool();


    for (let i = 0; i < num_cycles; i++) {

        for (let i = 0; i < role_pool['patients'].length; i++) {
            await simulate_patient(role_pool['patients'][role_pool['patients'][i]]);
        }

        for (let i = 0; i < role_pool['prescribes'].length; i++) {
            await simulate_patient(role_pool['prescribes'][role_pool['prescribes'][i]]);
        }
        for (let i = 0; i < role_pool['pharmacies'].length; i++) {
            await simulate_patient(role_pool['pharmacies'][role_pool['pharmacies'][i]]);
        }
    }

}

main();