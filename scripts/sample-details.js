import { loadData, saveData } from './data-handler.js';

// Automatically save default analytes for QC samples
async function saveDefaultAnalytes() {
    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const testCodes = (await loadData('testCodes')) || []; // From test-code-table

    let updated = false;

    sampleDataArray.forEach(sample => {
        if (sample.type === "QC" && (!sample.analytes || sample.analytes.length === 0)) {
            const testCode = testCodes.find(tc => tc.analysisId === sample.analysis);
            if (testCode) {
                sample.analytes = testCode.analytes.map(analyte => analyte.analyteName);
                updated = true; // Mark that updates were made
                console.log(`Default analytes automatically saved for QC sample ID ${sample.id}:`, sample.analytes);
            } else {
                console.warn(`No test code found for analysis ${sample.analysis} in sample ID ${sample.id}.`);
            }
        }
    });

    if (updated) {
        await saveData('sampleDataArray', sampleDataArray);
        console.log("Default analytes saved for QC samples.");
    }
}

// Modified `window.onload` to include `saveDefaultAnalytes`
window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sampleID = urlParams.get('id'); // Get the sampleID from the URL query string

    // Ensure default analytes for QC samples are saved
    await saveDefaultAnalytes();

    if (sampleID) {
        await loadSampleDetails(sampleID);
    } else {
        showError("No Sample ID provided in the URL.");
    }

    setupModalEventListeners();
};

async function loadSampleDetails(sampleID) {
    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const workordersArray = (await loadData('workordersArray')) || [];
    const sampleData = sampleDataArray.find(sample => sample.id === sampleID);

    if (sampleData) {
        // Find the corresponding workorder for this sample
        const workorder = workordersArray.find(wo => wo.samples.some(s => s.id === sampleID));
        const workorderID = workorder ? workorder.id : "QC Workorder"; // Default to "QC Workorder" if no workorder is found

        populateSampleDetails(sampleData, workorderID);
        populateAnalysisTable(sampleData);
    } else {
        showError(`No sample data found for Sample ID: ${sampleID}`);
    }
}

async function populateSampleDetails(sampleData, workorderID) {
    const detailsDiv = document.getElementById('sample-details');

    const workorderLink = workorderID !== "QC Workorder" 
        ? `<a href="workorder-details.html?id=${workorderID}" style="color: rgb(131, 166, 231); text-decoration: none; font-weight: bold;">${workorderID}</a>` 
        : "QC Workorder";

    const sampleType = sampleData.sampleType || "N/A";

    detailsDiv.innerHTML = `
        <table class="sample-status-table">
            <tr>
                <th>Sample ID:</th>
                <td id="sample-id">${sampleData.id}</td>
            </tr>
            <tr>
                <th>Sample Status:</th>
                <td id="sample-status">${sampleData.sampleStatus || 'In Progress'}</td>
            </tr>
        </table>

        <div class="details-container">
            <div class="details-section">
                <h3>Workorder Information</h3>
                <table class="details-table">
                    <tr><th>Workorder ID</th><td>${workorderLink}</td></tr>
                    <tr><th>Client Profile</th><td>${sampleData.clientProfile || 'N/A'}</td></tr>
                    <tr><th>Facility Name</th><td>${sampleData.facilityId || 'N/A'}</td></tr>
                    <tr><th>Workorder Description</th><td>${sampleData.workorderDescription || 'N/A'}</td></tr>
                    <tr><th>Collector Name</th><td>${sampleData.collectorName || 'N/A'}</td></tr>
                    <tr><th>Chain of Custody</th><td>${sampleData.chainOfCustody || 'N/A'}</td></tr>
                </table>
            </div>

            <div class="details-section">
                <h3>Receipt Information</h3>
                <table class="details-table">
                    <tr><th>Received By</th><td>${sampleData.receivedBy || 'N/A'}</td></tr>
                    <tr><th>Date Received</th><td>${sampleData.dateReceived || 'N/A'}</td></tr>
                    <tr><th>Time Received</th><td>${sampleData.timeReceived || 'N/A'}</td></tr>
                    <tr><th>Carrier</th><td>${sampleData.carrier || 'N/A'}</td></tr>
                    <tr><th>Tracking #</th><td>${sampleData.trackingNumber || 'N/A'}</td></tr>
                </table>
            </div>

            <div class="details-section">
                <h3>Sample Properties</h3>
                <table class="details-table">
                    <tr><th>Sample Type</th><td>${sampleType}</td></tr>
                    <tr><th>Container Type</th><td>${sampleData.containerType || 'N/A'}</td></tr>
                    <tr><th>Sample Amount</th><td>${sampleData.sampleAmount || 'N/A'}</td></tr>
                    <tr><th>Temperature (°C)</th><td>${sampleData.temperature || 'N/A'}</td></tr>
                    <tr><th>pH</th><td>${sampleData.ph || 'N/A'}</td></tr>
                    <tr><th>Matrix</th><td>${sampleData.matrix || 'N/A'}</td></tr>
                    <tr><th>Sample Description</th><td>${sampleData.sampleDescription || 'N/A'}</td></tr>
                </table>
            </div>
        </div>
    `;
}


async function populateAnalysisTable(sampleData) {
    const analysisTableBody = document.getElementById('analysis-details-table').querySelector('tbody');
    const analysisTableHead = document.querySelector('#analysis-details-table thead tr');
    analysisTableBody.innerHTML = ''; // Clear previous rows
    analysisTableHead.innerHTML = ''; // Clear previous headers

    const batches = (await loadData('batches')) || [];
    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const testCodes = (await loadData('testCodes')) || []; // From test-code-table

    // Check if any sample has valid parent or paired data
    const hasParent = sampleDataArray.some(sample => sample.parent);
    const hasPaired = sampleDataArray.some(sample => sample.paired);

    // Dynamically generate table headers
    let headersHTML = `
        <th>Sample ID</th>
        <th>Collect Date</th>
        <th>Test Code (Analysis)</th>
        <th>Analyte List</th>
        <th>Batch ID</th>
        <th>Due Date</th>
        <th>Status</th>
    `;

    if (hasParent) headersHTML += '<th>Parent</th>';
    if (hasPaired) headersHTML += '<th>Paired</th>';

    analysisTableHead.innerHTML = headersHTML;

    // Populate rows
    const sample = sampleDataArray.find(sample => sample.id === sampleData.id);
    if (sample) {
        const batch = batches.find(b => b.batchId === sample.batchId);
        const sampleType = sample.qcName ? "QC" : (sample.sampleType || "N/A");

        let analysisText = sample.analysis || 'N/A';
        if (sampleType === "QC") {
            analysisText = batch ? batch.analysis || 'No Analysis Found' : 'No Batch Found';
        }

        let rowHTML = `
            <td>${sample.id}</td>
            <td>${sample.collectDate || 'N/A'}</td>
            <td>${analysisText}</td>
            <td>
                <button class="analyte-list-btn" data-sample-id="${sample.id}" data-analysis="${analysisText}" data-sample-type="${sampleType}">
                    Analyte List
                </button>
            </td>
            <td>
                ${
                    sample.batchId
                        ? `<a href="batch-details.html?batchId=${sample.batchId}" class="batch-link">${sample.batchId}</a>`
                        : 'N/A'
                }
            </td>
            <td>${sample.dueDate || 'N/A'}</td>
            <td>${batch ? batch.status : 'N/A'}</td>
        `;

        // Conditionally add Parent and Paired columns
        if (hasParent) {
            rowHTML += sample.parent
                ? `<td><a href="sample-details.html?id=${sample.parent}" class="sample-link">${sample.parent}</a></td>`
                : '<td>N/A</td>';
        }

        if (hasPaired) {
            rowHTML += sample.paired
                ? `<td><a href="sample-details.html?id=${sample.paired}" class="sample-link">${sample.paired}</a></td>`
                : '<td>N/A</td>';
        }

        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        analysisTableBody.appendChild(row);
    } else {
        showError(`No sample data found for Sample ID: ${sampleData?.id || ''}`);
    }

    // Add event listener for analyte list button if not already added
    if (!analysisTableBody.dataset.listenerAdded) {
        analysisTableBody.dataset.listenerAdded = true;

        analysisTableBody.addEventListener('click', async function (event) {
            if (event.target.classList.contains('analyte-list-btn')) {
                const button = event.target;
                const analysis = button.dataset.analysis;
                const sampleType = button.dataset.sampleType;

                if (sampleType === "QC" && analysis && analysis !== "No Analysis Found" && analysis !== "No Batch Found") {
                    // Find the corresponding test code
                    const testCodes = (await loadData('testCodes')) || [];
                    const testCode = testCodes.find(tc => tc.analysisId === analysis);
                    if (testCode) {
                        openQCAnalyteModal(testCode.analytes);
                    } else {
                        alert("No matching test code found for this analysis.");
                    }
                }
            }
        });
    }

    // Update sample status if rows exist
    if (sample) {
        updateSampleStatus();
    }
}

async function updateSampleStatus() {
    const statusCells = document.querySelectorAll('#analysis-details-table tbody tr td:last-child');
    const statuses = Array.from(statusCells).map(cell => cell.textContent.trim());

    const sampleStatusElement = document.getElementById('sample-status');
    let sampleStatus = 'In Progress';

    if (statuses.length > 0 && statuses.every(status => status === 'Complete')) {
        sampleStatus = 'Complete';
    } else if (statuses.some(status => status === 'N/A' || status.toLowerCase() === 'pending')) {
        sampleStatus = 'In Progress';
    }

    sampleStatusElement.textContent = sampleStatus;

    const sampleID = new URLSearchParams(window.location.search).get('id');
    const sampleStatusMap = (await loadData('sampleStatusMap')) || {};
    sampleStatusMap[sampleID] = sampleStatus;
    await saveData('sampleStatusMap', sampleStatusMap);
}

async function openAnalyteModal(sampleID, editMode = false) {
    const modal = document.getElementById('analyte-modal');
    const analyteListBody = document.getElementById('analyte-list-body');
    modal.dataset.sampleId = sampleID;
    
    analyteListBody.innerHTML = ''; // Clear previous content

    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const testCodes = (await loadData('testCodes')) || [];
    const sample = sampleDataArray.find(sample => sample.id === sampleID);

    if (sample) {
        const testCode = testCodes.find(tc => tc.analysisId === sample.analysis);

        if (testCode && testCode.analytes) {
            const savedAnalytes = sample.analytes || [];

            testCode.analytes.forEach((analyte, index) => {
                const isChecked = editMode || savedAnalytes.includes(analyte.analyteName);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input 
                            type="checkbox" 
                            id="analyte-checkbox-${index}" 
                            name="analytes" 
                            value="${analyte.analyteName}" 
                            ${isChecked ? 'checked' : ''}
                        >
                    </td>
                    <td>
                        <label for="analyte-checkbox-${index}">${analyte.analyteName}</label>
                    </td>
                `;
                analyteListBody.appendChild(row);
            });
        } else {
            analyteListBody.innerHTML = `<tr><td colspan="2">No analytes found for this sample.</td></tr>`;
        }
    } else {
        analyteListBody.innerHTML = `<tr><td colspan="2">No sample data found.</td></tr>`;
    }

    modal.style.display = 'block';
}

async function setupModalEventListeners() {
    document.getElementById('close-analyte-modal').addEventListener('click', closeAnalyteModal);
    document.getElementById('clear-all').addEventListener('click', clearAnalyteSelections);
    document.getElementById('save-analytes').addEventListener('click', saveAnalyteSelections);
    document.getElementById('edit-analytes').addEventListener('click', function () {
        const modal = document.getElementById('analyte-modal');
        const sampleID = modal.dataset.sampleId;
        openAnalyteModal(sampleID, true);
    });
}

async function closeAnalyteModal() {
    document.getElementById('analyte-modal').style.display = 'none';
}

async function clearAnalyteSelections() {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    if (analyteCheckboxes.length === 0) {
        alert("There are no analytes to clear.");
        return;
    }

    analyteCheckboxes.forEach(checkbox => checkbox.checked = false);
    alert("All analyte selections have been cleared.");
}

// Add event listener for dynamic Analyte List buttons
document.getElementById('analysis-details-table').addEventListener('click', async function (event) {
    if (event.target.classList.contains('analyte-list-btn')) {
        const button = event.target;
        const sampleID = button.dataset.sampleId;
        const analysis = button.dataset.analysis;
        const sampleType = button.dataset.sampleType;

        const testCodes = (await loadData('testCodes')) || [];

        if (sampleType === "QC") {
            const testCode = testCodes.find(tc => tc.analysisId === analysis);
            if (testCode) {
                openQCAnalyteModal(testCode.analytes, sampleID);
            } else {
                alert(`No test code found for analysis: ${analysis}`);
            }
        } else {
            openAnalyteModal(sampleID);
        }
    }
});

async function openQCAnalyteModal(analytes, sampleID) {
    const modal = document.getElementById('analyte-modal');
    const analyteListBody = document.getElementById('analyte-list-body');
    modal.dataset.sampleId = sampleID;

    analyteListBody.innerHTML = '';

    if (analytes && analytes.length > 0) {
        const sampleDataArray = (await loadData('sampleDataArray')) || [];
        const sample = sampleDataArray.find(sample => sample.id === sampleID);

        if (!sample.analytes || sample.analytes.length === 0) {
            sample.analytes = analytes.map(analyte => analyte.analyteName);
            await saveData('sampleDataArray', sampleDataArray);
        }

        analytes.forEach((analyte, index) => {
            const isChecked = sample.analytes.includes(analyte.analyteName);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input 
                        type="checkbox" 
                        id="analyte-checkbox-${index}" 
                        name="analytes" 
                        value="${analyte.analyteName}" 
                        ${isChecked ? 'checked' : ''}
                    >
                </td>
                <td>
                    <label for="analyte-checkbox-${index}">${analyte.analyteName}</label>
                </td>
            `;
            analyteListBody.appendChild(row);
        });
    } else {
        analyteListBody.innerHTML = `<tr><td colspan="2">No analytes found for this analysis.</td></tr>`;
    }

    modal.style.display = 'block';
}

async function saveAnalyteSelections() {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    const selectedAnalytes = Array.from(analyteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const modal = document.getElementById('analyte-modal');
    const sampleID = modal.dataset.sampleId;

    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const sample = sampleDataArray.find(sample => sample.id === sampleID);

    if (sample) {
        sample.analytes = selectedAnalytes;
        await saveData('sampleDataArray', sampleDataArray);
        alert(`Analytes saved for sample ID ${sampleID}: ${selectedAnalytes.join(', ')}`);
    } else {
        alert(`Failed to save analytes for sample ID ${sampleID}.`);
    }

    closeAnalyteModal();
}

async function showError(message) {
    document.getElementById('sample-analysis-details').innerHTML = `<p>${message}</p>`;
}














