import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const inactiveTestCodes = await loadData("inactiveTestCodes") || [];
    const tableBody = document.querySelector("#test-code-table tbody");

    inactiveTestCodes.forEach((testCode) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="test-code-details.html?id=${testCode.uniqueId}" class="test-code-link">${testCode.uniqueId}</a>
            </td>
            <td>${testCode.analysisId}</td>
            <td>${testCode.analytes.length}</td>
            <td>${testCode.preservationRequirements}</td>
            <td>
                <button class="activate-btn">Reactivate</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    tableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("activate-btn")) {
            const rowIndex = e.target.closest("tr").rowIndex - 1; // Adjust for header
            const testCode = inactiveTestCodes.splice(rowIndex, 1)[0]; // Remove from inactive list
            const testCodes = await loadData("testCodes") || [];
            testCodes.push(testCode); // Add to active list
            await saveData("testCodes", testCodes);
            await saveData("inactiveTestCodes", inactiveTestCodes);
            location.reload(); // Refresh the page
        }
    });
};

document.getElementById('back-to-test-codes').addEventListener('click', function() {
    window.location.href = 'test-code-table.html';
});