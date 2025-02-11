import { loadData, saveData } from './data-handler.js';

// Open the modal when "Add New Procedure" is clicked
document.getElementById('add-procedure-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'flex';
});

// Close the modal when the close button is clicked
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'none';
});

// Handle form submission
document.getElementById('add-procedure-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form data
    const procedureId = document.getElementById('procedure-id').value.trim();
    const procedureDesc = document.getElementById('procedure-desc').value.trim();
    const fileInput = document.getElementById('procedure-link');
    const revisionDate = document.getElementById('rev-date').value;

    if (!procedureId || !procedureDesc || !revisionDate) {
        alert("Please fill in all fields.");
        return;
    }

    // Check if a file is uploaded
    if (fileInput.files.length === 0) {
        alert("Please upload a file.");
        return;
    }

    // Get the uploaded file
    const file = fileInput.files[0];
    const fileName = file.name;

    // Generate a temporary URL for the uploaded file
    const fileURL = URL.createObjectURL(file);

    // Load existing procedures from localForage
    const procedures = await loadData('procedures') || [];

    // Create new procedure object
    const newProcedure = {
        procedureId,
        procedureDesc,
        fileURL,
        fileName,
        revisionDate
    };

    // Save procedure to localForage
    procedures.push(newProcedure);
    await saveData('procedures', procedures);

    // Add new row to the table
    const table = document.getElementById('procedures-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${procedureId}</td>
        <td>${procedureDesc}</td>
        <td><a href="${fileURL}" download="${fileName}">${fileName}</a></td>
        <td>${revisionDate}</td>
        <td>
            <button class="revise-procedure-btn" data-procedure-id="${procedureId}">Revise</button>
            <button class="retire-procedure-btn" data-procedure-id="${procedureId}">Retire</button>
        </td>
    `;

    // Release the URL when no longer needed (optional)
    setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    
    // Clear the form
    document.getElementById('add-procedure-form').reset();

    // Close the modal
    document.getElementById('add-procedure-modal').style.display = 'none';
});

// Load existing procedures from localForage when the page loads
document.addEventListener('DOMContentLoaded', async function () {
    const table = document.getElementById('procedures-table').querySelector('tbody');

    // Retrieve saved procedures from localForage
    const savedProcedures = await loadData('procedures') || [];

    // Populate the table with the saved procedures
    savedProcedures.forEach(procedure => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${procedure.procedureId}</td>
            <td>${procedure.procedureDesc}</td>
            <td><a href="${procedure.fileURL}" download="${procedure.fileName}">${procedure.fileName}</a></td>
            <td>${procedure.revisionDate}</td>
            <td>
                <button class="revise-procedure-btn" data-procedure-id="${procedure.procedureId}">Revise</button>
                <button class="retire-procedure-btn" data-procedure-id="${procedure.procedureId}">Retire</button>
            </td>
        `;
    });
});

// Handle retire action on "Retire" button click
document.getElementById('procedures-table').addEventListener('click', async function(event) {
    if (event.target.classList.contains('retire-procedure-btn')) {
        const confirmRetire = confirm("Are you sure you want to retire this document?");
        if (!confirmRetire) return;

        // Get the row that contains the "Retire" button
        const row = event.target.closest('tr');
        const procedureId = event.target.dataset.procedureId;

        // Load existing procedures from localForage
        const procedures = await loadData('procedures') || [];
        const retiredProcedures = await loadData('retiredProcedures') || [];

        // Find the procedure to retire
        const procedureToRetire = procedures.find(proc => proc.procedureId === procedureId);
        if (!procedureToRetire) return;

        // Save the retired procedure to localForage
        retiredProcedures.push(procedureToRetire);
        await saveData('retiredProcedures', retiredProcedures);

        // Remove the row from the current table
        row.remove();

        // Update the procedures list in localForage
        const updatedProcedures = procedures.filter(proc => proc.procedureId !== procedureId);
        await saveData('procedures', updatedProcedures);
    }
});

