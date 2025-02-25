import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const inactiveTestCodes = await loadData("inactiveTestCodes") || [];
    const tableBody = document.querySelector("#test-code-table tbody");

    inactiveTestCodes.forEach((testCode, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="test-code-details.html?id=${testCode.uniqueId}" class="test-code-link">${testCode.uniqueId}</a>
            </td>
            <td>${testCode.analysisId}</td>
            <td>${testCode.analytes.length}</td>
            <td>${testCode.preservationRequirements}</td>
            <td>
                <button class="activate-btn" data-index="${index}">Reactivate</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    tableBody.addEventListener("click", async (e) => {
        const rowIndex = e.target.closest("tr").rowIndex - 1; // Adjust for header

        // Handle reactivation
        if (e.target.classList.contains("activate-btn")) {
            const testCode = inactiveTestCodes.splice(rowIndex, 1)[0]; // Remove from inactive list
            const testCodes = await loadData("testCodes") || [];
            testCodes.push(testCode); // Add to active list
            await saveData("testCodes", testCodes);
            await saveData("inactiveTestCodes", inactiveTestCodes);
            location.reload(); // Refresh the page
        }

        // Handle deletion
        if (e.target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this test code permanently?")) {
                inactiveTestCodes.splice(rowIndex, 1); // Remove from inactive list
                await saveData("inactiveTestCodes", inactiveTestCodes);
                location.reload(); // Refresh the page
            }
        }
    });
};

// Back button event listener
document.getElementById('back-to-test-codes').addEventListener('click', function() {
    window.location.href = 'test-code-table.html';
});
