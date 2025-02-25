import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const conditionCodes = await loadData('conditionCodes') || [];
    const tableBody = document.querySelector("#condition-code-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    if (conditionCodes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="3">No condition codes available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        conditionCodes.forEach((conditionCode, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${conditionCode.conditionCode}</td>
                <td>${conditionCode.description}</td>
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
            conditionCodes.splice(index, 1);
            await saveData('conditionCodes', conditionCodes);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const conditionCode = conditionCodes[index];

            document.getElementById('edit-condition-code').value = conditionCode.conditionCode;
            document.getElementById('edit-description').value = conditionCode.description;
            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                conditionCode.conditionCode = document.getElementById('edit-condition-code').value;
                conditionCode.description = document.getElementById('edit-description').value;

                conditionCodes[index] = conditionCode;
                await saveData('conditionCodes', conditionCodes);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Condition Code" modal instead of navigating away
    document.getElementById('new-condition-code').addEventListener('click', function () {
        document.getElementById('new-condition-code-modal').style.display = 'block';
    });

    // Save new condition code
    document.getElementById('save-new-condition-code').addEventListener('click', async function () {
        const newConditionCode = document.getElementById('new-condition-code-input').value.trim();
        const newDescription = document.getElementById('new-condition-code-description').value.trim();

        if (!newConditionCode || !newDescription) {
            alert("All fields are required!");
            return;
        }

        conditionCodes.push({
            conditionCode: newConditionCode,
            description: newDescription
        });

        await saveData('conditionCodes', conditionCodes);

        // Close modal and refresh page
        document.getElementById('new-condition-code-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new condition code creation
    document.getElementById('cancel-new-condition-code').addEventListener('click', function () {
        document.getElementById('new-condition-code-modal').style.display = 'none';
    });
};
