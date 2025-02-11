// Import localForage for persistent storage
import localforage from "https://cdn.jsdelivr.net/npm/localforage/dist/localforage.min.js";

// Load existing standards from localForage and display them in the table
async function loadStandards() {
    const standards = await localforage.getItem('standards') || [];
    const tableBody = document.querySelector('#standards-table tbody');
    tableBody.innerHTML = ''; // Clear existing content

    standards.forEach((standard, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="standard-details.html?id=${standard.id}" class="standard-link">${standard.id}</a></td>
            <td>${standard.name}</td>
            <td>${standard.createdDate}</td>
            <td>${standard.expirationDate}</td>
            <td><button class="delete-btn" data-index="${index}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });

    attachDeleteEventListeners();
}

// Attach event listeners for delete buttons
function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', deleteStandard); // Prevent duplicate listeners
        button.addEventListener('click', deleteStandard);
    });
}

// Delete a standard from localForage and update the table
async function deleteStandard(event) {
    const index = parseInt(event.target.dataset.index, 10);
    let standards = await localforage.getItem('standards') || [];

    if (confirm('Are you sure you want to delete this standard?')) {
        standards.splice(index, 1); // Remove the standard from the array
        await localforage.setItem('standards', standards); // Save updated list

        loadStandards(); // Refresh the table
    }
}

// Initialize the page on load
window.onload = function () {
    loadStandards();
};

