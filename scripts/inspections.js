import { loadData, saveData } from './data-handler.js';

/**
 * Logs inspection results for a given table.
 */
async function logInspection(tableId, logKey, resetFunction) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    let inspectionResults = [];
    let allFieldsCompleted = true;

    for (let row of rows) {
        const cells = row.getElementsByTagName("td");

        const item = cells[0].innerText;
        const pass = cells[1].getElementsByTagName("input")[0].checked;
        const fail = cells[2].getElementsByTagName("input")[0].checked;
        const comment = cells[3].getElementsByTagName("input")[0].value.trim();
        const date = cells[4].getElementsByTagName("input")[0].value;

        if ((!pass && !fail) || date === "") {
            allFieldsCompleted = false;
            break;
        }

        let status = pass ? "Pass" : "Fail";
        inspectionResults.push({ item, status, comment, date });
    }

    if (!allFieldsCompleted) {
        alert("Please complete all inspection fields before submitting.");
        return;
    }

    const now = new Date();
    const logEntry = {
        timestamp: now.toISOString(),
        results: inspectionResults
    };

    let logData = await loadData(logKey) || [];
    logData.push(logEntry);
    await saveData(logKey, logData);

    alert("Inspection logged successfully.");
    resetFunction();
}

/**
 * Resets form inputs for a given inspection table.
 */
function resetInspectionForm(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    for (let row of rows) {
        const cells = row.getElementsByTagName("td");
        cells[1].getElementsByTagName("input")[0].checked = false;
        cells[2].getElementsByTagName("input")[0].checked = false;
        cells[3].getElementsByTagName("input")[0].value = "";
        cells[4].getElementsByTagName("input")[0].value = "";
    }
}

/**
 * Functions for logging specific inspections.
 */
function logCAAInspection() {
    logInspection("caa-inspection-table", "caaInspectionLogs", () => resetInspectionForm("caa-inspection-table"));
}

function logSAAInspection() {
    logInspection("saa-inspection-table", "saaInspectionLogs", () => resetInspectionForm("saa-inspection-table"));
}

function logSPCCInspection() {
    logInspection("spcc-inspection-table", "spccInspectionLogs", () => resetInspectionForm("spcc-inspection-table"));
}

function logEyeWashInspection() {
    logInspection("eye-wash-inspection-table", "eyeWashInspectionLogs", () => resetInspectionForm("eye-wash-inspection-table"));
}

/**
 * Handles tab switching for inspections.
 */
function openTab(tabId) {
    const tabContents = document.querySelectorAll(".tab-content");
    const tabButtons = document.querySelectorAll(".tab-button");

    tabContents.forEach(content => {
        content.style.display = "none"; // Hide all tabs
    });

    tabButtons.forEach(button => {
        button.classList.remove("active"); // Remove active state from all buttons
    });

    document.getElementById(tabId).style.display = "block"; // Show the selected tab
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add("active"); // Highlight active tab
}

// Ensure tab buttons have event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            openTab(button.getAttribute("data-tab"));
        });
    });

    openTab("caa"); // Set default tab on page load
});

export { logCAAInspection, logSAAInspection, logSPCCInspection, logEyeWashInspection };


