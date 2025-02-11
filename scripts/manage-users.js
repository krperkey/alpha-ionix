import { loadData, saveData } from './data-handler.js';

// Open the modal when "Add New User" is clicked
document.getElementById('add-user-btn').addEventListener('click', function() {
    document.getElementById('add-user-modal').style.display = 'flex';
});

// Close the modal when the close button is clicked
document.getElementById('close-modal-btn').addEventListener('click', function() {
    document.getElementById('add-user-modal').style.display = 'none';
});

// Handle form submission
document.getElementById('add-user-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent form from refreshing the page

    // Get form data
    const userId = document.getElementById('user-id').value.trim();
    const userName = document.getElementById('user-name').value.trim();
    const userEmail = document.getElementById('user-email').value.trim();
    const userRole = document.getElementById('user-role').value.trim();

    if (!userId || !userName || !userEmail || !userRole) {
        alert("Please fill in all fields.");
        return;
    }

    // Load existing users from localForage
    const users = await loadData('users') || [];

    // Create new user object
    const newUser = { userId, userName, userEmail, userRole };

    // Save user to localForage
    users.push(newUser);
    await saveData('users', users);

    // Add new row to the table
    const table = document.getElementById('users-table').querySelector('tbody');
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td>${userId}</td>
        <td>${userName}</td>
        <td>${userEmail}</td>
        <td>${userRole}</td>
        <td>
            <button class="edit-user-btn" data-user-id="${userId}">Edit</button>
            <button class="delete-user-btn" data-user-id="${userId}">Delete</button>
        </td>
    `;

    // Clear the form
    document.getElementById('add-user-form').reset();

    // Close the modal
    document.getElementById('add-user-modal').style.display = 'none';
});

