import { loadData, saveData } from "./data-handler.js";

document.getElementById('submit-button').addEventListener('click', async function () {
    const holdTime = document.getElementById('hold-time').value;
    const description = document.getElementById('description').value;

    if (!holdTime || !description) {
        alert('Please fill out all fields.');
        return;
    }

    const holdTimes = await loadData('holdTimes') || [];
    holdTimes.push({ 
        holdTime, 
        description 
    });
    await saveData('holdTimes', holdTimes);

    alert('Hold Time added successfully!');
    document.getElementById('hold-time').value = '';
    document.getElementById('description').value = '';
});

document.getElementById('hold-times').addEventListener('click', function() {
window.location.href = 'hold-time.html';
});