window.onload = function () {
    const testCodes = JSON.parse(localStorage.getItem("testCodes")) || [];
    const tableBody = document.querySelector("#test-code-table tbody");

    testCodes.forEach((testCode, index) => {
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

    // Remove functionality
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-btn")) {
            const index = e.target.dataset.index;
            testCodes.splice(index, 1);
            localStorage.setItem("testCodes", JSON.stringify(testCodes));
            location.reload();
        }
    });

// Edit button functionality
document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function () {
        const index = this.dataset.index;
        const testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];
        const testCode = testCodes[index];

        // Pre-fill the form with the existing data
        const analysisNameMatch = testCode.analysisId.match(/^(.*) \((.*)\)$/);
        if (analysisNameMatch) {
            document.getElementById('edit-analysis-name').value = analysisNameMatch[1];
            document.getElementById('edit-test-code-id').value = analysisNameMatch[2];
        } else {
            document.getElementById('edit-analysis-name').value = "";
            document.getElementById('edit-test-code-id').value = "";
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

        // Add functionality to remove analyte rows
        document.querySelectorAll('.remove-analyte-btn').forEach(removeButton => {
            removeButton.addEventListener('click', function () {
                const analyteIndex = this.dataset.analyteIndex;
                testCode.analytes.splice(analyteIndex, 1);
                this.closest('tr').remove();
            });
        });

        // Add functionality to add new analyte rows
        document.getElementById('add-analyte-row').addEventListener('click', function () {
            const analyteTableBody = document.querySelector('#analyte-edit-table tbody');
            const newRowIndex = analyteTableBody.rows.length;

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" id="edit-analyte-name-${newRowIndex}" placeholder="Enter analyte name"></td>
                <td><input type="text" id="edit-units-${newRowIndex}" placeholder="Enter units"></td>
                <td><input type="text" id="edit-mdl-${newRowIndex}" placeholder="Enter MDL"></td>
                <td><input type="text" id="edit-loq-${newRowIndex}" placeholder="Enter LOQ"></td>
                <td><input type="text" id="edit-initial-volume-${newRowIndex}" placeholder="Enter initial volume"></td>
                <td><input type="text" id="edit-final-volume-${newRowIndex}" placeholder="Enter final volume"></td>
                <td><input type="text" id="edit-hold-time-${newRowIndex}" placeholder="Enter hold time"></td>
                <td><input type="number" id="edit-decimal-places-${newRowIndex}" placeholder="Enter decimal places"></td>
                <td><button class="remove-analyte-btn" data-analyte-index="${newRowIndex}">Remove</button></td>
            `;
            analyteTableBody.appendChild(newRow);

            // Attach remove functionality to the new row's button
            newRow.querySelector('.remove-analyte-btn').addEventListener('click', function () {
                testCode.analytes.splice(newRowIndex, 1);
                this.closest('tr').remove();
            });
        });

        // Handle modal actions
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'block';

        document.getElementById('save-edit').onclick = function () {
            // Save updated data
            testCode.analysisId = `${document.getElementById('edit-analysis-name').value} (${document.getElementById('edit-test-code-id').value})`;
            testCode.preservationRequirements = document.getElementById('edit-preservation').value;

            testCode.analytes = Array.from(document.querySelectorAll('#analyte-edit-table tbody tr')).map((row, i) => ({
                analyteName: document.getElementById(`edit-analyte-name-${i}`).value,
                units: document.getElementById(`edit-units-${i}`).value,
                mdl: document.getElementById(`edit-mdl-${i}`).value,
                loq: document.getElementById(`edit-loq-${i}`).value,
                initialVolume: document.getElementById(`edit-initial-volume-${i}`).value,
                finalVolume: document.getElementById(`edit-final-volume-${i}`).value,
                holdTime: document.getElementById(`edit-hold-time-${i}`).value,
                decimalPlaces: document.getElementById(`edit-decimal-places-${i}`).value
            }));

            // Save back to localStorage
            testCodes[index] = testCode;
            localStorage.setItem('testCodes', JSON.stringify(testCodes));
            location.reload();
        };

        document.getElementById('cancel-edit').onclick = function () {
            modal.style.display = 'none';
        };
    });
});


    // Copy functionality
    tableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("copy-btn")) {
            const index = e.target.dataset.index;
            const testCode = testCodes[index];
            document.getElementById("copy-analysis-name").value = "";
            document.getElementById("copy-test-code-id").value = "";

            document.getElementById("save-copy").onclick = () => {
                const newAnalysisName = document.getElementById("copy-analysis-name").value.trim();
                const newTestCodeId = document.getElementById("copy-test-code-id").value.trim();
                const newTestCode = {
                    ...testCode,
                    analysisName: newAnalysisName,
                    testCodeId: newTestCodeId,
                    analysisId: `${newAnalysisName} (${newTestCodeId})`,
                };
                testCodes.push(newTestCode);
                localStorage.setItem("testCodes", JSON.stringify(testCodes));
                location.reload();
            };

            document.getElementById("copy-modal").style.display = "block";
        }

        // Handle the Cancel button in the copy modal
            document.getElementById('cancel-copy').addEventListener('click', function () {
                const copyModal = document.getElementById('copy-modal');
                copyModal.style.display = 'none';
            });

            // Optionally, handle the modal's close icon
            document.getElementById('close-copy-modal').addEventListener('click', function () {
                const copyModal = document.getElementById('copy-modal');
                copyModal.style.display = 'none';
            });
    });
};
