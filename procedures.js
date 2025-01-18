// Open the modal when "Add New User" is clicked
document.getElementById('add-procedure-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'flex';
});

// Close the modal when the close button is clicked
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('add-procedure-modal').style.display = 'none';
});

// Handle form submission
document.getElementById('add-procedure-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form data
    const procedureId = document.getElementById('procedure-id').value;
    const procedureDesc = document.getElementById('procedure-desc').value;
    const fileInput = document.getElementById('procedure-link');
    const revisionDate = document.getElementById('rev-date').value;

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

    // Add new row to the table
    const table = document.getElementById('procedures-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${procedureId}</td>
        <td>${procedureDesc}</td>
        <td><a href="${fileURL}" download="${fileName}">${fileName}</a></td>
        <td>${revisionDate}</td>
        <td>
            <button>Revise</button>
            <button>Retire</button>
        </td>
    `;

    // Save to localStorage
    let procedures = JSON.parse(localStorage.getItem('procedures')) || [];
    const newProcedure = {
        procedureId,
        procedureDesc,
        fileURL,
        fileName,
        revisionDate
    };
    procedures.push(newProcedure);
    localStorage.setItem('procedures', JSON.stringify(procedures));

    // Release the URL when no longer needed (optional)
    setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    
    // Clear the form
    document.getElementById('add-procedure-form').reset();

    // Close the modal
    document.getElementById('add-procedure-modal').style.display = 'none';
});

// Load existing procedures from localStorage when the page loads
document.addEventListener('DOMContentLoaded', function () {
    const table = document.getElementById('procedures-table').querySelector('tbody');
    
    // Retrieve saved procedures from localStorage
    const savedProcedures = JSON.parse(localStorage.getItem('procedures')) || [];

    // Populate the table with the saved procedures
    savedProcedures.forEach(procedure => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${procedure.procedureId}</td>
            <td>${procedure.procedureDesc}</td>
            <td><a href="${procedure.fileURL}" download="${procedure.fileName}">${procedure.fileName}</a></td>
            <td>${procedure.revisionDate}</td>
            <td>
                <button>Revise</button>
                <button>Retire</button>
            </td>
        `;
    });
});

// Handle retire action on "Retire" button click
document.getElementById('procedures-table').addEventListener('click', function(event) {
    if (event.target.textContent === 'Retire') {
        // Confirm if the user wants to retire the procedure
        const confirmRetire = confirm("Are you sure you want to retire this document?");
        if (confirmRetire) {
            // Get the row that contains the "Retire" button
            const row = event.target.closest('tr');
            
            // Get the data from the row (procedureId, procedureDesc, fileURL, fileName, revisionDate)
            const procedureId = row.cells[0].textContent;
            const procedureDesc = row.cells[1].textContent;
            const fileURL = row.cells[2].querySelector('a').href;
            const fileName = row.cells[2].querySelector('a').textContent;
            const revisionDate = row.cells[3].textContent;

            // Save the retired procedure to localStorage
            let retiredProcedures = JSON.parse(localStorage.getItem('retiredProcedures')) || [];
            const retiredProcedure = {
                procedureId,
                procedureDesc,
                fileURL,
                fileName,
                revisionDate
            };
            retiredProcedures.push(retiredProcedure);
            localStorage.setItem('retiredProcedures', JSON.stringify(retiredProcedures));

            // Remove the row from the current table
            row.remove();

            // Update the procedures list in localStorage
            const procedures = JSON.parse(localStorage.getItem('procedures')) || [];
            const updatedProcedures = procedures.filter(procedure => procedure.procedureId !== procedureId);
            localStorage.setItem('procedures', JSON.stringify(updatedProcedures));
        }
    }
});
