import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const qualifiers = await loadData('qualifiers') || [];

    const tableBody = document.querySelector("#qualifier-table tbody");

    if (qualifiers.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="5">No qualifiers available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        qualifiers.forEach((qualifiers, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${qualifiers.qualifierCode}</td>
                <td>${qualifiers.description}</td>
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
                qualifiers.splice(index, 1);
                await saveData('qualifiers', qualifiers);
                location.reload();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const index = this.dataset.index;
                const qualifier = qualifiers[index];

                document.getElementById('edit-qualifier').value = qualifier.qualifierCode;
                document.getElementById('edit-description').value = qualifier.description;

                document.getElementById('edit-modal').style.display = 'block';

                document.getElementById('save-edit').addEventListener('click', async function () {
                    qualifier.qualifierCode = document.getElementById('edit-qualifier').value;
                    qualifier.description = document.getElementById('edit-description').value;

                    qualifiers[index] = qualifier;
                    await saveData('qualifiers', qualifiers);
                    location.reload();
                });

                document.getElementById('cancel-edit').addEventListener('click', function () {
                    document.getElementById('edit-modal').style.display = 'none';
                });
            });
        });
    }
};

document.getElementById('new-qualifier').addEventListener('click', function() {
window.location.href = 'create-qualifier.html';
});