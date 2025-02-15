import { loadData, saveData } from './data-handler.js';

document.addEventListener('DOMContentLoaded', () => {
    const logContainer = document.getElementById('log-container');

    // Retrieve log data from localStorage
    const logData = loadData('inspectionLogs');

    if (logData) {
        const logEntries = logData.trim().split('\n');
        logEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            const cellIndex = document.createElement('td');
            const cellLog = document.createElement('td');

            cellIndex.textContent = index + 1;
            cellLog.textContent = entry;

            row.appendChild(cellIndex);
            row.appendChild(cellLog);
            logContainer.appendChild(row);
        });
    } else {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', '2');
        noDataCell.textContent = 'No inspections logged yet.';
        noDataCell.style.textAlign = 'center';
        noDataRow.appendChild(noDataCell);
        logContainer.appendChild(noDataRow);
    }
});