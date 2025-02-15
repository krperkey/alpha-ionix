import { loadData, saveData } from "./data-handler.js";

document.getElementById('submit-button').addEventListener('click', async function () {
    const sampleType = document.getElementById('sample-type').value;
    const sampleTypeAbbreviation = document.getElementById('sample-type-abbreviation').value;
    const sampleTypeName = document.getElementById('sample-type-name').value;
    const sampleTypeNameAbbreviation = document.getElementById('sample-type-name-abbreviation').value;
    const sampleDescription = document.getElementById('sample-description').value;
    const accuracy = document.getElementById('accuracy').checked;
    const precision = document.getElementById('precision').checked;
    const pql = document.getElementById('pql').checked;

    if (!sampleType || !sampleTypeAbbreviation || !sampleTypeName || !sampleTypeNameAbbreviation || !sampleDescription) {
        alert('Please fill out all fields.');
        return;
    }

    const sampleTypes = JSON.parse = await loadData('sampleTypes') || [];
    sampleTypes.push({ 
        type: sampleType, 
        typeAbbreviation: sampleTypeAbbreviation, 
        typeName: sampleTypeName, 
        typeNameAbbreviation: sampleTypeNameAbbreviation, 
        description: sampleDescription,
        accuracy: accuracy,
        precision: precision,
        pql: pql
    });
    await saveData('sampleTypes', sampleTypes);

    alert('Sample Type added successfully!');
    document.getElementById('sample-type').value = '';
    document.getElementById('sample-type-abbreviation').value = '';
    document.getElementById('sample-type-name').value = '';
    document.getElementById('sample-type-name-abbreviation').value = '';
    document.getElementById('sample-description').value = '';
    document.getElementById('accuracy').checked = false;
    document.getElementById('precision').checked = false
    document.getElementById('pql').checked = false;;
});

document.getElementById('sample-types').addEventListener('click', function() {
window.location.href = 'sample-types.html';
});