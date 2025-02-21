import { loadData } from './data-handler.js';

async function generateChartAndTable() {
    const sampleDataArray = await loadData('sampleDataArray') || [];
    const sampleStatusMap = await loadData('sampleStatusMap') || {};

    const analyteCount = {}; // For the chart
    const analysisStatusCount = {}; // For the table (counts per analysis)

    sampleDataArray.forEach(sample => {
        const status = sampleStatusMap[sample.id] || "Unknown";
        const samType = sample.sampleType || "Unknown";

        // Only process samples that have sampleType === "SAM"
        if (samType !== "SAM") {
            return; // Skip non-SAM samples
        }

        const analysis = sample.analysis || "Unknown";

        if (!analysisStatusCount[analysis]) {
            analysisStatusCount[analysis] = { inProgress: 0, inReview: 0, total: 0 };
        }

        if (status === "In Progress") {
            // Count samples for the chart (analytes)
            const analytes = sample.analytes 
                ? (Array.isArray(sample.analytes) ? sample.analytes : sample.analytes.split(', ')) 
                : ["Unknown"];
            
            analytes.forEach(analyte => {
                analyteCount[analyte] = (analyteCount[analyte] || 0) + 1;
            });

            // Count "In Progress" for the table
            analysisStatusCount[analysis].inProgress += 1;
        }

        if (status === "In Review") {
            // Count "In Review" for the table
            analysisStatusCount[analysis].inReview += 1;
        }

        // Update the total count (In Progress + In Review)
        analysisStatusCount[analysis].total = analysisStatusCount[analysis].inProgress + analysisStatusCount[analysis].inReview;
    });

    // Chart Data
    const labels = Object.keys(analyteCount);
    const data = Object.values(analyteCount);
    const colors = ['#83A6E7', '#8B0000', '#FF8C00', '#006400', '#00008B', '#ffb900'];

    // Generate the chart
    const ctx = document.getElementById('sample-count-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Production Samples ("SAM" Type) Only - QC not included',
                data: data,
                backgroundColor: colors,
                borderColor: 'darkgray',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        color: '#ffd700',
                        font: {
                            size: 10,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#ffd700',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#ffffff',
                        borderColor: '#ffffff',
                        borderWidth: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Populate the table (Samples per Analysis Count with In Progress, In Review & Total)
    const tableBody = document.querySelector("#department-backlog-table tbody");
    tableBody.innerHTML = "";

    Object.keys(analysisStatusCount).forEach((analysis) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${analysis}</td>
            <td>${analysisStatusCount[analysis].inProgress}</td>
            <td>${analysisStatusCount[analysis].inReview}</td>
            <td>${analysisStatusCount[analysis].total}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Call the function on page load
window.onload = async function () {
    generateChartAndTable();
};




