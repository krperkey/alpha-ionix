import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const sampleDataArray = (await loadData('sampleDataArray')) || [];
    const workordersArray = (await loadData('workordersArray')) || [];
    const sampleStatusMap = (await loadData('sampleStatusMap')) || {};

    const tableBody = document.querySelector("#sample-table tbody");

    // Populate the table with sample data
    if (sampleDataArray.length > 0) {
        sampleDataArray.forEach((sampleData) => {
            const workorder = workordersArray.find(wo => wo.samples.some(s => s.id === sampleData.id));
            const workorderID = workorder ? workorder.id : "QC Workorder";
            const status = sampleStatusMap[sampleData.id] || "In Progress";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><a href="sample-details.html?id=${sampleData.id}">${sampleData.id}</a></td>
                <td>${workorderID}</td>
                <td>${sampleData.sampleType || "N/A"}</td>
                <td>${sampleData.clientProfile || "N/A"}</td>
                <td>${sampleData.facilityId || "N/A"}</td>
                <td>${sampleData.workorderDescription || "N/A"}</td>
                <td>${sampleData.collectorName || "N/A"}</td>
                <td>${sampleData.receivedBy || "N/A"}</td>
                <td>${sampleData.dateReceived || "N/A"}</td>
                <td>${sampleData.collectDate || "N/A"}</td>
                <td>${sampleData.analysis || "N/A"}</td>
                <td>${sampleData.holdTime || "N/A"}</td>
                <td>${sampleData.dueDate || "N/A"}</td>
                <td>${sampleData.sampleDescription || "N/A"}</td>
                <td>${sampleData.analytes?.length > 0 ? sampleData.analytes.join(", ") : "N/A"}</td>
                <td>${status}</td>
                <td><button class="delete-btn" data-sample-id="${sampleData.id}">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
        console.log("Sample table populated successfully.");
    } else {
        console.log("No sample data found.");
    }

    // Initialize functionalities
    initializeTabFiltering();
    initializeSorting();
    initializeDeleteFunctionality();
};

async function initializeDeleteFunctionality() {
    const tableBody = document.querySelector("#sample-table tbody");

    tableBody.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const sampleID = event.target.dataset.sampleId;
            console.log(`Delete button clicked for Sample ID: ${sampleID}`);

            let sampleDataArray = await loadData("sampleDataArray") || [];

            if (!sampleDataArray.some(sample => sample.id === sampleID)) {
                console.error(`Sample ID ${sampleID} not found.`);
                return;
            }

            // Remove the sample and update storage
            sampleDataArray = sampleDataArray.filter(sample => sample.id !== sampleID);
            await saveData("sampleDataArray", sampleDataArray);

            const rowToRemove = event.target.closest("tr");
            if (rowToRemove) {
                rowToRemove.remove();
                console.log(`Row for Sample ID ${sampleID} successfully removed.`);
            } else {
                console.error("Could not find the row to remove.");
            }

            updateTableView();
        }
    });
}

function initializeTabFiltering() {
    const tabs = document.querySelectorAll(".tab-button");
    const tableBody = document.querySelector("#sample-table tbody");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const tabType = tab.getAttribute("data-tab");
            const allRows = Array.from(tableBody.querySelectorAll("tr"));

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            allRows.forEach(row => {
                const sampleType = row.querySelectorAll("td")[2]?.textContent.trim();
                row.style.display = 
                    (tabType === "samples" && sampleType === "SAM") ||
                    (tabType === "qc-samples" && sampleType !== "SAM") ? "" : "none";
            });
        });
    });

    document.querySelector(".tab-button.active").click();
}

function updateTableView() {
    const activeTab = document.querySelector(".tab-button.active");
    if (activeTab) activeTab.click();
}

function initializeSorting() {
    const table = document.querySelector("#sample-table");
    const headers = table.querySelectorAll("th");
    const tableBody = table.querySelector("tbody");

    headers.forEach((header, columnIndex) => {
        const dropdown = document.createElement("div");
        dropdown.classList.add("dropdown");

        dropdown.innerHTML = `
            <span class="dropdown-arrow">&#x25BC;</span>
            <div class="dropdown-menu">
                <button class="sort-asc">Sort A-Z</button>
                <button class="sort-desc">Sort Z-A</button>
            </div>
        `;

        header.appendChild(dropdown);

        dropdown.querySelector(".sort-asc").addEventListener("click", () => {
            sortTable(columnIndex, true);
        });

        dropdown.querySelector(".sort-desc").addEventListener("click", () => {
            sortTable(columnIndex, false);
        });
    });
}

function sortTable(columnIndex, ascending) {
    const tableBody = document.querySelector("#sample-table tbody");
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll("td")[columnIndex]?.textContent.trim().toLowerCase();
        const cellB = rowB.querySelectorAll("td")[columnIndex]?.textContent.trim().toLowerCase();

        if (cellA < cellB) return ascending ? -1 : 1;
        if (cellA > cellB) return ascending ? 1 : -1;
        return 0;
    });

    rows.forEach(row => tableBody.appendChild(row));
}

document.getElementById('new-batch').addEventListener('click', function() {
    window.location.href = 'create-batches.html';
});