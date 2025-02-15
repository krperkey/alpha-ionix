import { loadData, saveData } from "./data-handler.js";

document.getElementById('submit-button').addEventListener('click', async function () {
    const matrixType = document.getElementById('matrix-type').value;
    const matrixTypeCode = document.getElementById('matrix-type-code').value;
    const matrixName = document.getElementById('matrix-name').value;
    const matrixNameCode = document.getElementById('matrix-name-code').value;
    const matrixDescription = document.getElementById('matrix-description').value;

    if (!matrixType || !matrixTypeCode || !matrixName || !matrixNameCode || !matrixDescription) {
        alert('Please fill out all fields.');
        return;
    }

    const matrixTypes = JSON.parse = await loadData('matrixTypes') || [];
    matrixTypes.push({ 
        type: matrixType, 
        typeCode: matrixTypeCode, 
        name: matrixName, 
        nameCode: matrixNameCode, 
        description: matrixDescription 
    });
    await saveData('matrixTypes', matrixTypes);

    alert('Matrix Type added successfully!');
    document.getElementById('matrix-type').value = '';
    document.getElementById('matrix-type-code').value = '';
    document.getElementById('matrix-name').value = '';
    document.getElementById('matrix-name-code').value = '';
    document.getElementById('matrix-description').value = '';
});

document.getElementById('matrix-types').addEventListener('click', function() {
window.location.href = 'matrix-types.html';
});