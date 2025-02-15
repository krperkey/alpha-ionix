import { loadData, saveData } from "./data-handler.js";

window.loadData = loadData; // ✅ Expose loadData to DevTools
window.saveData = saveData; // ✅ Expose saveData to DevTools


// Load the table data from localStorage when the page loads
async function loadTableData() {
    const savedData = await loadData("instrumentationData") || [];
    const table = document.getElementById("equipment-table").getElementsByTagName('tbody')[0];

    table.innerHTML = ""; // Clear existing table rows to prevent duplicates

    if (savedData.length > 0) {
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
        });
    }
}

// Get modal elements
const modal = document.getElementById("createNewModal");
const btn = document.getElementById("createNewBtn");
const closeBtn = document.getElementsByClassName("close-btn")[0];
const addEquipmentBtn = document.getElementById("addEquipmentBtn");
const cancelBtn = document.getElementById("cancelBtn");
let editingRow = null;  // To track the row being edited

// Show the modal when "Create New" button is clicked
btn.onclick = async function() {
    modal.style.display = "flex";  
    document.getElementById("modalTitle").innerText = "Create New Instrument";  
    addEquipmentBtn.style.display = 'block';  
    editingRow = null;  
    document.getElementById("newInstrumentForm").reset();  
}

// Close the modal when the "×" (close) button is clicked
closeBtn.onclick = async function() {
    modal.style.display = "none";  
}

// Close the modal if the user clicks outside of the modal content
window.onclick = async function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function getNextEquipmentID() {
    let currentID = parseInt(await loadData("equipmentIDCounter")) || 1;

    await saveData("equipmentIDCounter", currentID + 1); // ✅ Store the updated counter

    return "EQ" + currentID.toString().padStart(4, "0"); // ✅ Generate ID
}



// Add or edit equipment
addEquipmentBtn.onclick = async function() {
    const instrumentName = document.getElementById("instrumentName").value;
    const model = document.getElementById("model").value;
    const manufacturer = document.getElementById("manufacturer").value;
    const serialNumber = document.getElementById("serialNumber").value;
    const dateInService = document.getElementById("dateInService").value;
    const status = document.getElementById("status").value;
    const description = document.getElementById("description").value;
    const equipmentID = editingRow ? editingRow.cells[0].innerText : await getNextEquipmentID();


    if (editingRow) {
        editingRow.cells[1].innerText = instrumentName;
        editingRow.cells[2].innerText = model;
        editingRow.cells[3].innerText = manufacturer;
        editingRow.cells[4].innerText = serialNumber;
        editingRow.cells[5].innerText = dateInService;
        editingRow.cells[6].innerText = status;
        editingRow.cells[7].innerText = description;
    } else {
        const table = document.getElementById("equipment-table").getElementsByTagName('tbody')[0];
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${equipmentID}</td>
            <td>${instrumentName}</td>
            <td>${model}</td>
            <td>${manufacturer}</td>
            <td>${serialNumber}</td>
            <td>${dateInService}</td>
            <td>${status}</td>
            <td>${description}</td>
            <td>
                <button class="inactivateBtn">Inactivate</button>
                <button class="editBtn">Edit</button>
            </td>
        `;

        newRow.querySelector('.inactivateBtn').onclick = function() {
            inactivateRow(newRow);
        };
        newRow.querySelector('.editBtn').onclick = function() {
            editRow(newRow);
        };
    }

    await saveTableData();
    modal.style.display = "none";
    document.getElementById("newInstrumentForm").reset();  
    editingRow = null;  
}

// Cancel button closes the modal
cancelBtn.onclick = function() {
    modal.style.display = "none";  
    document.getElementById("newInstrumentForm").reset();  
    editingRow = null;  
}

// Save table data to localStorage
async function saveTableData() {
    const rows = document.querySelectorAll("#equipment-table tbody tr");
    const data = Array.from(rows).map(row => {
        const cells = row.getElementsByTagName("td");
        return {
            equipmentID: cells[0].innerText,
            instrumentName: cells[1].innerText,
            model: cells[2].innerText,
            manufacturer: cells[3].innerText,
            serialNumber: cells[4].innerText,
            dateInService: cells[5].innerText,
            status: cells[6].innerText,
            description: cells[7].innerText
        };
    });

    console.log("✅ Saving Instruments:", data); // Debugging

    await saveData("instrumentationData", data);
}


// Inactivate a row
async function inactivateRow(row) {
    const cells = row.getElementsByTagName('td');
    const rowData = {
        equipmentID: cells[0].innerText,
        instrumentName: cells[1].innerText,
        model: cells[2].innerText,
        manufacturer: cells[3].innerText,
        serialNumber: cells[4].innerText,
        dateInService: cells[5].innerText,
        status: "Inactive",
        description: cells[7].innerText
    };

    row.remove();
    await saveTableData();

    let inactiveData = await loadData("inactiveData") || [];
    inactiveData.push(rowData);
    await saveData("inactiveData", inactiveData);
}

// Edit a row
async function editRow(row) {
    const cells = row.getElementsByTagName('td');
    document.getElementById("instrumentName").value = cells[1].innerText;
    document.getElementById("model").value = cells[2].innerText;
    document.getElementById("manufacturer").value = cells[3].innerText;
    document.getElementById("serialNumber").value = cells[4].innerText;
    document.getElementById("dateInService").value = cells[5].innerText;
    document.getElementById("status").value = cells[6].innerText;
    document.getElementById("description").value = cells[7].innerText;

    editingRow = row; // Track the row being edited
    document.getElementById("modalTitle").innerText = "Edit Instrument";
    modal.style.display = "flex";  // ✅ Ensure modal opens
    addEquipmentBtn.style.display = 'block';  // ✅ Show "Add Equipment" to update entry
}

// Load table data
window.onload = async function() {
    await loadTableData();
};

document.getElementById('inactive-equipment').addEventListener('click', function() {
    window.location.href = 'equipment-inactive.html';
});

