// Import localForage
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";

window.onload = async function () {
    const testCodes = (await localforage.getItem("testCodes")) || [];
    const inactiveTestCodes = (await localforage.getItem("inactiveTestCodes")) || [];
    const sampleTypes = (await localforage.getItem("sampleTypes")) || [];
    const tableBody = document.querySelector("#test-code-table tbody");

    // Populate the table with clickable IDs and properly set data-index for buttons
    testCodes.forEach((testCode, index) => {

        // Get associated QC tab names with abbreviation substitution
        const associatedQC = testCode.qcTabs && testCode.qcTabs.length > 0
            ? testCode.qcTabs
                .map(qcTab => {
                    // Match QC tab name with Sample Type Name
                    const matchingSampleType = sampleTypes.find(
                        sampleType => sampleType.typeName === qcTab.tabName
                    );
                    // Return abbreviation if match found, otherwise the original tab name
                    return matchingSampleType
                        ? matchingSampleType.typeNameAbbreviation || matchingSampleType.typeName
                        : qcTab.tabName;
                })
                .join(", ")
            : "None";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="test-code-details.html?id=${testCode.uniqueId}" class="test-code-link">${testCode.uniqueId}</a>
            </td>
            <td>${testCode.analysisId}</td>
            <td>${testCode.analytes.length}</td>
            <td>${testCode.preservationRequirements}</td>
            <td>${associatedQC}</td>
            <td>
                <button class="inactivate-btn" data-index="${index}">Inactivate</button>
                <button class="copy-btn" data-index="${index}">Copy</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Handle "Inactivate" button click
    tableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("inactivate-btn")) {
            const index = parseInt(e.target.dataset.index, 10); // Get the index from data-index
            if (!isNaN(index)) {
                const testCode = testCodes.splice(index, 1)[0]; // Remove from active list
                inactiveTestCodes.push(testCode); // Add to inactive list
                await localforage.setItem("testCodes", testCodes); // Update active list in storage
                await localforage.setItem("inactiveTestCodes", inactiveTestCodes); // Update inactive list in storage
                location.reload(); // Reload the page to update the table
            } else {
                console.error("Invalid index for inactivation.");
            }
        }
    });

    document.getElementById("create-test-code").addEventListener("click", async function () {
        window.location.href = "test-codes.html";
    });

    document.getElementById("inactive-test-code").addEventListener("click", async function () {
        window.location.href = "inactive-test-codes.html";
    });

    // Add event listener for remove functionality
    tableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("remove-btn")) {
            const index = parseInt(e.target.dataset.index, 10);
            if (!isNaN(index)) {
                testCodes.splice(index, 1);
                await localforage.setItem("testCodes", testCodes);
                location.reload();
            } else {
                console.error("Invalid index for removal.");
            }
        }
    });

    // Edit button functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            const testCodes = (await localforage.getItem("testCodes")) || [];
            const testCode = testCodes[index];

            // Pre-fill the form with the existing data
            const analysisNameMatch = testCode.analysisId.match(/^(.*) \((.*)\)$/);
            if (analysisNameMatch) {
                document.getElementById('edit-analysis-name').value = analysisNameMatch[1];
                document.getElementById('edit-reference-method').value = analysisNameMatch[2];
            } else {
                document.getElementById('edit-analysis-name').value = "";
                document.getElementById('edit-reference-method').value = "";
            }

            document.getElementById('edit-preservation').value = testCode.preservationRequirements || "";

            // Populate the analyte table dynamically
            const analyteTableContainer = document.getElementById('analyte-rows');
            analyteTableContainer.innerHTML = `
                <table id="analyte-edit-table">
                    <thead>
                        <tr>
                            <th>Analyte Name</th>
                            <th>Units</th>
                            <th>Initial Volume</th>
                            <th>Final Volume</th>
                            <th>Hold Time</th>
                            <th>Decimal Places</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${testCode.analytes.map((analyte, analyteIndex) => `
                            <tr>
                                <td><input type="text" id="edit-analyte-name-${analyteIndex}" value="${analyte.analyteName}"></td>
                                <td><input type="text" id="edit-units-${analyteIndex}" value="${analyte.units}"></td>
                                <td><input type="text" id="edit-initial-volume-${analyteIndex}" value="${analyte.initialVolume}"></td>
                                <td><input type="text" id="edit-final-volume-${analyteIndex}" value="${analyte.finalVolume}"></td>
                                <td><input type="text" id="edit-hold-time-${analyteIndex}" value="${analyte.holdTime}"></td>
                                <td><input type="number" id="edit-decimal-places-${analyteIndex}" value="${analyte.decimalPlaces}"></td>
                                <td><button class="remove-analyte-btn" data-analyte-index="${analyteIndex}">Remove</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button id="add-analyte-row">Add New Analyte</button>
            `;
            analyteTableBody.appendChild(newRow);

            // Attach remove functionality to the new row's button
            newRow.querySelector('.remove-analyte-btn').addEventListener('click', async function () {
                testCode.analytes.splice(newRowIndex, 1);
                this.closest('tr').remove();
            });
        });

        // Handle modal actions
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'block';

        // Save edits
        document.getElementById('save-edit').onclick = async function () {
            testCode.analysisId = `${document.getElementById('edit-analysis-name').value} (${document.getElementById('edit-reference-method').value})`;
            testCode.preservationRequirements = document.getElementById('edit-preservation').value;

            testCode.analytes = Array.from(document.querySelectorAll('#analyte-edit-table tbody tr')).map((row, i) => ({
                analyteName: document.getElementById(`edit-analyte-name-${i}`).value,
                units: document.getElementById(`edit-units-${i}`).value,
                initialVolume: document.getElementById(`edit-initial-volume-${i}`).value,
                finalVolume: document.getElementById(`edit-final-volume-${i}`).value,
                holdTime: document.getElementById(`edit-hold-time-${i}`).value,
                decimalPlaces: document.getElementById(`edit-decimal-places-${i}`).value
            }));

            testCodes[index] = testCode;
            await localforage.setItem("testCodes", testCodes);
            location.reload();
        };
    });
}

// Copy functionality
tableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("copy-btn")) {
        const index = e.target.dataset.index;
        const testCodes = (await localforage.getItem("testCodes")) || [];
        const testCode = testCodes[index];

        document.getElementById("save-copy").onclick = async () => {
            const newTestCode = { ...testCode };
            testCodes.push(newTestCode);
            await localforage.setItem("testCodes", testCodes);
            location.reload();
        };

        document.getElementById("copy-modal").style.display = "block";
    }
});


document.getElementById('create-test-code').addEventListener('click', async function () {
window.location.href = 'test-codes.html';
});

