import { loadData, saveData } from './data-handler.js';

document.addEventListener('DOMContentLoaded', async () => {
    const logContainer = document.getElementById('log-container');
    
    // Retrieve stored inspections from LocalForage
    let logData = await loadData("inspectionLogs") || [];

    logContainer.innerHTML = ""; // Clear any existing content

    if (logData.length > 0) {
        // Create table header
        const table = document.createElement("table");
        table.setAttribute("border", "1");
        table.style.width = "100%";
        
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headers = ["Checklist ID", "Type", "Inspector Name", "Date", "Time", "Observation", "Comments", "Actions"];
        
        const expandHeader = document.createElement("th");
        expandHeader.textContent = " ";
        headerRow.appendChild(expandHeader);

        headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement("tbody");

        logData.forEach((logEntry, index) => {
            const row = document.createElement('tr');
            row.classList.add("log-entry");

            // Expansion arrow cell
            const expandCell = document.createElement('td');
            expandCell.innerHTML = `<button class="expand-button" data-index="${index}">▶</button>`;
            expandCell.style.textAlign = "center";

            const cellIndex = document.createElement('td');
            cellIndex.textContent = index + 1;

            const cellType = document.createElement('td');
            cellType.textContent = logEntry.type;

            const cellInspector = document.createElement('td');
            cellInspector.textContent = logEntry.inspectorName;

            const cellDate = document.createElement('td');
            cellDate.textContent = logEntry.date;

            const cellTime = document.createElement('td');
            cellTime.textContent = logEntry.time;

            const cellObservation = document.createElement('td');
            cellObservation.textContent = logEntry.observation;

            const cellComment = document.createElement('td');
            cellComment.textContent = logEntry.headComment;

            // Delete button cell
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-button");
            deleteButton.setAttribute("data-index", index);
            deleteButton.addEventListener("click", () => deleteInspection(index));
            deleteCell.appendChild(deleteButton);

            row.appendChild(expandCell);
            row.appendChild(cellIndex);
            row.appendChild(cellType);
            row.appendChild(cellInspector);
            row.appendChild(cellDate);
            row.appendChild(cellTime);
            row.appendChild(cellObservation);
            row.appendChild(cellComment);
            row.appendChild(deleteCell);
            tbody.appendChild(row);

            // Hidden row for inspection details with headers
            const detailRow = document.createElement('tr');
            detailRow.classList.add("log-details");
            detailRow.style.display = "none";
            const detailCell = document.createElement('td');
            detailCell.setAttribute("colspan", "9");
            
            let detailContent = `
                <table border="1" style="width:100%; margin-top:10px;">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            logEntry.results.forEach(result => {
                detailContent += `<tr><td>${result.item}</td><td>${result.status}</td><td>${result.comment}</td></tr>`;
            });
            detailContent += `</tbody></table>`;
            detailCell.innerHTML = detailContent;
            detailRow.appendChild(detailCell);
            tbody.appendChild(detailRow);
        });

        table.appendChild(tbody);
        logContainer.appendChild(table);

        // Attach event listeners to expand buttons
        document.querySelectorAll(".expand-button").forEach(button => {
            button.addEventListener("click", function() {
                const index = this.getAttribute("data-index");
                const detailRow = document.querySelectorAll(".log-details")[index];
                if (detailRow.style.display === "none") {
                    detailRow.style.display = "table-row";
                    this.textContent = "▼";
                } else {
                    detailRow.style.display = "none";
                    this.textContent = "▶";
                }
            });
        });
    } else {
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.setAttribute('colspan', '9');
        noDataCell.textContent = 'No inspections logged yet.';
        noDataCell.style.textAlign = 'center';
        noDataRow.appendChild(noDataCell);
        logContainer.appendChild(noDataRow);
    }
});

async function deleteInspection(index) {
    let logData = await loadData("inspectionLogs") || [];
    logData.splice(index, 1);
    await saveData("inspectionLogs", logData);
    window.location.reload(); // Refresh page to reflect changes
}







