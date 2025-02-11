import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get("batchId");

    if (!batchId) {
        alert("Batch ID is missing!");
        window.location.href = "batches.html";
        return;
    }

    // Retrieve batch details from localForage
    const batches = await loadData("batches") || [];
    const batch = batches.find((b) => b.batchId === batchId);

    if (batch) {
        // Display batch details
        document.getElementById("batch-id").textContent = batch.batchId;
        document.getElementById("analysis").textContent = batch.analysis;
        document.getElementById("date-created").textContent = batch.createdDate;
        document.getElementById("number-of-samples").textContent = batch.numberOfSamples;
        document.getElementById("status").textContent = batch.status;

        // Retrieve sample data and condition codes
        const samples = await loadData("sampleDataArray") || [];
        const conditionCodes = await loadData("conditionCodes") || [];
        const associatedSamples = samples.filter(sample => sample.batchId === batchId);
        const resultsTableBody = document.querySelector("#samples-results-table tbody");

        // Load previously saved results for the current batch
        const savedResultsKey = `savedBatchResults-${batchId}`;
        const savedResults = await loadData(savedResultsKey) || {};

        associatedSamples.forEach(sample => {
            const sampleResults = savedResults[sample.id] || {};

            // Main sample row
            const mainRow = document.createElement("tr");
            mainRow.classList.add("sample-row");
            mainRow.innerHTML = `
                <td><button class="expand-btn" data-sample-id="${sample.id}">▶</button></td>
                <td>${sample.id}</td>
                <td><input type="text" name="analyst-${sample.id}" value="${sampleResults.analyst || ''}" placeholder="Analyst"; /></td>
                <td><input type="text" name="instrument-${sample.id}" value="${sampleResults.instrument || ''}" placeholder="Instrument" /></td>
                <td><input type="date" name="run-date-${sample.id}" value="${sampleResults.runDate || ''}" /></td>
                <td><input type="text" name="sample-type-${sample.id}" value="${sampleResults.sampleType || ''}" placeholder="Sample Type" /></td>
                <td><input type="checkbox" name="spiked-${sample.id}" ${sampleResults.spiked ? 'checked' : ''} /></td>
                <td><input type="text" name="standard-id-${sample.id}" value="${sampleResults.standardId || ''}" placeholder="Standard ID" /></td>
                <td><input type="text" name="spiked-amount-${sample.id}" value="${sampleResults.spikedAmount || ''}" placeholder="Spiked Amount" /></td>
            `;
            resultsTableBody.appendChild(mainRow);

            // Sub-row header
            const subRowHeader = document.createElement("tr");
            subRowHeader.classList.add(`sub-header-${sample.id}`, "sub-row-header");
            subRowHeader.style.display = "none";
            subRowHeader.innerHTML = `
                <td></td>
                <td>Analyte</td>
                <td>Condition</td>
                <td>Result</td>
                <td>Units</td>
                <td>Initial Volume</td>
                <td>Final Volume</td>
                <td>Dilution</td>
            `;
            resultsTableBody.appendChild(subRowHeader);

            /// Sub-rows for each analyte
            const conditionCodeOptionsHTML = conditionCodes
                .map(code => `<option value="${code.conditionCode}">${code.name}</option>`)
                .join("");

            const analyteRow = document.createElement("tr");
            analyteRow.classList.add("analyte-row", `analyte-row-${sample.id}`);
            analyteRow.style.display = "none";
            analyteRow.innerHTML = `
                <td></td>
                <td>${analyte}</td>
                <td><select name="condition-${sample.id}-${index}">
                    <option value="" disabled selected>Select Condition</option>
                    ${conditionCodeOptionsHTML}
                </select></td>
                <td><input type="text" name="result-${sample.id}-${index}" value="${analyteResult.result || ''}" placeholder="Result" /></td>
                <td><input type="text" name="units-${sample.id}-${index}" value="${analyteResult.units || ''}" placeholder="Units" /></td>
                <td><input type="number" name="initial-volume-${sample.id}-${index}" value="${analyteResult.initialVolume || ''}" step="0.01" placeholder="Initial Volume" /></td>
                <td><input type="number" name="final-volume-${sample.id}-${index}" value="${analyteResult.finalVolume || ''}" step="0.01" placeholder="Final Volume" /></td>
                <td><input type="number" name="dilution-${sample.id}-${index}" value="${analyteResult.dilution || ''}" step="0.01" placeholder="Dilution" /></td>
            `;
            resultsTableBody.appendChild(analyteRow);

            // Expand/Collapse event
            const expandBtn = mainRow.querySelector(".expand-btn");
            expandBtn.addEventListener("click", async function () {
                toggleAnalyteRows(sample.id);
            });
        });

        // Save results
        document.getElementById("save-results-button").addEventListener("click", async function () {
            const updatedResults = {};
            associatedSamples.forEach(sample => {
                updatedResults[sample.id] = {
                    analyst: document.querySelector(`input[name="analyst-${sample.id}"]`)?.value || "",
                    instrument: document.querySelector(`input[name="instrument-${sample.id}"]`)?.value || "",
                    runDate: document.querySelector(`input[name="run-date-${sample.id}"]`)?.value || "",
                    sampleType: document.querySelector(`input[name="sample-type-${sample.id}"]`)?.value || "",
                    spiked: document.querySelector(`input[name="spiked-${sample.id}"]`)?.checked || false,
                    standardId: document.querySelector(`input[name="standard-id-${sample.id}"]`)?.value || "",
                    spikedAmount: document.querySelector(`input[name="spiked-amount-${sample.id}"]`)?.value || "",
                    analytes: []
                };
            });

            await saveData(savedResultsKey, updatedResults);
            alert("Results saved successfully!");
        });

        // Submit results
        document.getElementById("submit-results-button").addEventListener("click", async function () {
            batch.status = "In review";
            await saveData("batches", batches);
            alert("Batch status updated to 'In review'!");
            window.location.href = "batches.html";
        });

    } else {
        alert("Batch not found!");
        window.location.href = "batches.html";
    }
};

// Toggle analyte rows
async function toggleAnalyteRows(sampleId) {
    const analyteRows = document.querySelectorAll(`.analyte-row-${sampleId}`);
    const subRowHeader = document.querySelector(`.sub-header-${sampleId}`);
    const isHidden = analyteRows[0]?.style.display === "none";

    analyteRows.forEach(row => row.style.display = isHidden ? "table-row" : "none");
    if (subRowHeader) subRowHeader.style.display = isHidden ? "table-row" : "none";

    const expandBtn = document.querySelector(`.expand-btn[data-sample-id="${sampleId}"]`);
    expandBtn.textContent = expandBtn.textContent === "▶" ? "▼" : "▶";
}
    
document.addEventListener("keydown", async function (event) {
    // Check if "Ctrl+D" is pressed
    if (event.ctrlKey && event.key.toLowerCase() === "d") {
        const activeElement = document.activeElement;

        // Ensure the active element is an input
        if (activeElement && activeElement.tagName === "INPUT") {
            const cell = activeElement.closest("td");
            const row = activeElement.closest("tr"); // Get the row containing the input
            const table = activeElement.closest("table");

            if (row && cell) {
                const columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
                const valueToFill = activeElement.value; // Get the value to fill

                if (row.classList.contains("sample-row")) {
                    // Autofill only in main rows
                    const mainRows = table.querySelectorAll(".sample-row");
                    mainRows.forEach(mainRow => {
                        const input = mainRow.children[columnIndex]?.querySelector("input");
                        if (input && input !== activeElement) {
                            input.value = valueToFill; // Autofill the value
                        }
                    });
                } else if (row.classList.contains("analyte-row")) {
                    // Autofill only in sub-rows
                    const analyteRows = table.querySelectorAll(".analyte-row");
                    analyteRows.forEach(analyteRow => {
                        const input = analyteRow.children[columnIndex]?.querySelector("input");
                        if (input && input !== activeElement) {
                            input.value = valueToFill; // Autofill the value
                        }
                    });
                }

                // Prevent the default behavior of "Ctrl+D"
                event.preventDefault();
            }
        }
    }
});