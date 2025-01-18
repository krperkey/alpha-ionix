// Open the modal when "Add New User" is clicked
document.getElementById('add-user-btn').addEventListener('click', function() {
    document.getElementById('add-user-modal').style.display = 'flex';
});

// Close the modal when the close button is clicked
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('add-user-modal').style.display = 'none';
});

// Handle form submission
document.getElementById('add-user-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form data
    const userId = document.getElementById('user-id').value;
    const userName = document.getElementById('user-name').value;
    const userEmail = document.getElementById('user-email').value;
    const userRole = document.getElementById('user-role').value;

    // Add new row to the table
    const table = document.getElementById('users-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${userId}</td>
        <td>${userName}</td>
        <td>${userEmail}</td>
        <td>${userRole}</td>
        <td>
            <button>Edit</button>
            <button>Delete</button>
        </td>
    `;

    // Clear the form
    document.getElementById('add-user-form').reset();

    // Close the modal
    document.getElementById('add-user-modal').style.display = 'none';
});
