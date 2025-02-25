import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const qualifiers = await loadData('qualifiers') || [];
    const tableBody = document.querySelector("#qualifier-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    if (qualifiers.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="3">No qualifiers available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        qualifiers.forEach((qualifier, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${qualifier.qualifierCode}</td>
                <td>${qualifier.description}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Remove functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            qualifiers.splice(index, 1);
            await saveData('qualifiers', qualifiers);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const qualifier = qualifiers[index];

            document.getElementById('edit-qualifier').value = qualifier.qualifierCode;
            document.getElementById('edit-description').value = qualifier.description;
            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                qualifier.qualifierCode = document.getElementById('edit-qualifier').value;
                qualifier.description = document.getElementById('edit-description').value;

                qualifiers[index] = qualifier;
                await saveData('qualifiers', qualifiers);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Qualifier" modal instead of navigating away
    document.getElementById('new-qualifier').addEventListener('click', function () {
        document.getElementById('new-qualifier-modal').style.display = 'block';
    });

    // Save new qualifier
    document.getElementById('save-new-qualifier').addEventListener('click', async function () {
        const newQualifierCode = document.getElementById('new-qualifier-code').value.trim();
        const newDescription = document.getElementById('new-qualifier-description').value.trim();

        if (!newQualifierCode || !newDescription) {
            alert("All fields are required!");
            return;
        }

        qualifiers.push({
            qualifierCode: newQualifierCode,
            description: newDescription
        });

        await saveData('qualifiers', qualifiers);

        // Close modal and refresh page
        document.getElementById('new-qualifier-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new qualifier creation
    document.getElementById('cancel-new-qualifier').addEventListener('click', function () {
        document.getElementById('new-qualifier-modal').style.display = 'none';
    });
};
