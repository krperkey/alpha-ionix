import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const workordersArray = await loadData('workordersArray') || [];
    const workorderStatusMap = await loadData('workorderStatusMap') || {}; // Retrieve saved statuses
    const tableBody = document.getElementById('workorder-table-body');

    workordersArray.forEach((workorder, index) => {
        const workorderStatus = workorderStatusMap[workorder.id] || 'In Progress'; // Get status from the map

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="workorder-details.html?id=${workorder.id}">${workorder.id}</a></td>
            <td>${workorder.description}</td>
            <td>${workorder.clientProfile}</td>
            <td>${workorder.facilityId}</td>
            <td>${workorderStatus}</td> <!-- Display Workorder Status -->
            <td>
                <button class="delete-button" data-index="${index}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listener for delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index; // Get the index of the workorder to delete
            deleteWorkorder(index);
        });
    });
};

async function deleteWorkorder(index) {
    let workordersArray = await loadData('workordersArray') || [];

    // Remove the workorder at the specified index
    if (index >= 0 && index < workordersArray.length) {
        workordersArray.splice(index, 1); // Remove the workorder from the array
        await saveData('workordersArray', workordersArray); // Update localStorage
        refreshTable(); // Refresh the table to reflect changes
    } else {
        alert('Invalid workorder index.');
    }
}

async function refreshTable() {
    const tableBody = document.getElementById('workorder-table-body');
    tableBody.innerHTML = ''; // Clear existing rows
    const workordersArray = await loadData('workordersArray') || [];

    workordersArray.forEach((workorder, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="workorder-details.html?id=${workorder.id}">${workorder.id}</a></td>
            <td>${workorder.description}</td>
            <td>${workorder.clientProfile}</td>
            <td>${workorder.facilityId}</td>
            <td></td>
            <td>
                <button class="delete-button" data-index="${index}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Reassign event listeners for delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index; // Get the index of the workorder to delete
            deleteWorkorder(index);
        });
    });
}