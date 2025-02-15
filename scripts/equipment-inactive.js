import { loadData, saveData } from "./data-handler.js";

// Load inactive data
async function loadInactiveData() {
    const savedData = await loadData("inactiveData") || [];
    if (savedData.length > 0) {
        const table = document.getElementById("inactive-equipment-table").getElementsByTagName('tbody')[0];

        savedData.forEach(item => {
            const newRow = table.insertRow();
            newRow.innerHTML = `
                <td>${item.equipmentID}</td>
                <td>${item.instrumentName}</td>
                <td>${item.model}</td>
                <td>${item.manufacturer}</td>
                <td>${item.serialNumber}</td>
                <td>${item.dateInService}</td>
                <td>${item.status}</td>
                <td>${item.description}</td>
                <td>
                    <button class="activateBtn">Activate</button>
                    <button class="deleteBtn">Delete</button>
                </td>
            `;

            newRow.querySelector('.activateBtn').onclick = function() {
                activateRow(newRow);
            };
            newRow.querySelector('.deleteBtn').onclick = function() {
                deleteRow(newRow);
            };
        });
    }
}

async function activateRow(row) {
    const cells = row.getElementsByTagName('td');
    const rowData = {
        equipmentID: cells[0].innerText,
        instrumentName: cells[1].innerText,
        model: cells[2].innerText,
        manufacturer: cells[3].innerText,
        serialNumber: cells[4].innerText,
        dateInService: cells[5].innerText,
        status: "Active",
        description: cells[7].innerText
    };

    // Remove from inactive data storage
    let inactiveData = await loadData("inactiveData") || [];
    inactiveData = inactiveData.filter(item => item.equipmentID !== rowData.equipmentID);
    await saveData("inactiveData", inactiveData);

    // Move back to active table storage
    let activeData = await loadData("instrumentationData") || [];
    activeData.push(rowData);
    await saveData("instrumentationData", activeData);

    // Remove from inactive table in the DOM
    row.remove();
}

// Delete a row (permanently removes it from localStorage and the table)
async function deleteRow(row) {
    const equipmentID = row.getElementsByTagName('td')[0].innerText;

    // Remove from inactive data storage
    let inactiveData = await loadData("inactiveData") || [];
    inactiveData = inactiveData.filter(item => item.equipmentID !== equipmentID);
    await saveData("inactiveData", inactiveData);

    // Remove from table in the DOM
    row.remove();
}



    // Update the active table in the DOM
    const activeTable = document.getElementById("equipment-table")?.getElementsByTagName('tbody')[0];
    
    // Check if we are on the active equipment page before adding to DOM
    if (activeTable) {
        const newRow = activeTable.insertRow();
        newRow.innerHTML = `
            <td>${rowData.equipmentID}</td>
            <td>${rowData.instrumentName}</td>
            <td>${rowData.model}</td>
            <td>${rowData.manufacturer}</td>
            <td>${rowData.serialNumber}</td>
            <td>${rowData.dateInService}</td>
            <td>${rowData.status}</td>
            <td>${rowData.description}</td>
            <td>
                <button class="inactivateBtn">Inactivate</button>
                <button class="editBtn">Edit</button>
            </td>
        `;

        // Attach event listeners to the new row
        newRow.querySelector('.inactivateBtn').onclick = function() {
            inactivateRow(newRow);
        };
        newRow.querySelector('.editBtn').onclick = function() {
            editRow(newRow);
        };
    }

// Load data on page load
window.onload = loadInactiveData;

document.getElementById('active-equipment').addEventListener('click', function() {
    window.location.href = 'equipment.html';
});
