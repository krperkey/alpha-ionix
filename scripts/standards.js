// Import localForage for persistent storage
import { loadData, saveData } from "./data-handler.js";

// Load existing standards from localForage and display them in the table
async function loadStandards() {
    const standards = await loadData('standards') || [];
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
async function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', deleteStandard); // Prevent duplicate listeners
        button.addEventListener('click', deleteStandard);
    });
}

// Delete a standard from localForage and update the table
async function deleteStandard(event) {
    const index = parseInt(event.target.dataset.index, 10);
    let standards = await loadData('standards') || [];

    if (confirm('Are you sure you want to delete this standard?')) {
        standards.splice(index, 1); // Remove the standard from the array
        await saveData('standards', standards); // Save updated list

        loadStandards(); // Refresh the table
    }
}

// Initialize the page on load
window.onload = async function () {
    loadStandards();
};

