import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const matrixTypes = JSON.parse = await loadData('matrixTypes') || [];

    const tableBody = document.querySelector("#matrix-types-table tbody");

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

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const index = this.dataset.index;
                matrixTypes.splice(index, 1);
                await saveData('matrixTypes', matrixTypes);
                location.reload();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const index = this.dataset.index;
                const matrixType = matrixTypes[index];

                document.getElementById('edit-matrix-type').value = matrixType.type;
                document.getElementById('edit-matrix-type-code').value = matrixType.typeCode || "";
                document.getElementById('edit-matrix-name').value = matrixType.name || "";
                document.getElementById('edit-matrix-name-code').value = matrixType.nameCode || "";
                document.getElementById('edit-description').value = matrixType.description;

                document.getElementById('edit-modal').style.display = 'block';

                document.getElementById('save-edit').addEventListener('click', async function () {
                    matrixType.type = document.getElementById('edit-matrix-type').value;
                    matrixType.typeCode = document.getElementById('edit-matrix-type-code').value;
                    matrixType.name = document.getElementById('edit-matrix-name').value;
                    matrixType.nameCode = document.getElementById('edit-matrix-name-code').value;
                    matrixType.description = document.getElementById('edit-description').value;

                    matrixTypes[index] = matrixType;
                    await saveData('matrixTypes', matrixTypes);
                    location.reload();
                });

                document.getElementById('cancel-edit').addEventListener('click', function () {
                    document.getElementById('edit-modal').style.display = 'none';
                });
            });
        });
    }
};

document.getElementById('new-matrix-type').addEventListener('click', function() {
window.location.href = 'create-matrix-type.html';
});