import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const containers = await loadData('containers') || [];
    const tableBody = document.querySelector("#container-types-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    // Populate table with container details
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
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const container = containers[index];

            document.getElementById('edit-container-type').value = container.type;
            document.getElementById('edit-container-volume').value = container.volume;
            document.getElementById('edit-container-units').value = container.units;
            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                container.type = document.getElementById('edit-container-type').value;
                container.volume = document.getElementById('edit-container-volume').value;
                container.units = document.getElementById('edit-container-units').value;

                containers[index] = container;
                await saveData('containers', containers);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Container" modal instead of navigating away
    document.getElementById('create-new-container').addEventListener('click', function () {
        document.getElementById('new-container-modal').style.display = 'block';
    });

    // Save new container
    document.getElementById('save-new-container').addEventListener('click', async function () {
        const newType = document.getElementById('new-container-type').value.trim();
        const newVolume = document.getElementById('new-container-volume').value.trim();
        const newUnits = document.getElementById('new-container-units').value.trim();

        if (!newType || !newVolume || !newUnits) {
            alert("All fields are required!");
            return;
        }

        containers.push({ type: newType, volume: newVolume, units: newUnits });
        await saveData('containers', containers);

        // Close modal and refresh page
        document.getElementById('new-container-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new container creation
    document.getElementById('cancel-new-container').addEventListener('click', function () {
        document.getElementById('new-container-modal').style.display = 'none';
    });
};
