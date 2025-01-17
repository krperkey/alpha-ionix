window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get("batchId");

    if (!batchId) {
        alert("Batch ID is missing!");
        window.location.href = "batches.html";
        return;
    }

    // Retrieve batch details from localStorage
    const batches = JSON.parse(localStorage.getItem("batches")) || [];
    const batch = batches.find((b) => b.batchId === batchId);

    if (batch) {
        // Display batch details
        document.getElementById("batch-id").textContent = batch.batchId;
        document.getElementById("analysis").textContent = batch.analysis;
        document.getElementById("date-created").textContent = batch.createdDate;
        document.getElementById("number-of-samples").textContent = batch.numberOfSamples; // Added
        document.getElementById("status").textContent = batch.status; // Added

        // Display sample results table
        const samples = JSON.parse(localStorage.getItem("sampleDataArray")) || [];
        const associatedSamples = samples.filter(sample => sample.batchId === batchId);
        const resultsTableBody = document.querySelector("#samples-results-table tbody");

        // Load previously saved results for the current batch
        const savedResultsKey = `savedBatchResults-${batchId}`;
        const savedResults = JSON.parse(localStorage.getItem(savedResultsKey)) || {};

        associatedSamples.forEach(sample => {
            // Pre-fill sample data if saved results exist
            const sampleResults = savedResults[sample.id] || {};

            // Main sample row
            const mainRow = document.createElement("tr");
            mainRow.classList.add("sample-row");
            mainRow.innerHTML = `
                <td>
                    <button class="expand-btn" data-sample-id="${sample.id}">▶</button>
                </td>
                <td>${sample.id}</td> <!-- Sample ID -->
                <td><input type="text" name="analyst-${sample.id}" value="${sampleResults.analyst || ''}" placeholder="Analyst" /></td>
                <td><input type="text" name="instrument-${sample.id}" value="${sampleResults.instrument || ''}" placeholder="Instrument" /></td>
                <td><input type="date" name="run-date-${sample.id}" value="${sampleResults.runDate || ''}" /></td>
            `;
            resultsTableBody.appendChild(mainRow);

            // Sub-row header
            const subRowHeader = document.createElement("tr");
            subRowHeader.classList.add(`sub-header-${sample.id}`, "sub-row-header");
            subRowHeader.style.display = "none"; // Initially hidden
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

            // Sub-rows for each analyte
            const analytes = sample.analytes || [];
            analytes.forEach((analyte, index) => {
                const analyteResult = sampleResults.analytes?.[index] || {};
                const analyteRow = document.createElement("tr");
                analyteRow.classList.add("analyte-row", `analyte-row-${sample.id}`);
                analyteRow.style.display = "none"; // Initially hidden
                analyteRow.innerHTML = `
                    <td></td> <!-- Empty for alignment -->
                    <td>${analyte}</td> <!-- Analyte first -->
                    <td><input type="text" name="condition-${sample.id}-${index}" value="${analyteResult.condition || ''}" placeholder="Condition" /></td>
                    <td><input type="text" name="result-${sample.id}-${index}" value="${analyteResult.result || ''}" placeholder="Result" /></td>
                    <td><input type="text" name="units-${sample.id}-${index}" value="${analyteResult.units || ''}" placeholder="Units" /></td>
                    <td><input type="number" name="initial-volume-${sample.id}-${index}" value="${analyteResult.initialVolume || ''}" step="0.01" placeholder="Initial Volume" /></td>
                    <td><input type="number" name="final-volume-${sample.id}-${index}" value="${analyteResult.finalVolume || ''}" step="0.01" placeholder="Final Volume" /></td>
                    <td><input type="number" name="dilution-${sample.id}-${index}" value="${analyteResult.dilution || ''}" step="0.01" placeholder="Dilution" /></td>
                `;
                resultsTableBody.appendChild(analyteRow);
            });

            // Add event listener for expansion
            const expandBtn = mainRow.querySelector(".expand-btn");
            expandBtn.addEventListener("click", function () {
                toggleAnalyteRows(sample.id);
            });
        });

        // Handle "Save" button click
        document.getElementById("save-results-button").addEventListener("click", function () {
            const updatedResults = {};

            // Loop through the associated samples and save their values
            associatedSamples.forEach(sample => {
                updatedResults[sample.id] = {
                    analyst: document.querySelector(`input[name="analyst-${sample.id}"]`)?.value || "",
                    instrument: document.querySelector(`input[name="instrument-${sample.id}"]`)?.value || "",
                    runDate: document.querySelector(`input[name="run-date-${sample.id}"]`)?.value || "",
                    analytes: [], // Initialize an empty array for analytes
                };

                // Loop through the sub-rows for this sample to capture analyte data
                const analytes = sample.analytes || [];
                analytes.forEach((analyte, index) => {
                    updatedResults[sample.id].analytes.push({
                        condition: document.querySelector(`input[name="condition-${sample.id}-${index}"]`)?.value || "",
                        result: document.querySelector(`input[name="result-${sample.id}-${index}"]`)?.value || "",
                        units: document.querySelector(`input[name="units-${sample.id}-${index}"]`)?.value || "",
                        initialVolume: document.querySelector(`input[name="initial-volume-${sample.id}-${index}"]`)?.value || "",
                        finalVolume: document.querySelector(`input[name="final-volume-${sample.id}-${index}"]`)?.value || "",
                        dilution: document.querySelector(`input[name="dilution-${sample.id}-${index}"]`)?.value || "",
                    });
                });
            });

            // Save the updated results for the current batch to localStorage
            localStorage.setItem(savedResultsKey, JSON.stringify(updatedResults));
            alert("Results saved successfully!");
        });

        // Handle "Submit Results" button click
        document.getElementById("submit-results-button").addEventListener("click", function () {
            batch.status = "In review";
            localStorage.setItem("batches", JSON.stringify(batches));
            alert("Batch status updated to 'In review'!");
            window.location.href = "batches.html";
        });

    } else {
        alert("Batch not found!");
        window.location.href = "batches.html";
    }
};

// Function to toggle analyte rows
function toggleAnalyteRows(sampleId) {
    const analyteRows = document.querySelectorAll(`.analyte-row-${sampleId}`);
    const subRowHeader = document.querySelector(`.sub-header-${sampleId}`);

    const isHidden = analyteRows[0]?.style.display === "none";

    // Toggle rows and header
    analyteRows.forEach(row => {
        row.style.display = isHidden ? "table-row" : "none";
    });
    if (subRowHeader) {
        subRowHeader.style.display = isHidden ? "table-row" : "none";
    }

    // Toggle the triangle direction
    const expandBtn = document.querySelector(`.expand-btn[data-sample-id="${sampleId}"]`);
    expandBtn.textContent = expandBtn.textContent === "▶" ? "▼" : "▶";
}
    
document.addEventListener("keydown", function (event) {
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