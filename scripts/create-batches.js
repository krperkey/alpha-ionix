import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const analysisDropdown = document.getElementById("batch-analysis");
    const selectSamplesButton = document.getElementById("select-samples-button");
    const addQCButton = document.getElementById("add-qc-button");
    const sampleModal = document.getElementById("sample-modal");
    const addQCModal = document.getElementById("add-qc-modal");
    const modalSampleTableBody = document.querySelector("#modal-sample-table tbody");
    const modalQCTableBody = document.querySelector("#modal-qc-add-table tbody");
    const sampleSelectionTableBody = document.querySelector("#sample-selection-table tbody");
    const confirmSamplesButton = document.getElementById("confirm-samples-button");
    const confirmAddQCButton = document.getElementById("confirm-add-qc-button");
    const closeModalButton = document.getElementById("close-modal-button");
    const closeAddQCModalButton = document.getElementById("close-add-qc-modal-button");

    console.log("Elements loaded:", { analysisDropdown, selectSamplesButton, sampleModal, modalSampleTableBody });

    // Populate the Analysis Dropdown dynamically
    const testCodes = await loadData("testCodes") || [];
    console.log("Test codes from storage:", testCodes);

    testCodes.forEach((testCode) => {
        const option = document.createElement("option");
        option.value = testCode.analysisId;
        option.textContent = testCode.analysisId;
        analysisDropdown.appendChild(option);
    });

    // "Select Samples" button functionality
    selectSamplesButton.addEventListener("click", async function () {
        const selectedAnalysis = analysisDropdown.value;

        if (!selectedAnalysis) {
            alert("Please select an analysis first.");
            return;
        }

        // Fetch batches and samples
        const batches = await loadData("batches") || [];
        const sampleDataArray = await loadData("sampleDataArray") || [];

        // Gather all sample IDs already assigned to batches
        const assignedSampleIds = batches.flatMap(batch =>
            sampleDataArray.filter(sample => sample.batchId === batch.batchId).map(sample => sample.id)
        );

        // Gather all sample IDs already added to the table
        const addedSampleIds = Array.from(sampleSelectionTableBody.querySelectorAll("tr[data-sample-id]"))
            .map(row => row.getAttribute("data-sample-id"));

        console.log("Assigned Sample IDs:", assignedSampleIds);
        console.log("Already Added Sample IDs:", addedSampleIds);

        // Filter samples that match the selected analysis and are not in a batch or already in the table
        const filteredSamples = sampleDataArray.filter(
            sample => sample.analysis === selectedAnalysis &&
                !assignedSampleIds.includes(sample.id) &&
                !addedSampleIds.includes(sample.id)
        );
        console.log("Filtered Samples for Modal:", filteredSamples);

        // Clear and populate the modal table
        modalSampleTableBody.innerHTML = "";

        if (filteredSamples.length === 0) {
            modalSampleTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No matching samples available to add.</td></tr>`;
        } else {
            filteredSamples.forEach((sample) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><input type="checkbox" data-sample-id="${sample.id}"></td>
                    <td>${sample.id}</td>
                    <td>${sample.facilityId}</td>
                    <td>${sample.sampleDescription}</td>
                    <td>${sample.collectDate}</td>
                    <td>${sample.dateReceived}</td>
                    <td>${sample.dueDate}</td>
                `;
                modalSampleTableBody.appendChild(row);
            });
        }

        sampleModal.style.display = "block";
    });

    // Close Sample Modal
    closeModalButton.addEventListener("click", async function () {
        sampleModal.style.display = "none";
    });

    // Confirm Selected Samples
    confirmSamplesButton.addEventListener("click", async function () {
        const selectedCheckboxes = modalSampleTableBody.querySelectorAll('input[type="checkbox"]:checked');
        console.log("Selected checkboxes:", selectedCheckboxes);

        if (selectedCheckboxes.length === 0) {
            alert("No samples selected. Please select at least one sample.");
            return;
        }

        const sampleDataArray = await loadData("sampleDataArray") || [];

        selectedCheckboxes.forEach((checkbox) => {
            const sampleId = checkbox.dataset.sampleId;

            if (sampleSelectionTableBody.querySelector(`tr[data-sample-id="${sampleId}"]`)) {
                console.log(`Sample ${sampleId} is already added.`);
                return;
            }

            const sample = sampleDataArray.find((s) => s.id === sampleId);
            if (!sample) {
                console.error(`Sample with ID ${sampleId} not found.`);
                return;
            }

            const row = document.createElement("tr");
            row.setAttribute("data-sample-id", sampleId);
            row.innerHTML = `
                <td><a href="sample-details.html?id=${sample.id}" class="sample-id-link">${sample.id}</a></td>
                <td>${sample.clientProfile}</td>
                <td>${sample.facilityId}</td>
                <td>${sample.sampleDescription}</td>
                <td>${sample.collectDate}</td>
                <td>${sample.dateReceived}</td>
                <td>${sample.dueDate}</td>
                <td><button class="remove-sample-button" data-sample-id="${sample.id}">Remove</button></td>
            `;
            sampleSelectionTableBody.appendChild(row);
        });

        sampleModal.style.display = "none";
        console.log("Selected samples added to the batch.");
    });

    // "Add QC" button functionality
    addQCButton.addEventListener("click", async function () {
        const selectedAnalysis = analysisDropdown.value;

        if (!selectedAnalysis) {
            alert("Please select an analysis before adding QC.");
            return;
        }

        const testCodes = await loadData("testCodes") || [];
        const sampleTypes = await loadData("sampleTypes") || [];

        const matchingTestCode = testCodes.find(tc => tc.analysisId === selectedAnalysis);
        modalQCTableBody.innerHTML = "";

        if (matchingTestCode?.qcTabs?.length) {
            matchingTestCode.qcTabs.forEach(qcTab => {
                const matchingSampleType = sampleTypes.find(st => st.typeName === qcTab.tabName);
                const abbreviation = matchingSampleType ? matchingSampleType.typeNameAbbreviation : "N/A";

                const row = document.createElement("tr");
                row.innerHTML = `<td><input type="checkbox" value="${qcTab.tabName}"></td><td>${qcTab.tabName}</td><td>${abbreviation}</td>`;
                modalQCTableBody.appendChild(row);
            });
        } else {
            modalQCTableBody.innerHTML = "<tr><td colspan='3'>No QC options available for this analysis.</td></tr>";
        }

        addQCModal.style.display = "block";
    });

    // Confirm Selected QCs
confirmAddQCButton.addEventListener("click", async function () {
    const selectedQcNames = Array.from(document.querySelectorAll("#modal-qc-add-table input[type='checkbox']:checked"))
        .map(input => input.value);

    if (selectedQcNames.length === 0) {
        alert("No QC selected. Please select at least one QC.");
        return;
    }

    const sampleDataArray = await loadData("sampleDataArray") || [];
    const sampleTypes = await loadData("sampleTypes") || [];

    selectedQcNames.forEach(qcName => {
        // Find the abbreviation from sampleTypes
        const matchingSampleType = sampleTypes.find(st => st.typeName === qcName);
        const abbreviation = matchingSampleType ? matchingSampleType.typeNameAbbreviation : "UNKNOWN";

        // Calculate the collectDate and dueDate
        const collectDate = new Date();
        const dueDate = new Date(collectDate);
        dueDate.setDate(dueDate.getDate() + 7);

        // Format the dates to "YYYY-MM-DD"
        const formattedCollectDate = collectDate.toISOString().split("T")[0];
        const formattedDueDate = dueDate.toISOString().split("T")[0];

        // Generate a unique sample ID using abbreviation and timestamp
        const uniqueSampleId = `${abbreviation}${Date.now()}`;

        // Create QC sample object
        const qcSample = {
            id: uniqueSampleId,
            batchId: null, 
            qcName: qcName,
            sampleType: abbreviation,
            clientProfile: "QC Profile",
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
            holdTime: "7 days (Default)"
        };

        sampleDataArray.push(qcSample);

        // Add the sample to the table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="sample-details.html?id=${qcSample.id}" class="sample-id-link">${qcSample.id}</a></td>
            <td>${qcSample.clientProfile}</td>
            <td>${qcSample.facilityId}</td>
            <td>${qcSample.workorderDescription}</td>
            <td>${qcSample.collectDate}</td>
            <td>${qcSample.dateReceived}</td>
            <td>${qcSample.dueDate}</td>
            <td><button class="remove-sample-button" data-sample-id="${qcSample.id}">Remove</button></td>
        `;
        sampleSelectionTableBody.appendChild(row);
    });

    // Save the updated sample array to localForage
    await saveData("sampleDataArray", sampleDataArray);

    // Close the modal
    addQCModal.style.display = "none";
});

    // Close QC Modal
    closeAddQCModalButton.addEventListener("click", async function () {
        addQCModal.style.display = "none";
    });

    // Remove Sample functionality
    sampleSelectionTableBody.addEventListener("click", async function (event) {
        if (event.target.classList.contains("remove-sample-button")) {
            event.target.closest("tr")?.remove();
        }
    });
};







