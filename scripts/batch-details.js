import { loadData, saveData } from './data-handler.js';

async function updateNumberOfSamples() {
    const samplesTableBody = document.querySelector("#samples-table tbody");
    const numberOfSamplesElement = document.querySelector("#number-of-samples");
    const rows = samplesTableBody.querySelectorAll("tr"); // Get all rows
    const sampleCount = rows.length; // Count the rows
    numberOfSamplesElement.textContent = sampleCount; // Update the display
}

window.onload = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get("batchId");
    const completeReviewButton = document.querySelector("#complete-review-button");

    // Retrieve all batches from localForage
    const batches = await loadData("batches") || [];
    const batch = batches.find((b) => b.batchId === batchId);

    if (batch) {
        // Display batch details
        document.getElementById("batch-id").textContent = batch.batchId;
        document.getElementById("analysis").textContent = batch.analysis;
        document.getElementById("date-created").textContent = batch.createdDate;
        document.getElementById("number-of-samples").textContent = batch.numberOfSamples;
        document.getElementById("status").textContent = batch.status;

        // Display associated samples in table
        const samples = await loadData("sampleDataArray") || [];
        const associatedSamples = samples.filter(sample => sample.batchId === batchId);
        const samplesTableBody = document.querySelector("#samples-table tbody");

        if (associatedSamples.length > 0) {
            associatedSamples.forEach(sample => {
                const row = document.createElement("tr");
                row.draggable = true;

                // Create dropdown options for Parent and Paired columns
                const dropdownOptions = associatedSamples
                    .map(s => `<option value="${s.id}">${s.id}</option>`)
                    .join("");

                row.innerHTML = `
                    <td class="drag-handle">☰</td>
                    <td><a href="sample-details.html?id=${sample.id}">${sample.id}</a></td>
                    <td>${sample.sampleType}</td>
                    <td>${sample.clientProfile}</td>
                    <td>${sample.facilityId}</td>
                    <td>${sample.workorderDescription}</td>
                    <td>${sample.collectDate}</td>
                    <td>${sample.dateReceived}</td>
                    <td>${sample.holdTime}</td>
                    <td>${sample.dueDate}</td>
                    <td>
                        <select class="parent-dropdown">
                            <option value=""></option>
                            ${dropdownOptions.replace(`value="${sample.parent}"`, `value="${sample.parent}" selected`)}
                        </select>
                    </td>
                    <td>
                        <select class="paired-dropdown">
                            <option value=""></option>
                            ${dropdownOptions.replace(`value="${sample.paired}"`, `value="${sample.paired}" selected`)}
                        </select>
                    </td>
                    <td>
                        <button class="remove-sample-button" data-sample-id="${sample.id}">Remove</button>
                    </td>
                `;
                samplesTableBody.appendChild(row);
            });

        } else {
            const noSamplesRow = document.createElement("tr");
            noSamplesRow.innerHTML = "<td colspan='13'>No samples associated with this batch.</td>";
            samplesTableBody.appendChild(noSamplesRow);
        }

        document.getElementById("complete-review-button").addEventListener("click", async function () {
            batch.status = "Complete";
            await saveData("batches", batches);
            document.getElementById("status").textContent = "Complete";
            alert("Batch status updated to 'Complete'!");
        });

        if (batch.status === "In review" || batch.status === "Complete") {
            document.getElementById("edit-status-button").style.display = "inline-block";
        }

        document.getElementById("edit-status-button").addEventListener("click", async function () {
            batch.status = "Pending";
            await saveData("batches", batches);
            document.getElementById("status").textContent = "Pending";
            alert("Batch status updated to 'Pending'!");
        });

    } else {
        alert("Batch not found!");
        window.location.href = "batches.html";
    }

    let draggedRow = null;

    const samplesTableBody = document.querySelector("#samples-table tbody");

    samplesTableBody.addEventListener("dragstart", function (event) {
        if (event.target.tagName === "TR") {
            draggedRow = event.target;
            event.target.style.opacity = 0.5;
        }
    });

    samplesTableBody.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    samplesTableBody.addEventListener("drop", function (event) {
        event.preventDefault();
        const targetRow = event.target.closest("tr");
        if (draggedRow && targetRow) {
            samplesTableBody.insertBefore(draggedRow, targetRow.nextSibling);
        }
    });

    samplesTableBody.addEventListener("dragend", function (event) {
        if (event.target.tagName === "TR") {
            event.target.style.opacity = 1;
            draggedRow = null;
        }
    });
};

document.getElementById("add-samples-button").addEventListener("click", async function () {
document.getElementById("add-samples-modal").style.display = "block";

const batchAnalysis = document.getElementById("analysis").textContent;

// Retrieve samples from localForage
const samples = await loadData("sampleDataArray") || [];
const unassociatedSamples = samples.filter(sample => !sample.batchId && sample.analysis === batchAnalysis);

const modalTableBody = document.getElementById("modal-sample-add-table").querySelector("tbody");
modalTableBody.innerHTML = "";

if (unassociatedSamples.length > 0) {
    unassociatedSamples.forEach(sample => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" value="${sample.id}"></td>
            <td>${sample.id}</td>
            <td>${sample.facilityId}</td>
            <td>${sample.sampleDescription}</td>
            <td>${sample.collectDate}</td>
            <td>${sample.dateReceived}</td>
            <td>${sample.dueDate}</td>
        `;
        modalTableBody.appendChild(row);
    });
} else {
    const noSamplesRow = document.createElement("tr");
    noSamplesRow.innerHTML = "<td colspan='7'>No matching samples available to add.</td>";
    modalTableBody.appendChild(noSamplesRow);
}
});

document.getElementById("confirm-add-samples-button").addEventListener("click", async function () {
const selectedSampleIds = Array.from(document.querySelectorAll("#modal-sample-add-table input[type='checkbox']:checked"))
    .map(input => input.value);

const samples = await loadData("sampleDataArray") || [];
const batches = await loadData("batches") || [];
const batchId = document.getElementById("batch-id").textContent;

const batch = batches.find(b => b.batchId === batchId);
const newlyAddedSamples = [];

selectedSampleIds.forEach(sampleId => {
    const sample = samples.find(s => s.id === sampleId);
    if (sample && !sample.batchId) { // Ensure sample isn't already assigned to a batch
        sample.batchId = batchId;
        newlyAddedSamples.push(sample);
    }
});

// Update localForage with the modified samples array
await saveData("sampleDataArray", samples);

// Update the batch's sample count in localForage
const updatedSamples = samples.filter(sample => sample.batchId === batchId);
if (batch) {
    batch.numberOfSamples = updatedSamples.length;
    await saveData("batches", batches);
}

// Append newly added samples to the table
const samplesTableBody = document.querySelector("#samples-table tbody");

newlyAddedSamples.forEach(sample => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td></td>
        <td><a href="sample-details.html?id=${sample.id}">${sample.id}</a></td>
        <td>${sample.sampleType}</td>
        <td>${sample.clientProfile}</td>
        <td>${sample.facilityId}</td>
        <td>${sample.workorderDescription}</td>
        <td>${sample.collectDate}</td>
        <td>${sample.dateReceived}</td>
        <td>${sample.holdTime}</td>
        <td>${sample.dueDate}</td>
        <td>
            <select class="parent-dropdown">
                <option value=""></option>
            </select>
        </td>
        <td>
            <select class="paired-dropdown">
                <option value=""></option>
            </select>
        </td>
        <td>
            <button class="remove-sample-button" data-sample-id="${sample.id}">Remove</button>
        </td>
    `;
    samplesTableBody.appendChild(row);
});

// Refresh the table and update the number of samples
updateNumberOfSamples();

// Close the modal
document.getElementById("add-samples-modal").style.display = "none";
});

document.getElementById("samples-table").addEventListener("click", async function (event) {
if (event.target.classList.contains("remove-sample-button")) {
    const sampleId = event.target.getAttribute("data-sample-id");

    const samples = await loadData("sampleDataArray") || [];
    const batches = await loadData("batches") || [];
    const batchId = document.getElementById("batch-id").textContent;

    const batch = batches.find(b => b.batchId === batchId);
    const sample = samples.find(s => s.id === sampleId);

    if (sample && sample.batchId === batchId) {
        sample.batchId = null;
        await saveData("sampleDataArray", samples);

        const updatedSamples = samples.filter(s => s.batchId === batchId);
        if (batch) {
            batch.numberOfSamples = updatedSamples.length;
            await saveData("batches", batches);
        }

        const rowToRemove = event.target.closest("tr");
        rowToRemove.parentNode.removeChild(rowToRemove);

        updateNumberOfSamples();
    }
}
});

document.getElementById("close-add-samples-modal-button").addEventListener("click", function () {
    document.getElementById("add-samples-modal").style.display = "none";
});

document.getElementById("add-qc-button").addEventListener("click", async function () {
const batchAnalysis = document.getElementById("analysis").textContent;
const testCodes = await loadData("testCodes") || [];
const sampleTypes = await loadData("sampleTypes") || [];

// Find the test code with the matching analysis name
const matchingTestCode = testCodes.find(tc => tc.analysisId === batchAnalysis);

const modalTableBody = document.getElementById("modal-qc-add-table").querySelector("tbody");
modalTableBody.innerHTML = "";

if (matchingTestCode && matchingTestCode.qcTabs && matchingTestCode.qcTabs.length > 0) {
    // Populate the modal table with QC options
    matchingTestCode.qcTabs.forEach(qcTab => {
        // Find the corresponding abbreviation from sampleTypes
        const matchingSampleType = sampleTypes.find(st => st.typeName === qcTab.tabName);
        const abbreviation = matchingSampleType ? matchingSampleType.typeNameAbbreviation : "N/A";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" value="${qcTab.tabName}"></td>
            <td>${qcTab.tabName}</td>
            <td>${abbreviation}</td> <!-- New Column -->
        `;
        modalTableBody.appendChild(row);
    });
} else {
    const noQcRow = document.createElement("tr");
    noQcRow.innerHTML = "<td colspan='3'>No QC options available for this analysis.</td>";
    modalTableBody.appendChild(noQcRow);
}

document.getElementById("add-qc-modal").style.display = "block";
});

document.getElementById("confirm-add-qc-button").addEventListener("click", async function () {
const selectedQcNames = Array.from(document.querySelectorAll("#modal-qc-add-table input[type='checkbox']:checked"))
    .map(input => input.value);

const batchId = document.getElementById("batch-id").textContent;
const batches = await loadData("batches") || [];
const batch = batches.find(b => b.batchId === batchId);

const samples = await loadData("sampleDataArray") || [];
const sampleTypes = await loadData("sampleTypes") || [];
const tableBody = document.querySelector("#samples-table tbody");

if (batch) {
    selectedQcNames.forEach(qcName => {
        // Find the abbreviation from sampleTypes
        const matchingSampleType = sampleTypes.find(st => st.typeName === qcName);
        const abbreviation = matchingSampleType ? matchingSampleType.typeNameAbbreviation : "UNKNOWN";

        // Calculate the collectDate and dueDate
        const collectDate = new Date();
        const dueDate = new Date(collectDate);
        dueDate.setDate(dueDate.getDate() + 7); // Add 7 days

        const formattedCollectDate = collectDate.toISOString().split("T")[0];
        const formattedDueDate = dueDate.toISOString().split("T")[0];

        // Generate a unique sample ID
        const uniqueSampleId = `${abbreviation}${Date.now()}`;

        // Add the QC sample to the batch and sample storage
        const qcSample = {
            id: uniqueSampleId,
            batchId: batchId,
            sampleType: abbreviation,
            qcName: qcName,
            clientProfile: "1",
            facilityId: "Lab - Quality Control",
            workorderDescription: "Quality Control",
            collectorName: "Lab Personnel",
            receivedBy: "Lab Personnel",
            carrier: "Lab - QC",
            trackingNumber: "Lab - QC",
            temperature: "Lab - QC",
            ph: "Lab - QC",
            containerType: "QC Container",
            matrix: "QC Matrix",
            analysis: "HOLD",
            sampleDescription: "QC Sample",
            collectDate: formattedCollectDate,
            dateReceived: formattedCollectDate,
            dueDate: formattedDueDate,
            holdTime: "7 days (Default)",
            parent: null,
            paired: null,
        };

        samples.push(qcSample);

        // Add the sample to the table dynamically
        const row = document.createElement("tr");
        row.innerHTML = `
            <td></td>
            <td><a href="sample-details.html?id=${qcSample.id}">${qcSample.id}</a></td>
            <td>${qcSample.sampleType}</td>
            <td>${qcSample.clientProfile}</td>
            <td>${qcSample.facilityId}</td>
            <td>${qcSample.workorderDescription}</td>
            <td>${qcSample.collectDate}</td>
            <td>${qcSample.dateReceived}</td>
            <td>${qcSample.holdTime}</td>
            <td>${qcSample.dueDate}</td>
            <td>
                <select class="parent-dropdown">
                    <option value=""></option>
                </select>
            </td>
            <td>
                <select class="paired-dropdown">
                    <option value=""></option>
                </select>
            </td>
            <td>
                <button class="remove-sample-button" data-sample-id="${qcSample.id}">Remove</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Save the updated sample array to localForage
    await saveData("sampleDataArray", samples);

    // Update the batch's sample count
    batch.numberOfSamples = samples.filter(s => s.batchId === batchId).length;
    await saveData("batches", batches);

    alert(`Added QC Samples: ${selectedQcNames.join(", ")}`);
}

// Refresh the table and update the number of samples
updateNumberOfSamples();

// Close the modal
document.getElementById("add-qc-modal").style.display = "none";
});

document.getElementById("close-add-qc-modal-button").addEventListener("click", function () {
document.getElementById("add-qc-modal").style.display = "none";
});

document.getElementById("save-sample-order-button").addEventListener("click", async function () {
const batchId = document.getElementById("batch-id").textContent;
const samplesTableBody = document.querySelector("#samples-table tbody");
const rows = samplesTableBody.querySelectorAll("tr");

const samples = await loadData("sampleDataArray") || [];

const reorderedSampleIDs = Array.from(rows).map(row => {
    const sampleId = row.querySelector("a").textContent;

    const parentDropdown = row.querySelector(".parent-dropdown");
    const pairedDropdown = row.querySelector(".paired-dropdown");

    const sample = samples.find(s => s.id === sampleId && s.batchId === batchId);
    if (sample) {
        sample.parent = parentDropdown ? parentDropdown.value : "";
        sample.paired = pairedDropdown ? pairedDropdown.value : "";
    }

    return sampleId;
});

const reorderedSamples = reorderedSampleIDs.map(sampleId =>
    samples.find(sample => sample.id === sampleId && sample.batchId === batchId)
);

const remainingSamples = samples.filter(sample => sample.batchId !== batchId || !reorderedSampleIDs.includes(sample.id));
const updatedSampleArray = [...reorderedSamples, ...remainingSamples];

await saveData("sampleDataArray", updatedSampleArray);

alert("Saved successfully!");
});