import { loadData, saveData } from "./data-handler.js";

// Add a new container to localStorage when the Create button is clicked
document.getElementById('submit-button').addEventListener('click', async function () {
    const containerType = document.getElementById('container-type').value;
    const containerVolume = document.getElementById('container-volume').value;
    const containerUnits = document.getElementById('container-units').value;

    if (!containerType || !containerVolume || !containerUnits) {
        alert('Please fill out all fields.');
        return;
    }

    // ✅ Load existing containers before modifying
    const containers = (await loadData('containers')) || [];
    containers.push({ type: containerType, volume: containerVolume, units: containerUnits });

    await saveData('containers', containers); // ✅ Save updated list

    alert('Container added successfully!');
    
    // Clear input fields after submission
    document.getElementById('container-type').value = '';
    document.getElementById('container-volume').value = '';
    document.getElementById('container-units').value = '';
});

document.getElementById('back-to-containers').addEventListener('click', async function() {
    window.location.href = 'container-types.html';
});
