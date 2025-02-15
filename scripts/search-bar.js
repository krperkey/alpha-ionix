// Import localForage for persistent storage
import { loadData } from "./data-handler.js";

// Attach event listeners to search elements
document.getElementById('search-button').addEventListener('click', performSearch);
document.getElementById('search-bar').addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') performSearch();
});

// Perform search across batches, samples, and workorders
async function performSearch() {
    const searchQuery = document.getElementById('search-bar').value.trim();

    if (!searchQuery) {
        alert('Please enter a search query.');
        return;
    }

    // Fetch stored data asynchronously
    const [batches, samples, workorders] = await Promise.all([
        loadData('batches') || [],
        loadData('sampleDataArray') || [],
        loadData('workordersArray') || []
    ]);

    // Search for matches and redirect with the highlight parameter
    const batch = batches.find(b => b.batchId === searchQuery);
    if (batch) {
        window.location.href = `batches.html?batchId=${batch.batchId}&highlight=true`;
        return;
    }

    const sample = samples.find(s => s.id === searchQuery);
    if (sample) {
        window.location.href = `samples.html?id=${sample.id}&highlight=true`;
        return;
    }

    const workorder = workorders.find(w => w.id === searchQuery);
    if (workorder) {
        window.location.href = `workorders.html?id=${workorder.id}&highlight=true`;
        return;
    }

    alert('No results found for your search query.');
}

