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
    event.preventDefault(); // Prevent page refresh

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

    try {
        // Upload file to Firebase Storage and get the public URL
        const fileURL = await uploadFileToFirebase(file);

        // Save metadata to Firestore
        await saveFileMetadata(procedureId, procedureDesc, file.name, fileURL, revisionDate);

        // Update table with new entry
        addProcedureToTable(procedureId, procedureDesc, file.name, fileURL, revisionDate);

        // Clear the form
        document.getElementById('add-procedure-form').reset();

        // Close the modal
        document.getElementById('add-procedure-modal').style.display = 'none';

    } catch (error) {
        console.error("Error uploading procedure:", error);
        alert("File upload failed. Please try again.");
    }
});

// Upload file to Firebase Storage and return the file's public URL
async function uploadFileToFirebase(file) {
    const storageRef = firebase.storage().ref("procedures/" + file.name);
    const snapshot = await storageRef.put(file);
    return await snapshot.ref.getDownloadURL();
}

// Save procedure metadata to Firestore
async function saveFileMetadata(procedureId, procedureDesc, fileName, fileURL, revisionDate) {
    const db = firebase.firestore();
    await db.collection("procedures").add({
        procedureId,
        description: procedureDesc,
        fileName,
        fileURL,
        revisionDate,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Add a new procedure row to the table
function addProcedureToTable(procedureId, procedureDesc, fileName, fileURL, revisionDate) {
    const table = document.getElementById('procedures-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${procedureId}</td>
        <td>${procedureDesc}</td>
        <td><a href="${fileURL}" target="_blank">${fileName}</a></td>
        <td>${revisionDate}</td>
        <td>
            <button class="revise-procedure-btn" data-procedure-id="${procedureId}">Revise</button>
            <button class="retire-procedure-btn" data-procedure-id="${procedureId}">Retire</button>
        </td>
    `;
}

// Load existing procedures from Firestore when the page loads
document.addEventListener('DOMContentLoaded', async function () {
    const table = document.getElementById('procedures-table').querySelector('tbody');

    // Fetch procedures from Firestore
    const db = firebase.firestore();
    const snapshot = await db.collection("procedures").orderBy("timestamp", "desc").get();

    snapshot.forEach(doc => {
        const data = doc.data();
        addProcedureToTable(data.procedureId, data.description, data.fileName, data.fileURL, data.revisionDate);
    });
});

// Handle retire action on "Retire" button click
document.getElementById('procedures-table').addEventListener('click', async function(event) {
    if (event.target.classList.contains('retire-procedure-btn')) {
        const confirmRetire = confirm("Are you sure you want to retire this document?");
        if (!confirmRetire) return;

        // Get the row & procedure ID
        const row = event.target.closest('tr');
        const procedureId = event.target.dataset.procedureId;

        // Move procedure to "retiredProcedures" in Firestore
        const db = firebase.firestore();
        const snapshot = await db.collection("procedures").where("procedureId", "==", procedureId).get();

        snapshot.forEach(async doc => {
            await db.collection("retiredProcedures").add(doc.data());
            await doc.ref.delete(); // Remove from active procedures
            row.remove(); // Remove row from table
        });
    }
});

// Redirect to retired procedures page
document.getElementById('retired-procedures').addEventListener('click', function() {
    window.location.href = 'retired-procedures.html';
});


