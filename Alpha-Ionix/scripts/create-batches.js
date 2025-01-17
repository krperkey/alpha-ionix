window.onload = function () {
    const analysisDropdown = document.getElementById("batch-analysis");
    const selectSamplesButton = document.getElementById("select-samples-button");
    const sampleModal = document.getElementById("sample-modal");
    const modalSampleTableBody = document.querySelector("#modal-sample-table tbody");
    const sampleSelectionTableBody = document.querySelector("#sample-selection-table tbody");
    const confirmSamplesButton = document.getElementById("confirm-samples-button");
    const closeModalButton = document.getElementById("close-modal-button");

    // Log to verify elements
    console.log("Elements loaded:", { analysisDropdown, selectSamplesButton, sampleModal, modalSampleTableBody });

    // Populate the Analysis Dropdown dynamically
    const testCodes = JSON.parse(localStorage.getItem("testCodes")) || [];
    console.log("Test codes from localStorage:", testCodes);

    testCodes.forEach((testCode) => {
        const option = document.createElement("option");
        option.value = testCode.analysisId;
        option.textContent = testCode.analysisId;
        analysisDropdown.appendChild(option);
    });

    // "Select Samples" button functionality
    selectSamplesButton.addEventListener("click", function () {
        const selectedAnalysis = analysisDropdown.value;
    
        if (!selectedAnalysis) {
            alert("Please select an analysis first.");
            return;
        }
    
        // Fetch batches and samples from localStorage
        const batches = JSON.parse(localStorage.getItem("batches")) || [];
        const sampleDataArray = JSON.parse(localStorage.getItem("sampleDataArray")) || [];
    
        // Gather all sample IDs already assigned to batches
        const assignedSampleIds = batches.flatMap(batch =>
            JSON.parse(localStorage.getItem("sampleDataArray"))
                .filter(sample => sample.batchId === batch.batchId)
                .map(sample => sample.id)
        );
        console.log("Assigned Sample IDs:", assignedSampleIds);
    
        // Filter samples that match the selected analysis but are not in another batch
        const filteredSamples = sampleDataArray.filter(
            sample => sample.analysis === selectedAnalysis && !assignedSampleIds.includes(sample.id)
        );
        console.log("Filtered Samples for Modal:", filteredSamples);
    
        // Clear and populate the modal table
        modalSampleTableBody.innerHTML = "";
    
        if (filteredSamples.length === 0) {
            alert("No available samples found for the selected analysis.");
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
    
            sampleModal.style.display = "block";
        }
    });    

    // Close Modal
    closeModalButton.addEventListener("click", function () {
        sampleModal.style.display = "none";
    });

    // Confirm Selected Samples
confirmSamplesButton.addEventListener("click", function () {
    const selectedCheckboxes = modalSampleTableBody.querySelectorAll('input[type="checkbox"]:checked');
    console.log("Selected checkboxes:", selectedCheckboxes);

    if (selectedCheckboxes.length === 0) {
        alert("No samples selected. Please select at least one sample.");
        return;
    }

    // Fetch samples from localStorage to find the selected ones
    const sampleDataArray = JSON.parse(localStorage.getItem("sampleDataArray")) || [];

    selectedCheckboxes.forEach((checkbox) => {
        const sampleId = checkbox.dataset.sampleId;

        // Prevent duplicate entries in the sample selection table
        if (sampleSelectionTableBody.querySelector(`tr[data-sample-id="${sampleId}"]`)) {
            console.log(`Sample ${sampleId} is already added.`);
            return;
        }

        const sample = sampleDataArray.find((s) => s.id === sampleId);
        if (!sample) {
            console.error(`Sample with ID ${sampleId} not found in localStorage.`);
            return;
        }

        // Create a new row in the sample selection table
        const row = document.createElement("tr");
        row.setAttribute("data-sample-id", sampleId);
        row.innerHTML = `
            <td>${sample.id}</td>
            <td>${sample.facilityId}</td>
            <td>${sample.sampleDescription}</td>
            <td>${sample.collectDate}</td>
            <td>${sample.dateReceived}</td>
            <td>${sample.dueDate}</td>
        `;
        sampleSelectionTableBody.appendChild(row);
    });

    // Close the modal after confirming the selection
    sampleModal.style.display = "none";

    // Log success for debugging
    console.log("Selected samples added to the batch.");
});

};




