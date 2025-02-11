import { loadData } from './data-handler.js';

async function generateChartAndTable() {
    const sampleDataArray = await loadData('sampleDataArray') || [];
    const sampleStatusMap = await loadData('sampleStatusMap') || {};

    const analysisCount = {};

    sampleDataArray.forEach(sample => {
        const status = sampleStatusMap[sample.id];
        const samType = sample.sampleType || "Unknown";
        if (status === "In Progress" && samType === "SAM") {
            const analysis = sample.analysis || "Unknown";
            analysisCount[analysis] = (analysisCount[analysis] || 0) + 1;
        }
    });

    const labels = Object.keys(analysisCount);
    const data = Object.values(analysisCount);
    const colors = ['#83A6E7', '#8B0000', '#FF8C00', '#006400', '#00008B', '#ffb900'];

    // Generate the chart
    const ctx = document.getElementById('sample-count-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Analysis Count',
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
                            size: 12,
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

    // Populate the table
    const tableBody = document.querySelector("#department-backlog-table tbody");
    tableBody.innerHTML = "";

    labels.forEach((label, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${label}</td>
            <td>${data[index]}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Call the function on page load
window.onload = async function () {
    generateChartAndTable();
};






