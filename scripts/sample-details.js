window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const sampleID = urlParams.get('id'); // Get the sampleID from the URL query string

    if (sampleID) {
        loadSampleDetails(sampleID);
    } else {
        showError("No Sample ID provided in the URL.");
    }

    setupModalEventListeners();
};

function loadSampleDetails(sampleID) {
    const sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];
    const workordersArray = JSON.parse(localStorage.getItem('workordersArray')) || [];
    const sampleData = sampleDataArray.find(sample => sample.id === sampleID);

    if (sampleData) {
        // Find the corresponding workorder for this sample
        const workorder = workordersArray.find(wo => wo.samples.some(s => s.id === sampleID));
        const workorderID = workorder ? workorder.id : "N/A"; // Default to "N/A" if no workorder is found

        populateSampleDetails(sampleData, workorderID);
        populateAnalysisTable(sampleData);
    } else {
        showError(`No sample data found for Sample ID: ${sampleID}`);
    }
}

function populateSampleDetails(sampleData, workorderID) {
    const detailsDiv = document.getElementById('sample-details');

    const workorderLink = workorderID !== "N/A" 
        ? `<a href="workorder-details.html?id=${workorderID}" style="color: rgb(131, 166, 231); text-decoration: none; font-weight: bold;">${workorderID}</a>` 
        : "N/A";

    detailsDiv.innerHTML = `
        <table class="sample-status-table">
                <tr>
                        <th>Sample Status:</th>
                        <td id="sample-status">${sampleData.sampleStatus}>In Progress</td>
                    </tr>
                </table>

        <div class="details-container">
            <div class="details-section">
                <h3>Workorder Information</h3>
                <table class="details-table">
                    <tr>
                        <th>Workorder ID</th>
                        <td>${workorderLink}</td>
                    </tr>
                    <tr>
                        <th>Client Profile</th>
                        <td>${sampleData.clientProfile || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Facility Name</th>
                        <td>${sampleData.facilityId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Workorder Description</th>
                        <td>${sampleData.workorderDescription || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Collector Name</th>
                        <td>${sampleData.collectorName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Chain of Custody</th>
                        <td>${sampleData.chainOfCustody || 'N/A'}</td>
                    </tr>
                </table>
            </div>

            <div class="details-section">
                <h3>Receipt Information</h3>
                <table class="details-table">
                    <tr>
                        <th>Received By</th>
                        <td>${sampleData.receivedBy || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Date Received</th>
                        <td>${sampleData.dateReceived || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Time Received</th>
                        <td>${sampleData.timeReceived || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Carrier</th>
                        <td>${sampleData.carrier || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Tracking #</th>
                        <td>${sampleData.trackingNumber || 'N/A'}</td>
                    </tr>
                </table>
            </div>

            <div class="details-section">
                <h3>Sample Properties</h3>
                <table class="details-table">
                    <tr>
                        <th>Sample Type</th>
                        <td>${sampleData.sampleType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Container Type</th>
                        <td>${sampleData.containerType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Sample Amount</th>
                        <td>${sampleData.sampleAmount || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Temperature (°C)</th>
                        <td>${sampleData.temperature || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>pH</th>
                        <td>${sampleData.ph || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Matrix</th>
                        <td>${sampleData.matrix || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Sample Description</th>
                        <td>${sampleData.sampleDescription || 'N/A'}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function populateAnalysisTable(sampleData) {
    const analysisTableBody = document.getElementById('analysis-details-table').querySelector('tbody');
    analysisTableBody.innerHTML = ''; // Clear previous rows

    const batches = JSON.parse(localStorage.getItem('batches')) || [];
    const sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];
    const sample = sampleDataArray.find(sample => sample.id === sampleData.id);

    if (sample) {
        const batch = batches.find(b => b.batchId === sample.batchId);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sample.id}</td>
            <td>${sample.collectDate || 'N/A'}</td>
            <td>${sample.analysis || 'N/A'}</td>
            <td>
                <button class="analyte-list-btn" data-sample-id="${sample.id}">Analyte List</button>
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
        analysisTableBody.appendChild(row);

        document.querySelectorAll('.analyte-list-btn').forEach(button => {
            button.addEventListener('click', function () {
                const sampleID = this.dataset.sampleId;
                openAnalyteModal(sampleID);
            });
        });

        updateSampleStatus();
    } else {
        showError(`No sample data found for Sample ID: ${sampleData.id}`);
    }
}

function updateSampleStatus() {
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
    const sampleStatusMap = JSON.parse(localStorage.getItem('sampleStatusMap')) || {};
    sampleStatusMap[sampleID] = sampleStatus;
    localStorage.setItem('sampleStatusMap', JSON.stringify(sampleStatusMap));
}



function openAnalyteModal(sampleID) {
    const modal = document.getElementById('analyte-modal');
    const analyteListBody = document.getElementById('analyte-list-body');
    analyteListBody.innerHTML = ''; // Clear previous content

    const sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];
    const sample = sampleDataArray.find(sample => sample.id === sampleID);

    if (sample && sample.analytes) {
        sample.analytes.forEach(analyte => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" value="${analyte}" checked></td>
                <td>${analyte}</td>
            `;
            analyteListBody.appendChild(row);
        });
    } else {
        analyteListBody.innerHTML = `<tr><td colspan="2">No analytes found for this sample.</td></tr>`;
    }

    modal.style.display = 'block';
}

function setupModalEventListeners() {
    document.getElementById('close-analyte-modal').addEventListener('click', function () {
        closeAnalyteModal();
    });

    document.getElementById('clear-all').addEventListener('click', function () {
        clearAnalyteSelections();
    });

    document.getElementById('save-analytes').addEventListener('click', function () {
        saveAnalyteSelections();
    });
}

function closeAnalyteModal() {
    const modal = document.getElementById('analyte-modal');
    modal.style.display = 'none';
}

function clearAnalyteSelections() {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    analyteCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function saveAnalyteSelections() {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    const selectedAnalytes = Array.from(analyteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const modal = document.getElementById('analyte-modal');
    const sampleID = modal.dataset.sampleId;

    const sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];
    const sample = sampleDataArray.find(sample => sample.id === sampleID);

    if (sample) {
        sample.analytes = selectedAnalytes;
        localStorage.setItem('sampleDataArray', JSON.stringify(sampleDataArray));
        alert(`Analytes saved for sample ID ${sampleID}: ${selectedAnalytes.join(', ')}`);
    } else {
        alert(`Failed to save analytes for sample ID ${sampleID}.`);
    }

    closeAnalyteModal();
}

function showError(message) {
    const detailsDiv = document.getElementById('sample-analysis-details');
    detailsDiv.innerHTML = `<p>${message}</p>`;
}













