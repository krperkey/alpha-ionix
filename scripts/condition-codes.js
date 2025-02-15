import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const conditionCodes = await loadData('conditionCodes') || [];

    const tableBody = document.querySelector("#condition-code-table tbody");

    if (conditionCodes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="5">No condition codes available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        conditionCodes.forEach((conditionCodes, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${conditionCodes.conditionCode}</td>
                <td>${conditionCodes.description}</td>
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
                conditionCodes.splice(index, 1);
                await saveData('conditionCodes', conditionCodes);
                location.reload();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const index = this.dataset.index;
                const conditionCode = conditionCodes[index];

                document.getElementById('edit-condition-code').value = conditionCode.conditionCode;
                document.getElementById('edit-description').value = conditionCode.description;

                document.getElementById('edit-modal').style.display = 'block';

                document.getElementById('save-edit').addEventListener('click', async function () {
                    conditionCode.conditionCode = document.getElementById('edit-condition-code').value;
                    conditionCode.description = document.getElementById('edit-description').value;

                    conditionCodes[index] = conditionCode;
                    await saveData('conditionCodes', conditionCodes);
                    location.reload();
                });

                document.getElementById('cancel-edit').addEventListener('click', function () {
                    document.getElementById('edit-modal').style.display = 'none';
                });
            });
        });
    }
};

document.getElementById('new-condition-code').addEventListener('click', function() {
window.location.href = 'create-condition-code.html';
});