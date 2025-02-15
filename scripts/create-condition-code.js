import { loadData, saveData } from "./data-handler.js";

document.getElementById('submit-button').addEventListener('click', async function () {
    const conditionCode = document.getElementById('condition-code').value;
    const description = document.getElementById('description').value;

    if (!conditionCode || !description) {
        alert('Please fill out all fields.');
        return;
    }

    const conditionCodes = await loadData('conditionCodes') || [];
    conditionCodes.push({ 
        conditionCode, 
        description 
    });
    await saveData('conditionCodes', conditionCodes);

    alert('Condition Code added successfully!');
    document.getElementById('condition-code').value = '';
    document.getElementById('description').value = '';
});

document.getElementById('conditionCodes').addEventListener('click', function() {
window.location.href = 'condition-codes.html';
});