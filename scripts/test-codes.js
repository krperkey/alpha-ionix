// Import localForage
import { loadData, saveData } from "./data-handler.js";

// Add new analyte row
document.getElementById('add-analyte-row').addEventListener('click', async function () {
    const tableBody = document.querySelector("#analyte-table tbody");

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="analyte-name[]" placeholder="Enter analyte name"></td>
        <td><input type="text" name="units[]" placeholder="Enter units (e.g., mg/L)"></td>
        <td><input type="text" name="initial-volume[]" placeholder="Enter default initial volume"></td>
        <td><input type="text" name="final-volume[]" placeholder="Enter default final volume"></td>
        <td><input type="text" name="hold-time[]" placeholder="Enter hold time"></td>
        <td><input type="number" name="decimal-places[]" placeholder="Enter decimal places"></td>
        <td><button type="button" class="remove-row">Remove</button></td>
    `;

    tableBody.appendChild(newRow);

    // Add event listener to the remove button in the newly added row
    newRow.querySelector('.remove-row').addEventListener('click', async function () {
        tableBody.removeChild(newRow);
    });
});

// Populate the QC dropdown with sample types from localStorage
async function populateQCDropdown() {
    const qcDropdown = document.getElementById('qc-sample-type-dropdown');
    const sampleTypes = await loadData('sampleTypes') || [];

    sampleTypes.forEach(sampleType => {
        if (sampleType.typeName) { // Ensure the typeName exists
            const option = document.createElement('option');
            option.value = sampleType.typeName;
            option.textContent = sampleType.typeName;
            qcDropdown.appendChild(option);
        }
    });
}

// Add QC functionality
document.getElementById('add-qc').addEventListener('click', async function () {
    const qcDropdown = document.getElementById('qc-sample-type-dropdown');
    const qcSampleType = qcDropdown.value;

    // Prevent duplicate tabs and invalid selections
    if (!qcSampleType || document.querySelector(`#${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`)) {
        alert('Please select a unique QC Sample Type.');
        return;
    }

    // Fetch sample types from localStorage
    const sampleTypes = await loadData('sampleTypes') || [];
    const selectedSampleType = sampleTypes.find(type => type.typeName === qcSampleType);

    if (!selectedSampleType) {
        alert('Sample type not found.');
        return;
    }

    // Add a new tab for the selected sample type
    const tabsContainer = document.getElementById('tabs');
    const tabContentContainer = document.getElementById('tab-content');

    const newTabButton = document.createElement('button');
    newTabButton.className = 'tab-button';
    newTabButton.dataset.tab = qcSampleType.replace(/\s+/g, '-').toLowerCase();
    newTabButton.textContent = qcSampleType;
    tabsContainer.appendChild(newTabButton);

    const newTabContent = document.createElement('section');
    newTabContent.id = `${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`;
    newTabContent.className = 'tab';

    // Build the table structure dynamically
    let qcTableHTML = `
        <button class="remove-tab" data-tab="${newTabContent.id}">Remove QC Tab</button>
        <table>
            <thead>
                <tr>
                    <th>Analyte Name</th>
                    <th>Units</th>
                    ${selectedSampleType.accuracy ? '<th colspan="2">Accuracy</th>' : ''}
                    ${selectedSampleType.precision ? '<th>Precision</th>' : ''}
                    ${selectedSampleType.pql ? '<th colspan="2">Practical Quantitative Limits</th>' : ''}
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    ${selectedSampleType.accuracy ? '<th>Lower Control Limit (%)</th><th>Upper Control Limit (%)</th>' : ''}
                    ${selectedSampleType.precision ? '<th>RPD (%)</th>' : ''}
                    ${selectedSampleType.pql ? '<th>MDL</th><th>LOQ</th>' : ''}
                </tr>
            </thead>
            <tbody>
    `;

    // Add rows for each analyte
    const analyteRows = document.querySelectorAll("#analyte-table tbody tr");
    analyteRows.forEach(row => {
        const analyteName = row.querySelector('input[name="analyte-name[]"]').value || '';
        const units = row.querySelector('input[name="units[]"]').value || '';

        qcTableHTML += `
            <tr>
                <td>${analyteName}</td>
                <td>${units}</td>
                ${selectedSampleType.accuracy ? `
                    <td><input type="number" name="lower-control-limit[]" placeholder="Enter lower limit"></td>
                    <td><input type="number" name="upper-control-limit[]" placeholder="Enter upper limit"></td>
                ` : ''}
                ${selectedSampleType.precision ? `
                    <td><input type="number" name="precision-value[]" placeholder="Enter precision value"></td>
                ` : ''}
                ${selectedSampleType.pql ? `
                    <td><input type="number" name="mdl[]" placeholder="Enter MDL"></td>
                    <td><input type="number" name="loq[]" placeholder="Enter LOQ"></td>
                ` : ''}
            </tr>
        `;
    });

    qcTableHTML += `
            </tbody>
        </table>
    `;

    newTabContent.innerHTML = qcTableHTML;
    tabContentContainer.appendChild(newTabContent);

    // Tab switching logic
    newTabButton.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.style.display = 'none';
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        });
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        document.getElementById(`${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`).style.display = 'block';
        newTabButton.classList.add('active');
    });

    const removeButton = newTabContent.querySelector('.remove-tab');
    removeButton.addEventListener('click', () => {
        tabsContainer.removeChild(newTabButton);
        tabContentContainer.removeChild(newTabContent);
    });

    newTabButton.click(); // Automatically display the new tab
});

// Tab switching logic
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;

        // Hide all tabs
        document.querySelectorAll('.tab').forEach(tabContent => {
            tabContent.style.display = 'none';
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        // Show the selected tab and add active class to the button
        document.querySelector(`#${tab}-container`).style.display = 'block';
        button.classList.add('active');
    });
});

// Initialize tabs on page load and populate QC dropdown
window.onload = async function () {
    document.querySelectorAll('.tab').forEach(tabContent => {
        tabContent.style.display = 'none';
    });
    document.querySelector('.tab-button.active').click(); // Trigger the active tab
    populateQCDropdown(); // Populate the QC dropdown
};

// async function to generate a unique ID
async function generateUniqueId() {
    return `TC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Existing "create-test-code" button logic
document.getElementById("create-test-code").addEventListener("click", async function () {
    const uniqueId = `TC-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Generate unique ID
    console.log(`Generated Test Code ID: ${uniqueId}`);

    const analysisName = document.getElementById("analysis-name")?.value.trim();
    const referenceMethod = document.getElementById("reference-method")?.value.trim();
    const preservationRequirements = document.getElementById("preservation-requirements")?.value || "N/A";

    // Validate inputs
    if (!analysisName) {
        alert("Please enter an Analysis Name.");
        return;
    }
    if (!referenceMethod) {
        alert("Please enter a Reference Method.");
        return;
    }

    // Create test code data
    const combinedAnalysisId = `${analysisName} (${referenceMethod})`;
    const testCode = {
        uniqueId,
        analysisName,
        analysisId: combinedAnalysisId,
        referenceMethod,
        preservationRequirements,
        analytes: [],
        qcTabs: [], // Store QC tabs separately
    };

    // Collect analytes
    const analyteRows = document.querySelectorAll("#analyte-table tbody tr");
    analyteRows.forEach((row) => {
        const analyteName = row.querySelector('input[name="analyte-name[]"]').value.trim();
        const units = row.querySelector('input[name="units[]"]').value.trim();
        const initialVolume = row.querySelector('input[name="initial-volume[]"]').value.trim();
        const finalVolume = row.querySelector('input[name="final-volume[]"]').value.trim();
        const holdTime = row.querySelector('input[name="hold-time[]"]').value.trim();
        const decimalPlaces = row.querySelector('input[name="decimal-places[]"]').value.trim();

        if (analyteName) {
            testCode.analytes.push({
                analyteName,
                units,
                initialVolume,
                finalVolume,
                holdTime,
                decimalPlaces,
            });
        }
    });

    // Collect QC tabs
    const qcTabs = document.querySelectorAll("#tab-content .tab");
    qcTabs.forEach((tab) => {
        const tabName = tab.querySelector("h3").childNodes[0].textContent.trim();

        // Skip the "analyte" tab
        if (tabName.toLowerCase() === "analytes") {
            return;
        }

        const rows = Array.from(tab.querySelectorAll("tbody tr")).map((row) => ({
            analyteName: row.querySelector("td:nth-child(1)")?.textContent.trim() || "",
            units: row.querySelector("td:nth-child(2)")?.textContent.trim() || "",
            lowerLimit: row.querySelector('input[name="lower-control-limit[]"]')?.value.trim() || "",
            upperLimit: row.querySelector('input[name="upper-control-limit[]"]')?.value.trim() || "",
            precision: row.querySelector('input[name="precision-value[]"]')?.value.trim() || "",
            mdl: row.querySelector('input[name="mdl[]"]')?.value.trim() || "",
            loq: row.querySelector('input[name="loq[]"]')?.value.trim() || "",
        }));

        testCode.qcTabs.push({ tabName, rows });
    });


    // Validate analytes and QC data
    if (testCode.analytes.length === 0) {
        alert("Please add at least one analyte before saving.");
        return;
    }

    // Save Test Code to Local Storage
    const testCodes = await loadData("testCodes") || [];
    testCodes.push(testCode);
    saveData("testCodes", testCodes);

    // Show the generated unique ID in the alert
    alert(`Generated Test Code ID: ${uniqueId}`);
    window.location.href = "test-code-table.html";
});

// Back button logic (unchanged)
document.getElementById('back-to-test-code-table').addEventListener('click', async function () {
    window.location.href = 'test-code-table.html';
});
















