import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const matrixTypes = await loadData('matrixTypes') || [];
    const tableBody = document.querySelector("#matrix-types-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    if (matrixTypes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="6">No matrix types available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        matrixTypes.forEach((matrixType, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${matrixType.type}</td>
                <td>${matrixType.typeCode || "N/A"}</td>
                <td>${matrixType.name || "N/A"}</td>
                <td>${matrixType.nameCode || "N/A"}</td>
                <td>${matrixType.description}</td>
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
            matrixTypes.splice(index, 1);
            await saveData('matrixTypes', matrixTypes);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const matrixType = matrixTypes[index];

            document.getElementById('edit-matrix-type').value = matrixType.type;
            document.getElementById('edit-matrix-type-code').value = matrixType.typeCode || "";
            document.getElementById('edit-matrix-name').value = matrixType.name || "";
            document.getElementById('edit-matrix-name-code').value = matrixType.nameCode || "";
            document.getElementById('edit-description').value = matrixType.description;
            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                matrixType.type = document.getElementById('edit-matrix-type').value;
                matrixType.typeCode = document.getElementById('edit-matrix-type-code').value;
                matrixType.name = document.getElementById('edit-matrix-name').value;
                matrixType.nameCode = document.getElementById('edit-matrix-name-code').value;
                matrixType.description = document.getElementById('edit-description').value;

                matrixTypes[index] = matrixType;
                await saveData('matrixTypes', matrixTypes);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Matrix Type" modal instead of navigating away
    document.getElementById('new-matrix-type').addEventListener('click', function () {
        document.getElementById('new-matrix-type-modal').style.display = 'block';
    });

    // Save new matrix type
    document.getElementById('save-new-matrix-type').addEventListener('click', async function () {
        const newType = document.getElementById('new-matrix-type-input').value.trim();
        const newTypeCode = document.getElementById('new-matrix-type-code').value.trim();
        const newName = document.getElementById('new-matrix-name').value.trim();
        const newNameCode = document.getElementById('new-matrix-name-code').value.trim();
        const newDescription = document.getElementById('new-matrix-description').value.trim();

        if (!newType || !newTypeCode || !newName || !newNameCode || !newDescription) {
            alert("All fields are required!");
            return;
        }

        matrixTypes.push({
            type: newType,
            typeCode: newTypeCode,
            name: newName,
            nameCode: newNameCode,
            description: newDescription
        });

        await saveData('matrixTypes', matrixTypes);

        // Close modal and refresh page
        document.getElementById('new-matrix-type-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new matrix type creation
    document.getElementById('cancel-new-matrix-type').addEventListener('click', function () {
        document.getElementById('new-matrix-type-modal').style.display = 'none';
    });
};
