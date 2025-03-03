import { loadData, saveData } from './data-handler.js';

// Open the modal when "Add New Procedure" is clicked
document.getElementById('add-procedure-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'flex';
});

// Close the modal when the close button is clicked
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'none';
});

// Handle adding a new procedure
document.getElementById('add-procedure-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const procedureId = document.getElementById('procedure-id').value.trim();
    const procedureDesc = document.getElementById('procedure-desc').value.trim();
    const fileInput = document.getElementById('procedure-link');
    const revisionDate = document.getElementById('rev-date').value;

    if (!procedureId || !procedureDesc || !revisionDate) {
        alert("Please fill in all fields.");
        return;
    }

    if (fileInput.files.length === 0) {
        alert("Please upload a file.");
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;
    const fileURL = URL.createObjectURL(file);

    const procedures = await loadData('procedures') || [];

    const newProcedure = {
        procedureId,
        procedureDesc,
        fileURL,
        fileName,
        revisionDate,
        revisionNumber: 1, // Start new procedures at revision 1
        status: "Active",
        pendingRevision: false // Track if a new file has been uploaded
    };

    procedures.push(newProcedure);
    await saveData('procedures', procedures);

    document.getElementById('add-procedure-modal').style.display = 'none';
    location.reload();
});

// Load procedures on page load
document.addEventListener('DOMContentLoaded', async function () {
    const table = document.getElementById('procedures-table').querySelector('tbody');
    table.innerHTML = ''; // Clear existing rows

    const savedProcedures = await loadData('procedures') || [];

    savedProcedures.forEach(procedure => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${procedure.procedureId}</td>
            <td>${procedure.procedureDesc}</td>
            <td><a href="${procedure.fileURL}" download="${procedure.fileName}">${procedure.fileName}</a></td>
            <td>${procedure.revisionDate}</td>
            <td>${procedure.revisionNumber}</td>
            <td>${procedure.status}</td>
            <td>
                <button class="revise-procedure-btn" data-procedure-id="${procedure.procedureId}">Edit</button>
                ${
                    procedure.status === "In Review"
                        ? `<button class="check-in-btn" data-procedure-id="${procedure.procedureId}">Check In</button>`
                        : ""
                }
                <button class="retire-procedure-btn" data-procedure-id="${procedure.procedureId}">Retire</button>
            </td>
        `;
    });
});

// Handle Revise, Check In, and Save Revision actions
document.getElementById('procedures-table').addEventListener('click', async function(event) {
    const procedureId = event.target.dataset.procedureId;
    if (!procedureId) return;

    const procedures = await loadData('procedures') || [];
    const procedureToRevise = procedures.find(proc => proc.procedureId === procedureId);
    if (!procedureToRevise) return;

    // Handle "Check In"
    if (event.target.classList.contains('check-in-btn')) {
        const confirmApproval = confirm("Are you sure you want to approve this revision?");
        if (!confirmApproval) return; // If user cancels, do nothing

        // If a new document was uploaded, increment the revision number
        if (procedureToRevise.pendingRevision) {
            procedureToRevise.revisionNumber += 1;
            procedureToRevise.pendingRevision = false;
        }

        procedureToRevise.status = "Active";
        await saveData('procedures', procedures);
        location.reload(); // Refresh the page to update the table
        return;
    }

    // Handle "Revise"
    if (event.target.classList.contains('revise-procedure-btn')) {
        document.getElementById('revise-procedure-id').value = procedureToRevise.procedureId;
        document.getElementById('revise-procedure-desc').value = procedureToRevise.procedureDesc;
        document.getElementById('revise-rev-date').value = procedureToRevise.revisionDate;
        document.getElementById('revise-revision-number').value = procedureToRevise.revisionNumber;
        document.getElementById('revise-status').value = procedureToRevise.status;

        document.getElementById('current-procedure-link').innerHTML = `
            <a href="${procedureToRevise.fileURL}" download="${procedureToRevise.fileName}">${procedureToRevise.fileName}</a>
        `;

        // Show "Edit" button unless the status is "In Review"
        document.getElementById('edit-button-container').innerHTML =
            procedureToRevise.status === "In Review"
                ? ""
                : `<button id="edit-procedure-btn">Edit</button>`;

        document.getElementById('revise-procedure-modal').style.display = 'flex';

        // Handle "Edit" button functionality
        if (procedureToRevise.status !== "In Review") {
            document.getElementById('edit-procedure-btn').addEventListener('click', async function () {
                procedureToRevise.status = "In Edit";
                await saveData('procedures', procedures);
                document.getElementById('revise-status').value = "In Edit";
            });
        }

        // Handle "Save Revision"
        document.getElementById('save-revision').replaceWith(document.getElementById('save-revision').cloneNode(true));
        document.getElementById('save-revision').addEventListener('click', async function () {
            const procedureDesc = document.getElementById('revise-procedure-desc').value.trim();
            const revisionDate = document.getElementById('revise-rev-date').value;
            const fileInput = document.getElementById('revise-procedure-link');

            if (!procedureDesc || !revisionDate) {
                alert("All fields are required.");
                return;
            }

            let newDocumentUploaded = false;

            if (fileInput.files.length > 0) {
                const confirmUpload = confirm("Are you sure you want to upload a new document?");
                if (confirmUpload) {
                    const file = fileInput.files[0];
                    procedureToRevise.fileURL = URL.createObjectURL(file);
                    procedureToRevise.fileName = file.name;
                    procedureToRevise.pendingRevision = true; // Mark for revision update on "Check In"
                    procedureToRevise.status = "In Review"; // Automatically change status to "In Review"
                    newDocumentUploaded = true;
                    document.getElementById('revise-status').value = "In Review";
                } else {
                    return;
                }
            }

            procedureToRevise.procedureDesc = procedureDesc;
            procedureToRevise.revisionDate = revisionDate;

            await saveData('procedures', procedures);
            document.getElementById('revise-procedure-modal').style.display = 'none';
            location.reload();
        });
    }
});

// Close Revise Modal
document.getElementById('cancel-revision').addEventListener('click', function() {
    document.getElementById('revise-procedure-modal').style.display = 'none';
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

document.getElementById('retired-procedures').addEventListener('click', function() {
    window.location.href = 'retired-procedures.html';
});


