document.getElementById('num-rows').addEventListener('keydown', function(event) {
    // Check if the Enter key (key code 13) was pressed
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission (page refresh)
        createRows();  // Call the function to create rows
    }
});

function createRows() {
    // Get the number of rows to create
    const numRows = document.getElementById('num-rows').value;

    // Fetch analyses from localStorage
    const testCodes = JSON.parse(localStorage.getItem("testCodes")) || [];
    const analysisOptionsHTML = testCodes
        .map(testCode => `<option value="${testCode.analysisId}">${testCode.analysisId}</option>`)
        .join("");

    // Fetch sample types, container types, and matrix types from localStorage
    const sampleTypes = JSON.parse(localStorage.getItem("sampleTypes")) || [];
    const containerTypes = JSON.parse(localStorage.getItem("containers")) || [];
    const matrixTypes = JSON.parse(localStorage.getItem("matrixTypes")) || [];

    // Generate options for Sample Type based on the 4th column (Sample Type Name Abbreviation)
    const sampleTypeOptionsHTML = sampleTypes
        .map(sampleType => `<option value="${sampleType.typeNameAbbreviation}">${sampleType.typeNameAbbreviation}</option>`)
        .join("");

    // Generate options for Matrix based on the 3rd column (Matrix Name)
    const matrixOptionsHTML = matrixTypes
        .map(matrix => `<option value="${matrix.name}">${matrix.name}</option>`)
        .join("");

    // Group container volumes and units by container type
    const containerVolumeMap = containerTypes.reduce((acc, container) => {
        if (!acc[container.type]) acc[container.type] = [];
        acc[container.type].push(`${container.volume} ${container.units}`);
        return acc;
    }, {});

    // If the number is valid and greater than 0
    if (numRows > 0) {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear any existing rows

        // Create the specified number of rows
        for (let i = 1; i <= numRows; i++) {
            const row = document.createElement('tr');

            // Create and append the row number cell
            const rowNumberCell = document.createElement('td');
            rowNumberCell.textContent = i; // Set the row number
            rowNumberCell.style.color = '#FFD700'; // Set the font color to yellow (gold)
            row.appendChild(rowNumberCell);

            // Sample Type Dropdown
            const sampleTypeCell = document.createElement('td');
            sampleTypeCell.innerHTML = `
                <select id="sample-type">
                    <option value="" disabled selected>Select Sample Type</option>
                    ${sampleTypeOptionsHTML}
                </select>`;
            row.appendChild(sampleTypeCell);

            // Container Type Dropdown
            const containerTypeCell = document.createElement('td');
            containerTypeCell.innerHTML = `
                <select id="container-type-${i}" onchange="updateSampleAmountDropdown(this, ${i})">
                    <option value="" disabled selected>Select Container Type</option>
                    ${Object.keys(containerVolumeMap)
                        .map(type => `<option value="${type}">${type}</option>`)
                        .join("")}
                </select>`;
            row.appendChild(containerTypeCell);

            // Sample Amount Dropdown
            const sampleAmountCell = document.createElement('td');
            sampleAmountCell.innerHTML = `
                <select id="sample-amount-${i}">
                    <option value="" disabled selected>Select Sample Amount</option>
                </select>`;
            row.appendChild(sampleAmountCell);

            // Other cells remain the same
            const createInputCell = (id, type = 'text', step = null, min = null, max = null) => {
                const cell = document.createElement('td');
                const input = document.createElement('input');
                input.type = type;
                input.id = id;
                if (step) input.step = step;
                if (min !== null) input.min = min;
                if (max !== null) input.max = max;
                cell.appendChild(input);
                return cell;
            };

            row.appendChild(createInputCell('temperature', 'number', '0.1'));

            // Updated pH Input with Validation
            const pHCell = document.createElement('td');
            const pHInput = document.createElement('input');
            pHInput.type = 'number';
            pHInput.id = `ph-${i}`;
            pHInput.min = 1;
            pHInput.max = 14;
            pHInput.step = 1;
            pHInput.addEventListener('input', () => {
                const value = parseInt(pHInput.value, 10);
                if (value < 1 || value > 14 || isNaN(value)) {
                    pHInput.value = ''; // Clear invalid input
                    alert('pH must be a whole number between 1 and 14.');
                }
            });
            pHCell.appendChild(pHInput);
            row.appendChild(pHCell);

            // Matrix Dropdown
            const matrixCell = document.createElement('td');
            matrixCell.innerHTML = `
                <select id="matrix-${i}">
                    <option value="" disabled selected>Select Matrix</option>
                    ${matrixOptionsHTML}
                </select>`;
            row.appendChild(matrixCell);

            // Collect Date and Time
            row.appendChild(createInputCell('collect-date', 'date'));
            row.appendChild(createInputCell('collect-time', 'time'));

            // Analysis Dropdown
            const analysisCell = document.createElement('td');
            analysisCell.innerHTML = `
                <select id="analysis">
                    <option value="" disabled selected>Select Analysis</option>
                    ${analysisOptionsHTML}
                </select>`;
            row.appendChild(analysisCell);

            // Analyte List Button
            const analyteListCell = document.createElement('td');
            const analyteListButton = document.createElement('button');
            analyteListButton.textContent = 'Analyte List';
            analyteListButton.classList.add('analyte-list-btn');
            analyteListButton.dataset.rowIndex = i; // Store row index
            analyteListCell.appendChild(analyteListButton);
            row.appendChild(analyteListCell);

            // Remaining cells
            row.appendChild(createInputCell('hold-time'));
            row.appendChild(createInputCell('due-date', 'date'));
            row.appendChild(createInputCell('sample-description'));

            // Append the new row to the table body
            tableBody.appendChild(row);
        }
    } else {
        alert('Please enter a valid number of rows greater than 0.');
    }

    // Update the Sample Amount dropdown when a Container Type is selected
    window.updateSampleAmountDropdown = (dropdown, rowIndex) => {
        const selectedContainerType = dropdown.value;
        const sampleAmountDropdown = document.getElementById(`sample-amount-${rowIndex}`);
        const volumes = containerVolumeMap[selectedContainerType] || [];

        // Populate Sample Amount dropdown
        sampleAmountDropdown.innerHTML = `
            <option value="" disabled selected>Select Sample Amount</option>
            ${volumes.map(volume => `<option value="${volume}">${volume}</option>`).join("")}
        `;
    };
}

// Store selected analytes for each row
const selectedAnalytes = {};

// Handle "Clear All" button click
document.getElementById('clear-all').addEventListener('click', function () {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    analyteCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
});

// Handle "Save" button click
// Global variable
let tempAnalyteSelections = {}; // Temporary storage for analyte selections

// Function to handle "Save" in the analyte modal
document.getElementById('save-analytes').addEventListener('click', function () {
    const analyteCheckboxes = document.querySelectorAll('#analyte-list-body input[type="checkbox"]');
    const selectedAnalyteNames = Array.from(analyteCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const rowIndex = document.getElementById('analyte-modal').dataset.rowIndex;
    tempAnalyteSelections[rowIndex] = selectedAnalyteNames; // Save to temporary storage

    // Remove the alert() to prevent the pop-up
    document.getElementById('analyte-modal').style.display = 'none';
});

// Show the modal with default or updated selections
document.getElementById('table-body').addEventListener('click', function (event) {
    if (event.target.classList.contains('analyte-list-btn')) {
        event.preventDefault();

        const rowIndex = event.target.dataset.rowIndex;
        const analysisCell = document.querySelector(`#table-body tr:nth-child(${rowIndex}) select#analysis`);
        const analysisValue = analysisCell ? analysisCell.value : null;

        if (!analysisValue) {
            alert('Please select an analysis for this row before opening the Analyte List.');
            return;
        }

        const testCodes = JSON.parse(localStorage.getItem('testCodes')) || [];
        const selectedTestCode = testCodes.find(tc => tc.analysisId === analysisValue);

        if (!selectedTestCode || selectedTestCode.analytes.length === 0) {
            alert(`No analytes found for the analysis "${analysisValue}".`);
            return;
        }

        const analyteListBody = document.getElementById('analyte-list-body');
        analyteListBody.innerHTML = '';

        // Populate modal with analytes
        selectedTestCode.analytes.forEach(analyte => {
            // Default to checked if no previous selection exists for this row
            const isChecked = selectedAnalytes[rowIndex]
                ? selectedAnalytes[rowIndex].includes(analyte.analyteName)
                : true;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" value="${analyte.analyteName}" ${isChecked ? 'checked' : ''}></td>
                <td>${analyte.analyteName}</td>
            `;
            analyteListBody.appendChild(row);
        });

        // Store the row index in the modal's dataset for saving
        document.getElementById('analyte-modal').dataset.rowIndex = rowIndex;
        document.getElementById('analyte-modal').style.display = 'block';
    }
});

// Close modal functionality
document.getElementById('close-analyte-modal').addEventListener('click', function () {
    document.getElementById('analyte-modal').style.display = 'none';
});

document.getElementById('table-body').addEventListener('keydown', function (event) {
    // Check for Ctrl+D (Ctrl key and 'D' key)
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault(); // Prevent default Ctrl+D behavior (e.g., bookmarking)

        // Get the currently focused element
        const focusedElement = document.activeElement;

        if (focusedElement) {
            // Find the column index of the focused element
            const parentRow = focusedElement.closest('tr');
            const columnIndex = Array.from(parentRow.children).indexOf(focusedElement.parentElement);

            // Get the value of the focused element
            const valueToCopy = focusedElement.value;

            // Apply the value to all rows in the same column
            const rows = document.querySelectorAll('#table-body tr');
            rows.forEach(row => {
                const cell = row.children[columnIndex];
                const targetElement = cell.querySelector('input, select');
                if (targetElement) {
                    targetElement.value = valueToCopy; // Set the value

                    if (targetElement.tagName === 'SELECT') {
                        // Manually trigger the 'change' event for dropdowns
                        const event = new Event('change', { bubbles: true });
                        targetElement.dispatchEvent(event);
                    }
                }
            });

            console.log(`Value "${valueToCopy}" copied down column ${columnIndex + 1}`);
        }
    }
});

document.getElementById('login-button').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission (page refresh)
    generateSampleIDs();  // Call function to generate sample IDs
});

function generateSampleIDs() {
    const numRows = document.getElementById('num-rows').value;

    if (numRows > 0) {
        const workorderID = 'WO-' + Date.now();

        const workorderData = {
            id: workorderID,
            description: document.getElementById('workorder-description').value || "N/A",
            clientProfile: document.getElementById('client-profile').value || "N/A",
            facilityId: document.getElementById('facility-id').value || "N/A",
            collectorName: document.getElementById('collector-name').value || "N/A",
            receivedBy: document.getElementById('received-by').value || "N/A",
            timeReceived: document.getElementById('time-received').value || "N/A",
            carrier: document.getElementById('carrier').value || "N/A",
            trackingNumber: document.getElementById('tracking-number').value || "N/A",
            dateReceived: document.getElementById('date-received').value || "N/A",
            samples: [] // To store the associated samples
        };

        const tableRows = document.querySelectorAll('#table-body tr');
        let sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];

        tableRows.forEach((row, index) => {
            const sampleID = `SMP-${Date.now()}-${index + 1}`;
            row.dataset.sampleId = sampleID;

            const analytes = tempAnalyteSelections[index + 1] || []; // Retrieve temporary analytes for the row

            const sampleData = {
                id: sampleID,
                clientProfile: workorderData.clientProfile,
                facilityId: workorderData.facilityId,
                workorderDescription: workorderData.description,
                collectorName: workorderData.collectorName,
                receivedBy: workorderData.receivedBy,
                dateReceived: workorderData.dateReceived,
                timeReceived: workorderData.timeReceived,
                carrier: workorderData.carrier,
                trackingNumber: workorderData.trackingNumber,
                collectDate: row.querySelector('#collect-date')?.value || "N/A",
                analysis: row.querySelector('#analysis')?.value || "N/A",
                sampleType: row.querySelector('select#sample-type')?.value || "N/A",
                containerType: row.querySelector(`select#container-type-${index + 1}`)?.value || "N/A",
                sampleAmount: row.querySelector(`select#sample-amount-${index + 1}`)?.value || "N/A",
                temperature: row.querySelector('input#temperature')?.value || "N/A",
                ph: row.querySelector(`input#ph-${index + 1}`)?.value || "N/A",
                matrix: row.querySelector(`select#matrix-${index + 1}`)?.value || "N/A",
                holdTime: row.querySelector('#hold-time')?.value || "N/A",
                dueDate: row.querySelector('#due-date')?.value || "N/A",
                sampleDescription: row.querySelector('#sample-description')?.value || "N/A",
                analytes: analytes // Add analytes for this sample
            };

            workorderData.samples.push(sampleData); // Link sample to workorder
            sampleDataArray.push(sampleData); // Save globally for all samples
        });

        // Save to localStorage
        let workordersArray = JSON.parse(localStorage.getItem('workordersArray')) || [];
        workordersArray.push(workorderData);
        localStorage.setItem('workordersArray', JSON.stringify(workordersArray));
        localStorage.setItem('sampleDataArray', JSON.stringify(sampleDataArray));

        alert(`Workorder ${workorderID} and samples logged successfully!`);
    } else {
        alert("Please enter a valid number of rows greater than 0.");
    }
}










