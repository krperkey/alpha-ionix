// Import localForage for persistent storage
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";

// Parse query parameter
async function getQueryParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Load test code details
window.onload = async function () {
    const uniqueId = getQueryParameter("id");

    // Retrieve test codes from localForage
    const testCodes = (await localforage.getItem("testCodes")) || [];
    const testCode = testCodes.find(tc => tc.uniqueId === uniqueId);

    if (!testCode) {
        alert("Test Code not found!");
        window.location.href = "test-code-table.html";
        return;
    }

    // Populate "overview-container" details
    document.getElementById("test-code-id").textContent = testCode.uniqueId || ""; 
    document.getElementById("analysis-name").textContent = testCode.analysisName || "";
    document.getElementById("reference-method").textContent = testCode.referenceMethod || "N/A";
    document.getElementById("preservation-requirements").textContent = testCode.preservationRequirements || "";

    // Populate analytes
    const analyteTableBody = document.querySelector("#analyte-table tbody");
    if (testCode.analytes && testCode.analytes.length > 0) {
        testCode.analytes.forEach(analyte => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${analyte.analyteName || ""}</td>
                <td>${analyte.units || ""}</td>
                <td>${analyte.initialVolume || ""}</td>
                <td>${analyte.finalVolume || ""}</td>
                <td>${analyte.holdTime || ""}</td>
                <td>${analyte.decimalPlaces || ""}</td>
            `;
            analyteTableBody.appendChild(row);
        });
    } else {
        analyteTableBody.innerHTML = `<tr><td colspan="6">No analytes available.</td></tr>`;
    }

    // Populate QC Tabs
    const tabsContainer = document.getElementById("tabs");
    const tabContentContainer = document.getElementById("tab-content");

    if (testCode.qcTabs && testCode.qcTabs.length > 0) {
        testCode.qcTabs.forEach(qcTab => {
            // Create tab button
            const newTabButton = document.createElement("button");
            newTabButton.className = "tab-button";
            newTabButton.dataset.tab = qcTab.tabName.replace(/\s+/g, "-").toLowerCase();
            newTabButton.textContent = qcTab.tabName;
            tabsContainer.appendChild(newTabButton);

            // Create tab content
            const newTabContent = document.createElement("section");
            newTabContent.id = `${qcTab.tabName.replace(/\s+/g, "-").toLowerCase()}-container`;
            newTabContent.className = "tab";

            // Check which columns have non-empty values
            const hasData = {
                lowerLimit: qcTab.rows.some(row => row.lowerLimit?.trim() !== ""),
                upperLimit: qcTab.rows.some(row => row.upperLimit?.trim() !== ""),
                precision: qcTab.rows.some(row => row.precision?.trim() !== ""),
                mdl: qcTab.rows.some(row => row.mdl?.trim() !== ""),
                loq: qcTab.rows.some(row => row.loq?.trim() !== ""),
            };

            // Build table headers dynamically based on data availability
            let headers = `
                <th>Analyte Name</th>
                <th>Units</th>`;
            if (hasData.lowerLimit) headers += `<th>Lower Limit</th>`;
            if (hasData.upperLimit) headers += `<th>Upper Limit</th>`;
            if (hasData.precision) headers += `<th>Precision</th>`;
            if (hasData.mdl) headers += `<th>MDL</th>`;
            if (hasData.loq) headers += `<th>LOQ</th>`;

            let tabHTML = `
                <h3>${qcTab.tabName}</h3>
                <table>
                    <thead>
                        <tr>${headers}</tr>
                    </thead>
                    <tbody>
            `;

            // Populate table rows dynamically based on data availability
            qcTab.rows.forEach(row => {
                tabHTML += `
                    <tr>
                        <td>${row.analyteName || ""}</td>
                        <td>${row.units || ""}</td>`;
                if (hasData.lowerLimit) tabHTML += `<td>${row.lowerLimit || ""}</td>`;
                if (hasData.upperLimit) tabHTML += `<td>${row.upperLimit || ""}</td>`;
                if (hasData.precision) tabHTML += `<td>${row.precision || ""}</td>`;
                if (hasData.mdl) tabHTML += `<td>${row.mdl || ""}</td>`;
                if (hasData.loq) tabHTML += `<td>${row.loq || ""}</td>`;
                tabHTML += `</tr>`;
            });

            tabHTML += `
                    </tbody>
                </table>
            `;

            newTabContent.innerHTML = tabHTML;
            tabContentContainer.appendChild(newTabContent);
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

        // Show the first tab by default
        document.querySelector(".tab-button").click();
    } else {
        tabContentContainer.innerHTML = `<p>No QC Tabs available.</p>`;
    }
};

// Back button logic (unchanged)
document.getElementById('back-to-test-code-table').addEventListener('click', async function () {
    window.location.href = 'test-code-table.html';
});






