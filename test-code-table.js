window.onload = function() {
    // Get the saved test codes from localStorage
    const testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];

    const tableBody = document.querySelector("#test-code-table tbody");

    testCodes.forEach((testCode, index) => {
        // Create a row for each Analysis ID
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${testCode.analysisId}</td>
            <td>${testCode.analytes.length}</td>
            <td>${testCode.preservationRequirements || "N/A"}</td>
            <td>
                <button class="edit-btn" data-index="${index}">Edit</button>
                <button class="remove-btn" data-index="${index}">Remove</button>
                <button class="copy-btn" data-index="${index}">Copy</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Remove button functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            let testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];
            testCodes.splice(index, 1); // Remove the item at the specified index
            localStorage.setItem('testCodes', JSON.stringify(testCodes));
            location.reload(); // Reload the page to update the table
        });
    });

    // Edit button functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];
            const testCode = testCodes[index];

            // Pre-fill the form with the existing data
            document.getElementById('edit-analysis-name').value = testCode.analysisId.split(' (')[0];
            document.getElementById('edit-test-code-id').value = testCode.analysisId.split(' (')[1].replace(')', '');

            document.getElementById('edit-preservation').value = testCode.preservationRequirements || "";

            // Populate the analyte table dynamically
            const analyteTableContainer = document.getElementById('analyte-rows');
            analyteTableContainer.innerHTML = `
                <table id="analyte-edit-table">
                    <thead>
                        <tr>
                            <th>Analyte Name</th>
                            <th>Units</th>
                            <th>MDL</th>
                            <th>LOQ</th>
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
                                <td><input type="text" id="edit-mdl-${analyteIndex}" value="${analyte.mdl}"></td>
                                <td><input type="text" id="edit-loq-${analyteIndex}" value="${analyte.loq}"></td>
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

            // Add new analyte row functionality
            document.getElementById('add-analyte-row').addEventListener('click', function() {
                const analyteIndex = testCode.analytes.length; // Get the current number of analytes
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><input type="text" id="edit-analyte-name-${analyteIndex}" placeholder="Enter analyte name"></td>
                    <td><input type="text" id="edit-units-${analyteIndex}" placeholder="Enter units"></td>
                    <td><input type="text" id="edit-mdl-${analyteIndex}" placeholder="Enter mdl"></td>
                    <td><input type="text" id="edit-loq-${analyteIndex}" placeholder="Enter loq"></td>
                    <td><input type="text" id="edit-initial-volume-${analyteIndex}" placeholder="Enter default initial volume"></td>
                    <td><input type="text" id="edit-final-volume-${analyteIndex}" placeholder="Enter default final volume"></td>
                    <td><input type="text" id="edit-hold-time-${analyteIndex}" placeholder="Enter hold time"></td>
                    <td><input type="number" id="edit-decimal-places-${analyteIndex}" placeholder="Enter decimal places"></td>
                    <td><button class="remove-analyte-btn" data-analyte-index="${analyteIndex}">Remove</button></td>
                `;
                document.querySelector('#analyte-edit-table tbody').appendChild(newRow);

                // Add remove functionality for the new row
                newRow.querySelector('.remove-analyte-btn').addEventListener('click', function() {
                    const analyteIndex = this.dataset.analyteIndex;
                    testCode.analytes.splice(analyteIndex, 1); // Remove the analyte at the specified index
                    this.closest('tr').remove();
                });

                // Add a blank analyte to the testCode object for saving
                testCode.analytes.push({
                    analyteName: "",
                    units: "",
                    mdl: "",
                    loq: "",
                    initialVolume: "",
                    finalVolume: "",
                    holdTime: "",
                    decimalPlaces: ""
                });
            });

            // Add remove functionality to each analyte
            document.querySelectorAll('.remove-analyte-btn').forEach(removeButton => {
                removeButton.addEventListener('click', function() {
                    const analyteIndex = this.dataset.analyteIndex;
                    testCode.analytes.splice(analyteIndex, 1); // Remove the analyte at the specified index

                    // Save the updated data back to localStorage
                    testCodes[index] = testCode;
                    localStorage.setItem('testCodes', JSON.stringify(testCodes));

                    // Refresh the table to reflect the changes
                    this.closest('tr').remove();
                });
            });

            // Show modal
            document.getElementById('edit-modal').style.display = 'block';

            // Save the edit
            document.getElementById('save-edit').onclick = function() {
                // Update the Analysis ID
                testCode.analysisId = `${document.getElementById('edit-analysis-name').value} (${document.getElementById('edit-test-code-id').value})`;

                // Update Hold Time and Preservation Requirements
                testCode.preservationRequirements = document.getElementById('edit-preservation').value;

                // Update the analytes data
                testCode.analytes = testCode.analytes.map((analyte, analyteIndex) => {
                    analyte.analyteName = document.getElementById(`edit-analyte-name-${analyteIndex}`).value;
                    analyte.units = document.getElementById(`edit-units-${analyteIndex}`).value;
                    analyte.mdl = document.getElementById(`edit-mdl-${analyteIndex}`).value;
                    analyte.loq = document.getElementById(`edit-loq-${analyteIndex}`).value;
                    analyte.initialVolume = document.getElementById(`edit-initial-volume-${analyteIndex}`).value;
                    analyte.finalVolume = document.getElementById(`edit-final-volume-${analyteIndex}`).value;
                    analyte.holdTime = document.getElementById(`edit-hold-time-${analyteIndex}`).value;
                    analyte.decimalPlaces = document.getElementById(`edit-decimal-places-${analyteIndex}`).value;
                    return analyte;
                });

                // Save the updated data back to localStorage
                testCodes[index] = testCode;
                localStorage.setItem('testCodes', JSON.stringify(testCodes));

                location.reload(); // Reload the page to show updated data
            };

            // Cancel the edit
            document.getElementById('cancel-edit').onclick = function() {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Copy button functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];
            const testCode = testCodes[index];

            // Pre-fill the form with existing analytes but clear analysis name and test code ID
            document.getElementById('copy-analysis-name').value = "";
            document.getElementById('copy-test-code-id').value = "";

            // Show the copy modal
            document.getElementById('copy-modal').style.display = 'block';

            // Save the copied test code
            document.getElementById('save-copy').onclick = function() {
                const newAnalysisName = document.getElementById('copy-analysis-name').value;
                const newTestCodeId = document.getElementById('copy-test-code-id').value;

                if (!newAnalysisName || !newTestCodeId) {
                    alert('Analysis Name and Test Code ID are required!');
                    return;
                }

                const newTestCode = {
                    analysisId: `${newAnalysisName} (${newTestCodeId.replace(/\s+/g, '')})`,
                    preservationRequirements: testCode.preservationRequirements,
                    analytes: [...testCode.analytes]
                };

                // Add the new test code to localStorage
                testCodes.push(newTestCode);
                localStorage.setItem('testCodes', JSON.stringify(testCodes));

                document.getElementById('copy-modal').style.display = 'none';
                location.reload();
            };

            // Cancel the copy
            document.getElementById('cancel-copy').onclick = function() {
                document.getElementById('copy-modal').style.display = 'none';
            };
        });
    });
};









