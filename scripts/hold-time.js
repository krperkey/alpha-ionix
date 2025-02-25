import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const holdTimes = await loadData('holdTimes') || [];
    const tableBody = document.querySelector("#hold-time-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    if (holdTimes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="3">No hold times available. Create a new one!</td>`;
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
    }

    // Remove functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            holdTimes.splice(index, 1);
            await saveData('holdTimes', holdTimes);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const holdTime = holdTimes[index];

            document.getElementById('edit-hold-time').value = holdTime.holdTime;
            document.getElementById('edit-description').value = holdTime.description;
            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                holdTime.holdTime = document.getElementById('edit-hold-time').value;
                holdTime.description = document.getElementById('edit-description').value;

                holdTimes[index] = holdTime;
                await saveData('holdTimes', holdTimes);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Hold Time" modal
    document.getElementById('new-hold-time').addEventListener('click', function () {
        document.getElementById('new-hold-time-modal').style.display = 'block';
    });

    // Save new hold time
    document.getElementById('save-new-hold-time').addEventListener('click', async function () {
        const newHoldTime = document.getElementById('new-hold-time-input').value.trim();
        const newDescription = document.getElementById('new-hold-time-description').value.trim();

        if (!newHoldTime || !newDescription) {
            alert("All fields are required!");
            return;
        }

        holdTimes.push({ holdTime: newHoldTime, description: newDescription });
        await saveData('holdTimes', holdTimes);

        // Close modal and refresh page
        document.getElementById('new-hold-time-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new hold time creation
    document.getElementById('cancel-new-hold-time').addEventListener('click', function () {
        document.getElementById('new-hold-time-modal').style.display = 'none';
    });
};
