import { loadData, saveData } from './data-handler.js';

document.addEventListener('DOMContentLoaded', async function () {
    const table = document.getElementById('retired-procedures-table').querySelector('tbody');
    
    // Retrieve the retired procedures from localStorage
    const retiredProcedures = await await loadData('retiredProcedures') || [];

    // Populate the table with retired procedures
    retiredProcedures.forEach(procedure => {
        const newRow = table.insertRow();
        newRow.innerHTML = `
            <td>${procedure.procedureId}</td>
            <td>${procedure.procedureDesc}</td>
            <td><a href="${procedure.fileURL}" download="${procedure.fileName}" target="_blank">${procedure.fileName}</a></td>
            <td>${procedure.revisionDate}</td>
            <td>
                <button class="unretire-btn">Unretire</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        // "Unretire" Button Functionality
        newRow.querySelector('.unretire-btn').addEventListener('click', async function() {
            // Move procedure from retired list to procedures list
            let procedures = await loadData('procedures') || [];
            const unretiredProcedure = {
                procedureId: procedure.procedureId,
                procedureDesc: procedure.procedureDesc,
                fileURL: procedure.fileURL,
                fileName: procedure.fileName,
                revisionDate: procedure.revisionDate
            };

            // Add back to procedures list
            procedures.push(unretiredProcedure);
            await saveData('procedures', procedures);

            // Remove from retired procedures list
            let updatedRetiredProcedures = retiredProcedures.filter(p => p.procedureId !== procedure.procedureId);
            await saveData('retiredProcedures', updatedRetiredProcedures);

            // Remove the row from the retired table
            newRow.remove();
        });

        // "Delete" Button Functionality
        newRow.querySelector('.delete-btn').addEventListener('click', async function() {
            // Remove the procedure from retired procedures list permanently
            let updatedRetiredProcedures = retiredProcedures.filter(p => p.procedureId !== procedure.procedureId);
            await saveData('retiredProcedures', updatedRetiredProcedures);

            // Remove the row from the retired table
            newRow.remove();
        });
    });
});

document.getElementById('active-procedures').addEventListener('click', function() {
            window.location.href = 'procedures.html';
        });