import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    renderWorkorderDetails();

    // Handle "Run Report" action
    document.getElementById('run-report').addEventListener('click', async function (event) {
        event.preventDefault();
        generateReport();
    });
};

async function renderWorkorderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const workorderID = urlParams.get('id');

    const workordersArray = await loadData('workordersArray') || [];
    const sampleStatusMap = await loadData('sampleStatusMap') || {};

    const workorder = workordersArray.find(w => w.id === workorderID);

    if (workorder) {
        // Populate workorder information
        document.getElementById('workorder-info').innerHTML = `
            <p><strong>Workorder ID:</strong> <span id="workorder-id">${workorder.id}</span></p>
            <p><strong>Client Profile:</strong> <span id="client-profile">${workorder.clientProfile}</span></p>
            <p><strong>Facility Name:</strong> <span id="facility-id">${workorder.facilityId}</span></p>
            <p><strong>Description:</strong> <span id="workorder-description">${workorder.description}</span></p>
            <p><strong>Workorder Status:</strong> <span id="workorder-status">In Progress</span></p>
        `;

        const tableBody = document.getElementById('sample-table-body');
        tableBody.innerHTML = ''; // Clear previous rows

        // Populate samples table
        workorder.samples.forEach(sample => {
            const sampleStatus = sampleStatusMap[sample.id] || 'In Progress';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="sample-details.html?id=${sample.id}">${sample.id}</a></td>
                <td>${sample.collectDate || 'N/A'}</td>
                <td>${sample.analysis || 'N/A'}</td>
                <td>${sample.holdTime || 'N/A'}</td>
                <td>${sample.dueDate || 'N/A'}</td>
                <td>${sample.sampleDescription || 'N/A'}</td>
                <td>${sampleStatus}</td>
            `;
            tableBody.appendChild(row);
        });

        updateWorkorderStatus();
    } else {
        document.getElementById('workorder-info').innerHTML = `<p>No Workorder found with ID: ${workorderID}</p>`;
    }
}

async function updateWorkorderStatus() {
    const statusCells = document.querySelectorAll('#sample-table-body tr td:last-child');
    const statuses = Array.from(statusCells).map(cell => cell.textContent.trim());

    const workorderStatusElement = document.getElementById('workorder-status');
    let workorderStatus = 'In Progress';

    if (statuses.length > 0 && statuses.every(status => status === 'Complete')) {
        workorderStatus = 'Complete';
    }

    workorderStatusElement.textContent = workorderStatus;

    const workorderID = new URLSearchParams(window.location.search).get('id');
    const workorderStatusMap = await loadData('workorderStatusMap') || {};
    workorderStatusMap[workorderID] = workorderStatus;
    saveData('workorderStatusMap', workorderStatusMap);
}