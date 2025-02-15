import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get("batchId");

    if (!batchId) {
        alert("Batch ID is missing!");
        window.location.href = "batches.html";
        return;
    }

    // ✅ Load previously saved results
    const savedResultsKey = `savedBatchResults-${batchId}`;
    const savedResults = await loadData(savedResultsKey) || [];
    console.log("🔄 Loaded Saved Results:", savedResults);

    // Retrieve batch details from localStorage
    const batches = await loadData("batches") || [];
    const batch = batches.find((b) => b.batchId === batchId);

    if (batch) {
    // Display batch details
    const batchIdElement = document.getElementById("batch-id");
    batchIdElement.innerHTML = `<a href="batch-details.html?batchId=${batch.batchId}" style="text-decoration: none; color: inherit;">${batch.batchId}</a>`; // Make it a clickable link

    document.getElementById("analysis").textContent = batch.analysis;
    document.getElementById("date-created").textContent = batch.createdDate;
    document.getElementById("number-of-samples").textContent = batch.numberOfSamples; // Added
    document.getElementById("status").textContent = batch.status; // Added
    
        // Display sample results table
        const samples = await loadData("sampleDataArray") || [];
        const associatedSamples = samples.filter(sample => sample.batchId === batchId);
        const resultsTableBody = document.querySelector("#samples-results-table tbody");

        // **Retrieve Analyst Initials from localStorage**
        const analystInitials = await loadData("analystInitials") || [];

        // **Retrieve instrument names from localStorage**
        const instrumentName = await loadData("instrumentationData") || [];

        // **Retrieve Qualifiers names from localStorage**
        const qualifiers = await loadData("qualifiers") || [];

        const standards = await loadData('standards') || [];

        const conditionCodes = await loadData("conditionCodes") || [];

        // **Get the correct test code based on batch analysis**
        const testCodes = await loadData("testCodes") || [];
        const matchedTestCode = testCodes.find(tc => tc.analysisId === batch.analysis);

        // **Retrieve the corresponding test code details**
        let analyteDetailsMap = {};
        if (matchedTestCode) {
            const testCodeDetails = await loadData("testCodes") || [];
            const matchedDetails = testCodeDetails.find(tc => tc.uniqueId === matchedTestCode.uniqueId);

            if (matchedDetails) {
            // ✅ FIX: Extract Units from Analytes tab
            if (matchedDetails.analytes) {
                matchedDetails.analytes.forEach(analyte => {
                    if (!analyteDetailsMap[analyte.analyteName]) {
                        analyteDetailsMap[analyte.analyteName] = {
                            units: analyte.units || "",
                            initialVolume: analyte.initialVolume || "",
                            finalVolume: analyte.finalVolume || "",
                            mdl: "",
                            loq: ""
                        };
                    }
                });
            }

            // ✅ FIX: Extract MDL & LOQ from Method Blank Tab
            const methodBlankTab = matchedDetails.qcTabs.find(tab => tab.tabName === "Method Blank");

            if (methodBlankTab && methodBlankTab.rows) {
                methodBlankTab.rows.forEach(row => {
                    if (analyteDetailsMap[row.analyteName]) {
                        analyteDetailsMap[row.analyteName].mdl = row.mdl || "";
                        analyteDetailsMap[row.analyteName].loq = row.loq || "";
                    }
                });
            }
        }
    }

    associatedSamples.forEach((sample, index) => {
    // Insert the repeated header row, but skip it for the first row (index 0)
    if (index !== 0) {
    const repeatedHeaderRow = document.createElement("tr");
    repeatedHeaderRow.classList.add("repeated-header-row", `header-row-${sample.id}`);
    repeatedHeaderRow.style.display = "none";  // Hide by default
    repeatedHeaderRow.innerHTML = `
        <th></th> <!-- Expansion button column -->
        <th>Sample ID</th>
        <th>Sample Type</th>
        <th>Analyst</th>
        <th>Instrument</th>
        <th>Run Date</th>
        <th>Spiked?</th>
        <th>Diluted First?</th>
        <th>Standard ID</th>
        <th>Spiked Volume</th>
        <th>Spiked Units</th>
        <th>Comments</th>
    `;
    resultsTableBody.appendChild(repeatedHeaderRow);
    }

    // Load saved results or use defaults
    const sampleResults = savedResults.find(res => res.id === sample.id) || {};


    // Main sample row
    const mainRow = document.createElement("tr");
    mainRow.classList.add("sample-row");

    // **Generate dropdown options asynchronously**
    const analystOptionsHTML = analystInitials
    .map(initials => `<option value="${initials}">${initials}</option>`)
    .join("");

    const instrumentOptionsHTML = instrumentName
    .map(instrument => `<option value="${instrument.instrumentName}">${instrument.instrumentName}</option>`)
    .join("");

    const standardOptionsHTML = standards
    .map(standard => `<option value="${standard.id}">${standard.id}</option>`)
    .join("");

    mainRow.innerHTML = `
        <td>
            <button class="expand-btn" data-sample-id="${sample.id}">▶</button>
        </td>
        <td><a href="sample-details.html?id=${sample.id}">${sample.id}</a></td>
        <td>${sample.sampleType}</td>
        <td>
            <select name="analyst-${sample.id}">
                <option value="" disabled>Select Analyst</option>
                ${analystOptionsHTML.replace(
                    `<option value="${sampleResults.analyst}">`,
                    `<option value="${sampleResults.analyst}" selected>`
                )}
            </select>
        </td>
        <td>
            <select name="instrument-${sample.id}">
                <option value="" disabled>Select Instrument</option>
                ${instrumentOptionsHTML.replace(
                    `<option value="${sampleResults.instrument}">`,
                    `<option value="${sampleResults.instrument}" selected>`
                )}
            </select>
        </td>
        <td><input type="date" name="run-date-${sample.id}" value="${sampleResults.runDate || ""}" /></td>
        <td>
        <select name="spiked-${sample.id}">
            <option value="No" ${sampleResults.spiked === false ? 'selected' : ''}>No</option>
            <option value="Yes" ${sampleResults.spiked === true ? 'selected' : ''}>Yes</option>
        </select>
        </td>
        <td>
            <select name="diluted-first-${sample.id}">
                <option value="No" ${sampleResults.dilutedFirst === false ? 'selected' : ''}>No</option>
                <option value="Yes" ${sampleResults.dilutedFirst === true ? 'selected' : ''}>Yes</option>
            </select>
        </td>
        <td>
            <select name="standard-id-${sample.id}">
                <option value="" disabled>Select Standard</option>
                ${standardOptionsHTML.replace(
                    `<option value="${sampleResults.standard}">`,
                    `<option value="${sampleResults.standard}" selected>`
                )}
            </select>
        </td>
        <td><input type="text" name="spiked-amount-${sample.id}" value="${sampleResults.spikedAmount || ''}" placeholder="Spiked Volume" /></td> <!-- New -->
        <td><input type="text" name="spiked-units-${sample.id}" value="${sampleResults.spikedUnits || ''}" placeholder="Spiked Units" /></td> <!-- New -->
        <td><input type="text" name="sample-comments-${sample.id}" value="${sampleResults.comments || ""}" placeholder="Sample Comments" /></td>
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
        <td>Raw Result</td>
        <td>Units</td>
        <td>MDL</td>
        <td>LOQ</td>
        <td>Initial Volume</td>
        <td>Final Volume</td>
        <td>Post Prep Dil</td>
        <td>Data Qualifier</td>
        <td>Comments</td>
    `;
    resultsTableBody.appendChild(subRowHeader);

    const analytes = sample.analytes || [];
analytes.forEach((analyte, index) => {
    // Sub-rows for each analyte
    const analyteResult = sampleResults.analytes?.[index] || {};
    const analyteInfo = analyteDetailsMap[analyte] || { units: "", mdl: "", loq: "" };

    const analyteRow = document.createElement("tr");
    analyteRow.classList.add("analyte-row", `analyte-row-${sample.id}`);
    analyteRow.style.display = "none"; // Initially hidden

    // ✅ Generate dropdown options correctly
    const conditionCodeOptionsHTML = conditionCodes
        .map(code => `<option value="${code.conditionCode}" ${code.conditionCode === analyteResult.condition ? "selected" : ""}>${code.conditionCode}</option>`)
        .join("");

    const qualifierOptionsHTML = qualifiers
        .map(qualifier => `<option value="${qualifier.qualifierCode}" ${qualifier.qualifierCode === analyteResult.qualifier ? "selected" : ""}>${qualifier.qualifierCode}</option>`)
        .join("");

    // ✅ Ensure saved values are restored on reload
    analyteRow.innerHTML = `
        <td></td>
        <td>${analyte}</td>
        <td>
            <select name="condition-${sample.id}-${index}">
                <option value="" disabled>Select Condition Code</option>
                ${conditionCodeOptionsHTML}
            </select>
        </td>
        <td><input type="text" name="result-${sample.id}-${index}" value="${analyteResult.result || ""}" placeholder="Result" /></td>
        <td><input type="text" name="units-${sample.id}-${index}" value="${analyteInfo.units}" readonly /></td>
        <td><input type="text" name="mdl-${sample.id}-${index}" value="${analyteInfo.mdl}" readonly /></td>
        <td><input type="text" name="loq-${sample.id}-${index}" value="${analyteInfo.loq}" readonly /></td>
        <td><input type="text" name="initial-volume-${sample.id}-${index}" value="${analyteResult.initialVolume || analyteInfo.initialVolume || ""}" /></td>
        <td><input type="text" name="final-volume-${sample.id}-${index}" value="${analyteResult.finalVolume || analyteInfo.finalVolume || ""}" /></td>
        <td><input type="number" name="dilution-${sample.id}-${index}" value="${analyteResult.dilution || "1"}" placeholder="Dilution" /></td>
        <td>
            <select name="qualifier-${sample.id}-${index}">
                <option value="" disabled>Select Qualifier</option>
                ${qualifierOptionsHTML}
            </select>
        </td>
        <td><input type="text" name="comments-${sample.id}-${index}" value="${analyteResult.comments || ""}" placeholder="Analyte Comments" /></td>
    `;

    resultsTableBody.appendChild(analyteRow);
});

            // Add an empty row after the last analyte-row
            if (analytes.length > 0) {
                const spacerRow = document.createElement("tr");
                spacerRow.classList.add("spacer-row");
                spacerRow.innerHTML = `<td colspan="12" style="height: 5px; border: none;"></td>`;
                resultsTableBody.appendChild(spacerRow);
            }

            // Add event listener for expansion
            const expandBtn = mainRow.querySelector(".expand-btn");
            expandBtn.addEventListener("click", async function () {
                await toggleAnalyteRows(sample.id);
            });
        });

        document.getElementById("save-results-button").addEventListener("click", async function () {
            const urlParams = new URLSearchParams(window.location.search);
            const batchId = urlParams.get("batchId");
        
            if (!batchId) {
                alert("Batch ID is missing!");
                return;
            }
        
            const savedResultsKey = `savedBatchResults-${batchId}`;
            
            // 🔽 Load existing results (ensure it's an array)
            let savedResultsArray = await loadData(savedResultsKey);
            if (!Array.isArray(savedResultsArray)) {
                savedResultsArray = [];  // If not an array, initialize it
            }
        
            const updatedResults = [];
        
            const samples = await loadData("sampleDataArray") || [];
            const associatedSamples = samples.filter(sample => sample.batchId === batchId);
        
            associatedSamples.forEach(sample => {
                const sampleData = {
                    id: sample.id,
                    analyst: document.querySelector(`select[name="analyst-${sample.id}"]`)?.value || "",
                    instrument: document.querySelector(`select[name="instrument-${sample.id}"]`)?.value || "",
                    runDate: document.querySelector(`input[name="run-date-${sample.id}"]`)?.value || "",
                    spiked: document.querySelector(`select[name="spiked-${sample.id}"]`)?.value === "Yes",
                    dilutedFirst: document.querySelector(`select[name="diluted-first-${sample.id}"]`)?.value === "Yes",
                    standard: document.querySelector(`select[name="standard-id-${sample.id}"]`)?.value || "",
                    spikedAmount: document.querySelector(`input[name="spiked-amount-${sample.id}"]`)?.value || "",
                    spikedUnits: document.querySelector(`input[name="spiked-units-${sample.id}"]`)?.value || "",
                    comments: document.querySelector(`input[name="sample-comments-${sample.id}"]`)?.value || "",
                    analytes: []
                };
        
                // Save data for each analyte in this sample
                const analytes = sample.analytes || [];
                analytes.forEach((anlayte, index) => {
                    sampleData.analytes.push({
                        condition: document.querySelector(`select[name="condition-${sample.id}-${index}"]`)?.value || "",
                        result: document.querySelector(`input[name="result-${sample.id}-${index}"]`)?.value || "",
                        units: document.querySelector(`input[name="units-${sample.id}-${index}"]`)?.value || "",
                        mdl: document.querySelector(`input[name="mdl-${sample.id}-${index}"]`)?.value || "",
                        loq: document.querySelector(`input[name="loq-${sample.id}-${index}"]`)?.value || "",
                        initialVolume: document.querySelector(`input[name="initial-volume-${sample.id}-${index}"]`)?.value || "",
                        finalVolume: document.querySelector(`input[name="final-volume-${sample.id}-${index}"]`)?.value || "",
                        dilution: document.querySelector(`input[name="dilution-${sample.id}-${index}"]`)?.value || "",
                        qualifier: document.querySelector(`select[name="qualifier-${sample.id}-${index}"]`)?.value || "",
                        comments: document.querySelector(`input[name="comments-${sample.id}-${index}"]`)?.value || ""
                    });
                });
        
                updatedResults.push(sampleData);
            });
        
            // 🔽 Replace the old results array with the new one
            await saveData(savedResultsKey, updatedResults);
        
            console.log("✅ Results Saved as Array:", updatedResults);
            alert("Results have been saved successfully!");
        });
        


        // Handle "Submit Results" button click
        document.getElementById("submit-results-button").addEventListener("click", async function () {
            batch.status = "In review";
            await saveData("batches", batches);
            alert("Batch status updated to 'In review'!");
            window.location.href = "batches.html";
        });

        document.getElementById("complete-review-button").addEventListener("click", async function() {
                    batch.status = "Complete";
                    await saveData("batches", batches);
                    document.getElementById("status").textContent = "Complete";
                    alert("Batch status updated to 'Complete'!");
                });

    } else {
        alert("Batch not found!");
        window.location.href = "batches.html";
    }
};

// Function to toggle analyte rows
async function toggleAnalyteRows(sampleId) {
    const analyteRows = document.querySelectorAll(`.analyte-row-${sampleId}`);
    const subRowHeader = document.querySelector(`.sub-header-${sampleId}`);
    const repeatedHeaderRow = document.querySelector(`.header-row-${sampleId}`);

    const isHidden = analyteRows[0]?.style.display === "none";

    // Toggle rows and header
    analyteRows.forEach(row => {
        row.style.display = isHidden ? "table-row" : "none";
    });

    if (subRowHeader) {
        subRowHeader.style.display = isHidden ? "table-row" : "none";
    }

    if (repeatedHeaderRow) {
        repeatedHeaderRow.style.display = isHidden ? "table-row" : "none";
    }

    // Toggle the triangle direction
    const expandBtn = document.querySelector(`.expand-btn[data-sample-id="${sampleId}"]`);
    expandBtn.textContent = expandBtn.textContent === "▶" ? "▼" : "▶";
}

        document.addEventListener("keydown", function (event) {
    // Check if "Ctrl+D" is pressed
    if (event.ctrlKey && event.key.toLowerCase() === "d") {
        const activeElement = document.activeElement;

        // Ensure the active element is an input or select element
        if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "SELECT")) {
            const cell = activeElement.closest("td");
            const row = activeElement.closest("tr"); // Get the row containing the element
            const table = activeElement.closest("table");

            if (row && cell) {
                const columnIndex = Array.from(cell.parentElement.children).indexOf(cell);
                const valueToFill = activeElement.value; // Get the value to fill

                if (row.classList.contains("sample-row")) {
                    // Autofill only in main rows
                    const mainRows = table.querySelectorAll(".sample-row");
                    mainRows.forEach(mainRow => {
                        const element = mainRow.children[columnIndex]?.querySelector("input, select");
                        if (element && element !== activeElement) {
                            element.value = valueToFill; // Autofill the value
                        }
                    });
                } else if (row.classList.contains("analyte-row")) {
                    // Autofill only in sub-rows
                    const analyteRows = table.querySelectorAll(".analyte-row");
                    analyteRows.forEach(analyteRow => {
                        const element = analyteRow.children[columnIndex]?.querySelector("input, select");
                        if (element && element !== activeElement) {
                            element.value = valueToFill; // Autofill the value
                        }
                    });
                }

                // Prevent the default behavior of "Ctrl+D"
                event.preventDefault();
            }
        }
    }
});
    
    document.getElementById("view-qc").addEventListener("click", async function () {
        const urlParams = new URLSearchParams(window.location.search);
        const batchId = urlParams.get("batchId");

        if (!batchId) {
            alert("Batch ID is missing!");
            return;
        }

        // Retrieve necessary data from localStorage
        const samples = await loadData("sampleDataArray") || [];
        const standards = await loadData("standards") || []; // Standards data
        const associatedSamples = samples.filter(sample => sample.batchId === batchId && sample.sampleType !== "SAM");
        const savedResultsKey = `savedBatchResults-${batchId}`;
        const savedResults = await loadData(savedResultsKey) || {};
        const testCodes = await loadData("testCodes") || [];
        const batch = (await loadData("batches")) || [].find(b => b.batchId === batchId);
        const matchedTestCode = testCodes.find(tc => tc.analysisId === batch.analysis);

        // Create analyte details map based on test code
        let analyteDetailsMap = {};
        if (matchedTestCode) {
            const matchedDetails = testCodes.find(tc => tc.uniqueId === matchedTestCode.uniqueId);
            if (matchedDetails && matchedDetails.analytes) {
                matchedDetails.analytes.forEach(analyte => {
                    analyteDetailsMap[analyte.analyteName] = {
                        units: analyte.units || "",
                        initialVolume: analyte.initialVolume || "",
                        finalVolume: analyte.finalVolume || "",
                        mdl: "",
                        loq: "",
                        lowerLimit: "",
                        upperLimit: "",
                        precision: ""
                    };
                });

                // Add QC data for control limits
                matchedDetails.qcTabs.forEach(tab => {
                    tab.rows.forEach(row => {
                        if (analyteDetailsMap[row.analyteName]) {
                            if (tab.tabName === "Method Blank") {
                                analyteDetailsMap[row.analyteName].mdl = row.mdl || "";
                                analyteDetailsMap[row.analyteName].loq = row.loq || "";
                            } else if (tab.tabName === "Laboratory Control Sample") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                            } else if (tab.tabName === "Certified Reference Material") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                            } else if (tab.tabName === "Matrix Spike") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                            } else if (tab.tabName === "Laboratory Control Sample Duplicate") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                                analyteDetailsMap[row.analyteName].precision = row.precision || "";
                            } else if (tab.tabName === "Matrix Spike Duplicate") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                                analyteDetailsMap[row.analyteName].precision = row.precision || "";
                            } else if (tab.tabName === "Sample Duplicate") {
                                analyteDetailsMap[row.analyteName].lowerLimit = row.lowerLimit || "";
                                analyteDetailsMap[row.analyteName].upperLimit = row.upperLimit || "";
                                analyteDetailsMap[row.analyteName].precision = row.precision || "";
                            }
                        }
                    });
                });
            }
        }

        // Populate modal table
        const modalTable = document.querySelector("#qc-results-modal-table");
        const modalTableBody = modalTable.querySelector("tbody");
        modalTableBody.innerHTML = "";  // Clear previous content

        // Populate each sample's row with a repeated header
        associatedSamples.forEach(sample => {
            const relevantControls = getRelevantControlsForSampleType(sample.sampleType, analyteDetailsMap);

            // Insert a repeated header row above each sample row
            const repeatedHeaderRow = document.createElement("tr");
            repeatedHeaderRow.classList.add("repeated-header-row");
            repeatedHeaderRow.innerHTML = `
                <th></th> <!-- Expansion button column -->
                <th>Sample ID</th>
                <th>Sample Type</th>
                <th>Analyst</th>
                <th>Instrument</th>
                <th>Run Date</th>
                <th>Spiked?</th>
                <th>Diluted First?</th>
                <th>Standard ID</th>
                <th>Spiked Volume</th>
                <th>Spiked Units</th>
                <th>Comments</th>
            `;
            modalTableBody.appendChild(repeatedHeaderRow);

            // Main sample row
            const sampleResults = savedResults[sample.id] || {};
            const sampleRow = document.createElement("tr");
            sampleRow.classList.add("sample-row");
            sampleRow.innerHTML = `
                <td><button class="expand-btn" data-sample-id="${sample.id}">▶</button></td>
                <td><a href="sample-details.html?id=${sample.id}">${sample.id}</a></td>
                <td>${sample.sampleType}</td>
                <td>${sampleResults.analyst || "N/A"}</td>
                <td>${sampleResults.instrument || "N/A"}</td>
                <td>${sampleResults.runDate || "N/A"}</td>
                <td>${sampleResults.spiked ? "Yes" : "No"}</td>
                <td>${sampleResults.dilutedFirst ? "Yes" : "No"}</td>
                <td>${sampleResults.standard || "N/A"}</td>
                <td>${sampleResults.spikedAmount || "N/A"}</td>
                <td>${sampleResults.spikedUnits || "N/A"}</td>
                <td>${sampleResults.comments || "N/A"}</td>
            `;
            modalTableBody.appendChild(sampleRow);

            // Fetch the Standard concentration for the selected standard
            const standard = standards.find(std => std.id === sampleResults.standard);
            const standardAnalyteConcentrations = standard ? Object.fromEntries(
                standard.analytes.map(analyte => [analyte.analyte, analyte.concentration])
            ) : {};

            // Sub-row header (dynamic based on relevant controls)
            const subRowHeader = document.createElement("tr");
            subRowHeader.classList.add("sub-row-header");
            subRowHeader.style.display = "none";

            // Always add the common headers
            let headerHTML = `<td></td><td>Analyte</td><td>Raw Result</td><td>Units</td><td>I-Vol</td><td>F-Vol</td><td>Post Prep Dil</td><td>Total Dil</td><td>Final Result</td><td>MDL Calc</td><td>LOQ Calc</td>`;
            relevantControls.forEach(control => {
                headerHTML += `<td>${control}</td>`;
            });

            // Conditionally add the "Standard Concentration", "Actual Concentration", and "% Recovery" headers
            if (sampleResults.standard) {
                headerHTML += `<td>Stock Std Conc</td><td>Dil Std Conc</td><td>% Rec</td><td>% RPD</td>`;
            }

            subRowHeader.innerHTML = headerHTML;
            modalTableBody.appendChild(subRowHeader);

            // Add analyte sub-rows
            const analytes = sample.analytes || [];
            analytes.forEach((analyte, index) => {
                const analyteResult = sampleResults.analytes?.[index] || {};
                const analyteInfo = analyteDetailsMap[analyte] || {};
                const standardConcentration = sampleResults.standard ? standardAnalyteConcentrations[analyte] || "N/A" : "";

                // Calculate Total Dilution
                let totalDilution = "N/A";
                if (analyteResult.initialVolume && analyteResult.finalVolume && analyteResult.dilution) {
                    const initialVolume = parseFloat(analyteResult.initialVolume);
                    const finalVolume = parseFloat(analyteResult.finalVolume);
                    const dilution = parseFloat(analyteResult.dilution);

                    if (!isNaN(initialVolume) && !isNaN(finalVolume) && !isNaN(dilution) && initialVolume > 0) {
                        totalDilution = (dilution * (finalVolume / initialVolume)).toFixed(0);
                    }
                }

                // Calculate final result
                let finalResult = "N/A";
                if (analyteResult.result && totalDilution !== "N/A") {
                    const resultValue = parseFloat(analyteResult.result);
                    const dilutionValue = parseFloat(totalDilution);

                    if (!isNaN(resultValue) && !isNaN(dilutionValue)) {
                        finalResult = (resultValue * dilutionValue).toFixed(2);
                    }
                }

                // Calculate mdl
                let mdlCalc = "N/A";
                if (analyteInfo.mdl && totalDilution !== "N/A") {
                    const mdlValue = parseFloat(analyteInfo.mdl);
                    const dilutionValue = parseFloat(totalDilution);

                    if (!isNaN(mdlValue) && !isNaN(dilutionValue)) {
                        mdlCalc = (mdlValue * dilutionValue).toFixed(2);
                    }
                }

                // Calculate loq
                let loqCalc = "N/A";
                if (analyteInfo.loq && totalDilution !== "N/A") {
                    const loqValue = parseFloat(analyteInfo.loq);
                    const dilutionValue = parseFloat(totalDilution);

                    if (!isNaN(loqValue) && !isNaN(dilutionValue)) {
                        loqCalc = (loqValue * dilutionValue).toFixed(2);
                    }
                }

                // Calculate actual concentration
                let actualConcentration = "N/A";
                if (standardConcentration !== "N/A" && sampleResults.spikedAmount && totalDilution) {
                    const spikedAmount = parseFloat(sampleResults.spikedAmount);
                    totalDilution = parseFloat(totalDilution);  // Remove 'const' to avoid re-declaring
                    const stdConcentration = parseFloat(standardConcentration);

                    if (!isNaN(spikedAmount) && !isNaN(totalDilution) && !isNaN(stdConcentration) && totalDilution > 0) {
                        actualConcentration = ((stdConcentration * spikedAmount) / totalDilution).toFixed(2);
                    }
                }

                // Calculate % recovery
                let percentRecovery = "N/A";
                let recoveryStyle = "";
                if (actualConcentration !== "N/A" && analyteResult.result) {
                    const resultValue = parseFloat(analyteResult.result);
                    const actualConcentrationValue = parseFloat(actualConcentration);

                    if (!isNaN(resultValue) && !isNaN(actualConcentrationValue) && actualConcentrationValue > 0) {
                        percentRecovery = ((resultValue / actualConcentrationValue) * 100).toFixed(2);

                        const lowerLimit = parseFloat(analyteInfo.lowerLimit);
                        const upperLimit = parseFloat(analyteInfo.upperLimit);

                        if (!isNaN(lowerLimit) && !isNaN(upperLimit)) {
                            if (percentRecovery >= lowerLimit && percentRecovery <= upperLimit) {
                                recoveryStyle = "color: #28a745; font-weight: bold;";  // Within limits
                            } else {
                                recoveryStyle = "color: #dc3545; font-weight: bold;";  // Outside limits
                            }
                        }
                    }
                }

                // Calculate % RPD
                let percentRPD = "N/A";
                let rpdStyle = "";
                if (sample.parent) {
                    const parentSample = samples.find(s => s.id === sample.parent);
                    if (parentSample) {
                        const parentAnalyteResult = (savedResults[parentSample.id]?.analytes?.[index] || {}).result || "N/A";
                        if (parentAnalyteResult !== "N/A" && analyteResult.result) {
                            const parentValue = parseFloat(parentAnalyteResult);
                            const currentValue = parseFloat(analyteResult.result);

                            if (!isNaN(parentValue) && !isNaN(currentValue) && parentValue > 0 && currentValue > 0) {
                                const average = (parentValue + currentValue) / 2;
                                const difference = Math.abs(parentValue - currentValue);
                                percentRPD = ((difference / average) * 100).toFixed(2);

                                const precision = parseFloat(analyteInfo.precision);
                                if (!isNaN(precision)) {
                                    if (Math.abs(percentRPD) <= precision) {
                                        rpdStyle = "color: #28a745; font-weight: bold;";  // Within limits
                                    } else {
                                        rpdStyle = "color: #dc3545; font-weight: bold;";  // Outside limits
                                    }
                                }
                            }
                        }
                    }
                }

                // Determine status icon for method blank based on MDL and LOQ
                let statusIcon = "";
                if (sample.sampleType === "MB" && analyteResult.result) {
                    const resultValue = parseFloat(analyteResult.result);
                    const mdlValue = parseFloat(analyteInfo.mdl);
                    const loqValue = parseFloat(analyteInfo.loq);

                    if (!isNaN(resultValue) && !isNaN(mdlValue) && !isNaN(loqValue)) {
                        if (resultValue < mdlValue && resultValue < loqValue) {
                            statusIcon = "✅";  // Green check if less than both MDL and LOQ
                        } else if (resultValue >= mdlValue && resultValue < loqValue) {
                            statusIcon = "⚠️";  // Orange caution if between MDL and LOQ
                        } else if (resultValue >= loqValue) {
                            statusIcon = "❗";  // Red exclamation if greater than or equal to LOQ
                        }
                    }
                }

                // Default status icon logic for other sample types
                if (!statusIcon) {
                    if (recoveryStyle.includes("#dc3545") || rpdStyle.includes("#dc3545")) {
                        statusIcon = "❗";
                    } else if (recoveryStyle.includes("#28a745") || rpdStyle.includes("#28a745")) {
                        statusIcon = "✅";
                    }
                }

                // Add analyte row
                const analyteRow = document.createElement("tr");
                analyteRow.classList.add("analyte-row", `analyte-row-${sample.id}`);
                analyteRow.style.display = "none";

                let rowHTML = `
                    <td>${statusIcon}</td>
                    <td>${analyte}</td>
                    <td>${analyteResult.result || "N/A"}</td>
                    <td>${analyteInfo.units || "N/A"}</td>
                    <td>${analyteResult.initialVolume || "N/A"}</td>
                    <td>${analyteResult.finalVolume || "N/A"}</td>
                    <td>${analyteResult.dilution || "N/A"}</td>
                    <td>${totalDilution}</td>
                    <td>${finalResult}</td>
                    <td>${mdlCalc}</td>
                    <td>${loqCalc}</td>
                `;

                relevantControls.forEach(control => {
                    rowHTML += `<td>${analyteInfo[control] || "N/A"}</td>`;
                });

                if (sampleResults.standard) {
                rowHTML += `
                    <td>${standardConcentration}</td>
                    <td>${actualConcentration !== "N/A" ? actualConcentration : "N/A"}</td>
                    <td style="${recoveryStyle}">${percentRecovery}</td>
                    <td style="${rpdStyle}">${percentRPD}</td>
                `;
    }

                analyteRow.innerHTML = rowHTML;
                modalTableBody.appendChild(analyteRow);
                
            });

            // Expand/collapse functionality
            sampleRow.querySelector(".expand-btn").addEventListener("click", async function () {
                const analyteRows = modalTableBody.querySelectorAll(`.analyte-row-${sample.id}`);
                const isHidden = analyteRows[0]?.style.display === "none";

                analyteRows.forEach(row => (row.style.display = isHidden ? "table-row" : "none"));
                subRowHeader.style.display = isHidden ? "table-row" : "none";
                this.textContent = isHidden ? "▼" : "▶";
            });
        });

        // Display the modal
        const modal = document.getElementById("qc-results-modal-table-container");
        modal.style.display = "block";

        // Close modal functionality
        document.getElementById('close-btn').addEventListener('click', async function () {
            document.getElementById('qc-results-modal-table-container').style.display = 'none';
        });

        // Close the modal when clicking outside the modal content
        window.addEventListener("click", async function (event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        async function getRelevantControlsForSampleType(sampleType, analyteDetails) {
            const controls = [];
            const analyteArray = Object.values(analyteDetails);

            if (sampleType === "MB") {
                if (analyteArray.some(analyte => analyte.mdl)) controls.push("mdl");
                if (analyteArray.some(analyte => analyte.loq)) controls.push("loq");
            } else if (sampleType === "LCS") {
                if (analyteArray.some(analyte => analyte.lowerLimit)) controls.push("lowerLimit");
                if (analyteArray.some(analyte => analyte.upperLimit)) controls.push("upperLimit");
            } else if (sampleType === "CRM") {
                if (analyteArray.some(analyte => analyte.lowerLimit)) controls.push("lowerLimit");
                if (analyteArray.some(analyte => analyte.upperLimit)) controls.push("upperLimit");
            } else if (sampleType === "MS") {
                if (analyteArray.some(analyte => analyte.lowerLimit)) controls.push("lowerLimit");
                if (analyteArray.some(analyte => analyte.upperLimit)) controls.push("upperLimit");
            } else if (sampleType === "LCSD") {
                if (analyteArray.some(analyte => analyte.lowerLimit)) controls.push("lowerLimit");
                if (analyteArray.some(analyte => analyte.upperLimit)) controls.push("upperLimit");
                if (analyteArray.some(analyte => analyte.precision)) controls.push("precision");
            } else if (sampleType === "MSD") {
                if (analyteArray.some(analyte => analyte.lowerLimit)) controls.push("lowerLimit");
                if (analyteArray.some(analyte => analyte.upperLimit)) controls.push("upperLimit");
                if (analyteArray.some(analyte => analyte.precision)) controls.push("precision");
            } else if (sampleType === "SAMDUP") {
                if (analyteArray.some(analyte => analyte.precision)) controls.push("precision");
            }

            return controls;
        }
    });