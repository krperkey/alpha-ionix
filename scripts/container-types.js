import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const containers = await loadData('containers') || [];

    const tableBody = document.querySelector("#container-types-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    containers.forEach((container, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${container.type}</td>
            <td>${container.volume}</td>
            <td>${container.units}</td>
            <td>
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Remove functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            containers.splice(index, 1);
            await saveData('containers', containers);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            const container = containers[index];

            document.getElementById('edit-container-type').value = container.type;
            document.getElementById('edit-container-volume').value = container.volume;
            document.getElementById('edit-container-units').value = container.units;

            document.getElementById('edit-modal').style.display = 'block';

            document.getElementById('save-edit').addEventListener('click', async function () {
                container.type = await document.getElementById('edit-container-type').value;
                container.volume = await document.getElementById('edit-container-volume').value;
                container.units = await document.getElementById('edit-container-units').value;

                containers[index] = container;
                await saveData('containers', containers);
                location.reload();
            });

            document.getElementById('cancel-edit').addEventListener('click', async function () {
                document.getElementById('edit-modal').style.display = 'none';
            });
        });
    });
};

document.getElementById('create-new-container').addEventListener('click', async function() {
    window.location.href = 'create-container.html';
});