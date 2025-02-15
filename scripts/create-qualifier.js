import { loadData, saveData } from "./data-handler.js";

document.getElementById('submit-button').addEventListener('click', async function () {
    const qualifierCode = document.getElementById('qualifier-code').value;
    const description = document.getElementById('description').value;

    if (!qualifierCode || !description) {
        alert('Please fill out all fields.');
        return;
    }

    const qualifiers = await loadData('qualifiers') || [];
    qualifiers.push({ 
        qualifierCode, 
        description 
    });
    await saveData('qualifiers', qualifiers);

    alert('Hold Time added successfully!');
    document.getElementById('qualifier-code').value = '';
    document.getElementById('description').value = '';
});

document.getElementById('qualifiers').addEventListener('click', function() {
window.location.href = 'qualifiers.html';
});