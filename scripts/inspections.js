import { loadData, saveData } from './data-handler.js';

async function logInspection(section) {
    const allCheckboxes = document.querySelectorAll(`#${section} input[type='checkbox']`);
    const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);

    if (allChecked) {
        const now = new Date();
        const logEntry = `${section} inspection completed on ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}\n`;

        // Send the log to the inspection log page (mock example using localStorage for simplicity)
        let logData = await loadData('inspectionLogs') || '';
        logData += logEntry;
        await saveData('inspectionLogs', logData);

        alert(`Inspection for ${section} logged successfully.`);
        allCheckboxes.forEach(checkbox => checkbox.checked = false); // Reset checkboxes
    } else {
        alert('Please complete all checklist items before submitting.');
    }
}