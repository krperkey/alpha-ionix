// Load existing standards from localStorage and display in the table
function loadStandards() {
    const standards = JSON.parse(localStorage.getItem('standards')) || [];
    const tableBody = document.querySelector('#standards-table tbody');
    tableBody.innerHTML = '';

    standards.forEach((standard, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><a href="standard-details.html?id=${standard.id}" class="standard-link">${standard.id}</a></td>
            <td>${standard.name}</td>
            <td>${standard.createdDate}</td>
            <td>${standard.expirationDate}</td>
            <td>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => button.addEventListener('click', deleteStandard));
}

// Delete a standard from localStorage and remove the row
function deleteStandard(event) {
    const index = parseInt(event.target.dataset.index, 10);
    let standards = JSON.parse(localStorage.getItem('standards')) || [];

    if (confirm('Are you sure you want to delete this standard?')) {
        // Remove the standard from the array and update localStorage
        standards.splice(index, 1);
        localStorage.setItem('standards', JSON.stringify(standards));

        // Remove the row from the table
        const row = event.target.closest('tr');
        row.parentNode.removeChild(row);
    }
}

// Initialize the page
window.onload = function () {
    loadStandards();
    handleTableRefresh();
};
