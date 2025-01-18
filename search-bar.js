const searchIndex = [
    {
        title: 'Workorders',
        url: 'workorders.html',
        content: [
            'Workorder ID', 'Description', 'Client Profile', 'Facility Name', 'Status', 'Open', 'In Progress', 'Closed'
        ],
    },
    {
        title: 'Batches',
        url: 'batches.html',
        content: [
            'Batch ID', 'Analysis', 'Date Created', 'Number of Samples', 'Pending', 'Complete'
        ],
    },
    {
        title: 'Users',
        url: 'manage-users.html',
        content: [
            'User ID', 'Name', 'Email', 'Role', 'Admin', 'User'
        ],
    },
    // Add more pages as needed
];

document.getElementById('search-button').addEventListener('click', performSearch);
    document.getElementById('search-bar').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const query = document.getElementById('search-bar').value.trim();
        if (!query) {
            alert('Please enter a Batch ID.');
            return;
        }

        // Redirect to search-results.html with the query as a URL parameter
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    }


function displayResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ''; // Clear previous results

    results.forEach((result) => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.innerHTML = `
            <a href="${result.url}" target="_blank">${result.title}</a>
        `;
        resultsContainer.appendChild(resultElement);
    });

    resultsContainer.style.display = 'block'; // Show the results container
}

if (matchedBatch) {
    resultsContainer.innerHTML = `
        <div class="result-item">
            <h2>Batch ID: ${matchedBatch.batchId}</h2>
            <p><a href="batches.html?batchId=${matchedBatch.batchId}">View in Batches Page</a></p>
            <p><a href="batch-details.html?batchId=${matchedBatch.batchId}">View Batch Details</a></p>
            <p><a href="batch-results.html?batchId=${matchedBatch.batchId}">View Batch Results</a></p>
            <p><a href="workorders.html?batchId=${matchedBatch.batchId}">View Associated Workorders</a></p>
        </div>
    `;
}






