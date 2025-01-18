// Add new analyte row
document.getElementById('add-analyte-row').addEventListener('click', function () {
    const tableBody = document.querySelector("#analyte-table tbody");

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="analyte-name[]" placeholder="Enter analyte name"></td>
        <td><input type="text" name="units[]" placeholder="Enter units (e.g., mg/L)"></td>
        <td><input type="text" name="mdl[]" placeholder="Enter method detection limit"></td>
        <td><input type="text" name="loq[]" placeholder="Enter limit of quantitation"></td>
        <td><input type="text" name="initial-volume[]" placeholder="Enter default initial volume"></td>
        <td><input type="text" name="final-volume[]" placeholder="Enter default final volume"></td>
        <td><input type="text" name="hold-time[]" placeholder="Enter hold time"></td>
        <td><input type="number" name="decimal-places[]" placeholder="Enter decimal places"></td>
        <td><button type="button" class="remove-row">Remove</button></td>
    `;

    tableBody.appendChild(newRow);

    // Add event listener to the remove button in the newly added row
    newRow.querySelector('.remove-row').addEventListener('click', function () {
        tableBody.removeChild(newRow);
    });
});

// Populate the QC dropdown with sample types from localStorage
function populateQCDropdown() {
    const qcDropdown = document.getElementById('qc-sample-type-dropdown');
    const sampleTypes = JSON.parse(localStorage.getItem('sampleTypes')) || [];

    sampleTypes.forEach(sampleType => {
        if (sampleType.typeName) { // Ensure the typeName exists
            const option = document.createElement('option');
            option.value = sampleType.typeName;
            option.textContent = sampleType.typeName;
            qcDropdown.appendChild(option);
        }
    });
}

// Add QC functionality
document.getElementById('add-qc').addEventListener('click', function () {
    const qcDropdown = document.getElementById('qc-sample-type-dropdown');
    const qcSampleType = qcDropdown.value;

    if (!qcSampleType || document.querySelector(`#${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`)) {
        alert('Please select a unique QC Sample Type.');
        return;
    }

    const tabsContainer = document.getElementById('tabs');
    const tabContentContainer = document.getElementById('tab-content');

    // Create new tab button
    const newTabButton = document.createElement('button');
    newTabButton.className = 'tab-button';
    newTabButton.dataset.tab = qcSampleType.replace(/\s+/g, '-').toLowerCase();
    newTabButton.textContent = qcSampleType;
    tabsContainer.appendChild(newTabButton);

    // Create new tab content
    const newTabContent = document.createElement('section');
    newTabContent.id = `${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`;
    newTabContent.className = 'tab';

    // Copy analytes and add QC-specific fields
    const analyteRows = document.querySelectorAll("#analyte-table tbody tr");
    let qcTableHTML = `
        <h3>${qcSampleType}</h3>
        <table>
            <thead>
                <tr>
                    <th>Analyte Name</th>
                    <th>Units</th>
                    <th>Upper Control Limit</th>
                    <th>Lower Control Limit</th>
                </tr>
            </thead>
            <tbody>
    `;

    analyteRows.forEach(row => {
        const analyteName = row.querySelector('input[name="analyte-name[]"]').value || '';
        const units = row.querySelector('input[name="units[]"]').value || '';

        qcTableHTML += `
            <tr>
                <td>${analyteName}</td>
                <td>${units}</td>
                <td><input type="text" name="upper-control-limit[]" placeholder="Enter upper limit"></td>
                <td><input type="text" name="lower-control-limit[]" placeholder="Enter lower limit"></td>
            </tr>
        `;
    });

    qcTableHTML += `
            </tbody>
        </table>
    `;
    newTabContent.innerHTML = qcTableHTML;
    tabContentContainer.appendChild(newTabContent);

    // Add tab switching logic for the new tab
    newTabButton.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.style.display = 'none';
        });
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        document.getElementById(`${qcSampleType.replace(/\s+/g, '-').toLowerCase()}-container`).style.display = 'block';
        newTabButton.classList.add('active');
    });

    // Trigger the new tab to display
    newTabButton.click();
});

// Tab switching logic
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;

        // Hide all tabs
        document.querySelectorAll('.tab').forEach(tabContent => {
            tabContent.style.display = 'none';
        });

        // Remove active class from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        // Show the selected tab and add active class to the button
        document.querySelector(`#${tab}-container`).style.display = 'block';
        button.classList.add('active');
    });
});

// Initialize tabs on page load and populate QC dropdown
window.onload = function () {
    document.querySelectorAll('.tab').forEach(tabContent => {
        tabContent.style.display = 'none';
    });
    document.querySelector('.tab-button.active').click(); // Trigger the active tab
    populateQCDropdown(); // Populate the QC dropdown
};

// Save Test Code and Analytes
document.getElementById("create-test-code").addEventListener("click", function () {
    const analysisName = document.getElementById("analysis-name")?.value.trim();
    const testCodeId = document.getElementById("test-code-id")?.value.trim();

    // Validate inputs
    if (!analysisName) {
        alert("Please enter an Analysis Name.");
        return;
    }
    if (!testCodeId) {
        alert("Please enter a Test Code ID.");
        return;
    }

    // Create test code data
    const combinedAnalysisId = `${analysisName} (${testCodeId})`;
    const testCode = {
        analysisId: combinedAnalysisId,
        analysisName,
        testCodeId,
        analytes: [],
        preservationRequirements: document.getElementById("preservation-requirements")?.value || "N/A",
    };

    // Collect analytes
    const analyteRows = document.querySelectorAll("#analyte-table tbody tr");
    analyteRows.forEach((row) => {
        const analyteName = row.querySelector('input[name="analyte-name[]"]').value.trim();
        const units = row.querySelector('input[name="units[]"]').value.trim();
        const mdl = row.querySelector('input[name="mdl[]"]').value.trim();
        const loq = row.querySelector('input[name="loq[]"]').value.trim();
        const initialVolume = row.querySelector('input[name="initial-volume[]"]').value.trim();
        const finalVolume = row.querySelector('input[name="final-volume[]"]').value.trim();
        const holdTime = row.querySelector('input[name="hold-time[]"]').value.trim();
        const decimalPlaces = row.querySelector('input[name="decimal-places[]"]').value.trim();

        if (analyteName) {
            testCode.analytes.push({
                analyteName,
                units,
                mdl,
                loq,
                initialVolume,
                finalVolume,
                holdTime,
                decimalPlaces,
            });
        }
    });

    if (testCode.analytes.length === 0) {
        alert("Please add at least one analyte before saving.");
        return;
    }

    // Save Test Code to Local Storage
    const testCodes = JSON.parse(localStorage.getItem("testCodes")) || [];
    testCodes.push(testCode);
    localStorage.setItem("testCodes", JSON.stringify(testCodes));

    alert(`Test Code "${combinedAnalysisId}" created successfully!`);
    location.reload(); // Reload to refresh the table
});

















