import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const holdTimes = await loadData('holdTimes') || [];

    const tableBody = document.querySelector("#hold-time-table tbody");

    if (holdTimes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="5">No hold times available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        holdTimes.forEach((holdTime, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${holdTime.holdTime}</td>
                <td>${holdTime.description}</td>
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
                holdTimes.splice(index, 1);
                await saveData('holdTimes', holdTimes);
                location.reload();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const index = this.dataset.index;
                const holdTime = holdTimes[index];

                document.getElementById('edit-hold-time').value = holdTime.holdTime;
                document.getElementById('edit-description').value = holdTime.description;

                document.getElementById('edit-modal').style.display = 'block';

                document.getElementById('save-edit').addEventListener('click', async function () {
                    holdTime.holdTime = document.getElementById('edit-hold-time').value;
                    holdTime.description = document.getElementById('edit-description').value;

                    holdTimes[index] = holdTime;
                    await saveData('holdTimes', holdTimes);
                    location.reload();
                });

                document.getElementById('cancel-edit').addEventListener('click', function () {
                    document.getElementById('edit-modal').style.display = 'none';
                });
            });
        });
    }
};

document.getElementById('new-hold-time').addEventListener('click', function() {
window.location.href = 'create-hold-time.html';
});