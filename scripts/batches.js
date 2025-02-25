import { loadData, saveData } from './data-handler.js';

window.onload = async function () {
    const tableBody = document.querySelector("#sample-table tbody");

    // Retrieve batch details from localForage and ensure it's an array
    const batches = Array.isArray(await loadData("batches")) ? await loadData("batches") : [];

    // Clear existing rows in the table
    tableBody.innerHTML = "";

    // Populate table with batch details
    batches.forEach((batch, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="batch-details.html?batchId=${batch.batchId}">${batch.batchId}</a></td>
            <td>${batch.analysis}</td>
            <td>${batch.createdDate}</td>
            <td>${batch.numberOfSamples}</td>
            <td>${batch.status}</td>
            <td><button class="delete-btn">Delete</button></td>
        `;

        // Add delete button functionality
        const deleteButton = row.querySelector(".delete-btn");
        deleteButton.addEventListener("click", function() {
            deleteBatch(index);
        });

        tableBody.appendChild(row);
    });
};

// Function to delete a batch
async function deleteBatch(index) {
    // Retrieve batch details from localForage and ensure it's an array
    let batches = Array.isArray(await loadData("batches")) ? await loadData("batches") : [];

    if (batches.length > 0) {
        // Remove the batch at the specified index
        batches.splice(index, 1);

        // Save the updated batch list back to localForage
        await saveData("batches", batches);

        // Reload the page to reflect the changes
        window.location.reload();
    }
}

// Add event listener for the new batch creation button
document.getElementById('new-batch').addEventListener('click', function() {
    window.location.href = 'create-batches.html';
});
