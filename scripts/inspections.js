import { loadData, saveData } from './data-handler.js';

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tab-button").forEach(button => {
        button.addEventListener("click", () => {
            openTab(button.getAttribute("data-tab"));
        });
    });
    openTab("caa"); // Set default tab on page load

    // Attach event listeners to submit buttons
    document.querySelector(".submit-button[onclick='logCAAInspection()']").addEventListener("click", logCAAInspection);
    document.querySelector(".submit-button[onclick='logSAAInspection()']").addEventListener("click", logSAAInspection);
    document.querySelector(".submit-button[onclick='logSPCCInspection()']").addEventListener("click", logSPCCInspection);
    document.querySelector(".submit-button[onclick='logEyeWashInspection()']").addEventListener("click", logEyeWashInspection);
});

function openTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(content => content.style.display = "none");
    document.querySelectorAll(".tab-button").forEach(button => button.classList.remove("active"));
    document.getElementById(tabId).style.display = "block";
    document.querySelector(`.tab-button[data-tab='${tabId}']`).classList.add("active");
}

async function logInspection(tableHeadId, tableId, inspectionType) {
    const tableHead = document.getElementById(tableHeadId);
    const table = document.getElementById(tableId);
    if (!tableHead || !table) {
        alert("Error: Inspection table not found!");
        return;
    }

    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const headInputs = tableHead.getElementsByTagName("input");

    let inspectionResults = [];
    let allFieldsCompleted = true;

    for (let row of rows) {
        const cells = row.getElementsByTagName("td");
        const item = cells[0].innerText || "Unknown Item";
        const pass = cells[1]?.querySelector("input[type='radio']:checked")?.value === "Pass";
        const fail = cells[2]?.querySelector("input[type='radio']:checked")?.value === "Fail";
        const comment = cells[3]?.querySelector("input")?.value.trim() || "No comment";

        if (!pass && !fail) {
            allFieldsCompleted = false;
            break;
        }

        inspectionResults.push({ item, status: pass ? "Pass" : "Fail", comment });
    }

    if (!allFieldsCompleted) {
        alert("Please complete all inspection fields before submitting.");
        return;
    }

    const inspectorName = headInputs[0]?.value || "Unknown Inspector";
    const date = headInputs[1]?.value || "Unknown Date";
    const time = headInputs[2]?.value || "Unknown Time";
    const observation = headInputs[3]?.checked ? "Observed" : "No Observation";
    const headComment = headInputs[4]?.value || "No Comment";

    const logEntry = {
        timestamp: new Date().toISOString(),
        type: inspectionType,
        inspectorName,
        date,
        time,
        observation,
        headComment,
        results: inspectionResults
    };

    let logData = await loadData("inspectionLogs") || [];
    logData.push(logEntry);
    await saveData("inspectionLogs", logData);

    alert(`${inspectionType} Inspection logged successfully.`);
    resetInspectionForm(tableHeadId, tableId);
    window.location.href = "inspection-log.html";
}

function resetInspectionForm(tableHeadId, tableId) {
    const tableHead = document.getElementById(tableHeadId);
    const table = document.getElementById(tableId);
    tableHead.querySelectorAll("input").forEach(input => input.type === "radio" ? (input.checked = false) : (input.value = ""));
    table.querySelectorAll("tbody tr").forEach(row => {
        row.querySelectorAll("input[type='radio']").forEach(radio => (radio.checked = false));
        row.querySelector("input[type='text']").value = "";
    });
}

function logCAAInspection() {
    logInspection("caa-inspection-table-head", "caa-inspection-table", "CAA");
}
function logSAAInspection() {
    logInspection("saa-inspection-table-head", "saa-inspection-table", "SAA");
}
function logSPCCInspection() {
    logInspection("spcc-inspection-table-head", "spcc-inspection-table", "SPCC");
}
function logEyeWashInspection() {
    logInspection("eye-wash-inspection-table-head", "eye-wash-inspection-table", "Eye Wash");
}

export { logCAAInspection, logSAAInspection, logSPCCInspection, logEyeWashInspection };




