import { loadData, saveData } from "./data-handler.js";


// Generate a unique ID for each standard
async function generateUniqueId() {
    return `STD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Save a new standard to localForage
async function saveStandard() {
    const name = document.getElementById('standard-name').value.trim();
    const volume = document.getElementById('volume').value.trim();
    const units = document.getElementById('units').value.trim();
    const createdDate = document.getElementById('created-date').value;
    const createdBy = document.getElementById('created-by').value.trim();
    const manufacturer = document.getElementById('manufacturer').value.trim();
    const partNumber = document.getElementById('part-number').value.trim();
    const lotNumber = document.getElementById('lot-number').value.trim();
    const matrix = document.getElementById('matrix').value.trim();
    const purity = document.getElementById('purity').value.trim();
    const preparationDate = document.getElementById('preparation-date').value;
    const certificationIssueDate = document.getElementById('certification-issue-date').value;
    const expirationDate = document.getElementById('expiration-date').value;
    const coa = document.getElementById('coa').value.trim();

    if (!name || !volume || !units || !createdDate || !createdBy || !manufacturer || !partNumber || !lotNumber || !matrix || !purity || !preparationDate || !certificationIssueDate || !expirationDate || !coa) {
        alert('Please fill in all fields.');
        return;
    }

    const analytes = Array.from(document.querySelectorAll('#analytes-table tbody tr')).map(row => {
        return {
            analyte: row.querySelector('input[name="analyte"]').value.trim(),
            casNumber: row.querySelector('input[name="cas-number"]').value.trim(),
            concentration: row.querySelector('input[name="analyte-concentration"]').value.trim(),
            units: row.querySelector('input[name="units"]').value.trim(),
            uncertainty: row.querySelector('input[name="uncertainty"]').value.trim()
        };
    });

    const newStandard = {
        id: await generateUniqueId(),
        name,
        volume,
        units,
        createdDate,
        createdBy,
        manufacturer,
        partNumber,
        lotNumber,
        matrix,
        purity,
        preparationDate,
        certificationIssueDate,
        expirationDate,
        coa,
        analytes
    };

    const standards = await loadData('standards') || [];
    standards.push(newStandard);
    await saveData('standards', standards); // ✅ Save as an array;

    // Notify the table to refresh by sending a custom event
    await saveData('refreshStandardsTable', 'true');
    window.location.href = 'standards.html'; // Redirect to the standards table page
}

// Add a new row to the analytes table
async function addAnalyteRow() {
    const tableBody = document.querySelector('#analytes-table tbody');

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="analyte" placeholder="Enter analyte"></td>
        <td><input type="text" name="cas-number" placeholder="Enter CAS#"></td>
        <td><input type="number" name="analyte-concentration" placeholder="Enter concentration"></td>
        <td><input type="text" name="units" placeholder="Enter units"></td>
        <td><input type="number" name="uncertainty" placeholder="Enter uncertainty (+/-)"></td>
        <td><button type="button" class="remove-analyte-btn">Remove</button></td>
    `;

    tableBody.appendChild(newRow);

    // Add event listener to the remove button in the new row
    newRow.querySelector('.remove-analyte-btn').addEventListener('click', async function () {
        tableBody.removeChild(newRow);
    });
}

// Initialize the page
window.onload = async function () {
    document.getElementById('save-standard-btn').addEventListener('click', saveStandard);
    document.getElementById('add-analyte-btn').addEventListener('click', addAnalyteRow);
};



