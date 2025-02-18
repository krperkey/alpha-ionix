import { loadData, saveData } from "./data-handler.js";

document.addEventListener("DOMContentLoaded", async function () {
    const userTableBody = document.querySelector(".user-table tbody");
    const addUserForm = document.querySelector("#add-user-form");
    const addUserModal = document.querySelector("#add-user-modal");
    const createUserButton = document.querySelector("#create-user-button");
    const closeModalButton = document.querySelector("#close-modal-button");
    const userRoleDropdown = document.querySelector("#user-role");

    let editUserIndex = null; // Track user being edited
    let users = await loadData("users") || []; // Load users from storage

    // Save Users to Local Storage
    async function saveUsersToLocalStorage() {
        await saveData("users", users);
    }

    // Save Initials to Local Storage
    async function saveInitialsToLocalStorage() {
        const userInitials = users.map(user => user.initials).filter(initials => initials);
        await saveData("analystInitials", userInitials);
    }

    // Render Users in the Table
    async function renderUsers() {
        userTableBody.innerHTML = ""; // Clear the table

        if (users.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="13">No users available. Create a new one!</td></tr>`;
        } else {
            users.forEach((user, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.userNumber}</td>
                    <td>${user.username}</td>
                    <td>${user.employeeID}</td>
                    <td>${user.firstName}</td>
                    <td>${user.middleName || ""}</td>
                    <td>${user.lastName}</td>
                    <td>${user.initials}</td>
                    <td>${user.positionTitle}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.userRole}</td>
                    <td>${user.status}</td>
                    <td>
                        <select class="user-actions" data-index="${index}">
                            <option value="" hidden>Actions</option> <!-- Hidden option -->
                            <option value="edit">Edit</option>
                            <option value="inactivate">Inactivate</option>
                            <option value="reset-password">Reset Password</option>
                            <option value="delete">Delete</option>
                        </select>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }

        // Attach event listeners to dropdowns
        document.querySelectorAll(".user-actions").forEach(select => {
            select.addEventListener("change", async function () {
                const index = this.dataset.index;
                const selectedAction = this.value;
        
                if (selectedAction) {
                    this.selectedIndex = 0; // Resets dropdown to "Actions" after selection
                }
        
                if (selectedAction === "edit") {
                    editUser(index);
                } else if (selectedAction === "inactivate") {
                    inactivateUser(index);
                } else if (selectedAction === "reset-password") {
                    resetPassword(index);
                } else if (selectedAction === "delete") {
                    deleteUser(index);
                }
            });
        });
        
        

        await saveInitialsToLocalStorage(); // Save initials after rendering
    }

    // Edit User Function
    function editUser(index) {
        const user = users[index];
        document.querySelector("#first-name").value = user.firstName;
        document.querySelector("#middle-name").value = user.middleName;
        document.querySelector("#last-name").value = user.lastName;
        document.querySelector("#initials").value = user.initials;
        document.querySelector("#username").value = user.username;
        document.querySelector("#position-title").value = user.positionTitle;
        document.querySelector("#email").value = user.email;
        document.querySelector("#phone").value = user.phone;
        userRoleDropdown.value = user.userRole;
        document.querySelector("#employee-id").value = user.employeeID;

        editUserIndex = index;
        addUserModal.classList.add("show");
    }

    // Inactivate User Function
    async function inactivateUser(index) {
        users[index].status = "Inactive";
        await saveUsersToLocalStorage();
        await renderUsers();
    }

    // Reset Password Function
    async function resetPassword(index) {
        const newPassword = prompt("Enter a new password:");
        const confirmNewPassword = prompt("Confirm the new password:");
        if (newPassword && newPassword === confirmNewPassword) {
            alert(`Password for ${users[index].firstName} ${users[index].lastName} has been reset.`);
        } else {
            alert("Passwords do not match. Password reset failed.");
        }
    }

    // Delete User Function
    async function deleteUser(index) {
        if (confirm("Are you sure you want to delete this user?")) {
            users.splice(index, 1);
            await saveUsersToLocalStorage();
            await renderUsers();
        }
    }

    // Generate Random User Number
    async function generateUserNumber() {
        return String(Math.floor(1000 + Math.random() * 9000)); // Random 4-digit number
    }

    // Populate User Role Dropdown
    async function populateUserRoleDropdown() {
        const roles = await loadData("roles") || [];
        userRoleDropdown.innerHTML = '<option value="" disabled selected>Select a role</option>';
        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.name;
            option.textContent = role.name;
            userRoleDropdown.appendChild(option);
        });
    }

    // Event Listener: Open "Add User" Modal
    createUserButton.addEventListener("click", async function () {
        editUserIndex = null;
        addUserForm.reset();
        await populateUserRoleDropdown();
        addUserModal.classList.add("show");
    });

    // Event Listener: Close "Add User" Modal
    closeModalButton.addEventListener("click", function () {
        addUserModal.classList.remove("show");
    });

    // Event Listener: Add/Edit User
    addUserForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const firstName = document.querySelector("#first-name").value.trim();
        const middleName = document.querySelector("#middle-name").value.trim();
        const lastName = document.querySelector("#last-name").value.trim();
        const initials = document.querySelector("#initials").value.trim();
        const positionTitle = document.querySelector("#position-title").value.trim();
        const email = document.querySelector("#email").value.trim();
        const phone = document.querySelector("#phone").value.trim();
        const userRole = userRoleDropdown.value.trim();
        const employeeID = document.querySelector("#employee-id").value.trim();
        const username = document.querySelector("#username").value.trim();
        const password = document.querySelector("#password").value.trim();
        const confirmPassword = document.querySelector("#confirm-password").value.trim();

        if (password !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        if (firstName && middleName && lastName && initials && positionTitle && email && phone && userRole && employeeID) {
            if (editUserIndex !== null) {
                // Edit existing user
                users[editUserIndex] = {
                    ...users[editUserIndex],
                    firstName,
                    middleName,
                    lastName,
                    initials,
                    positionTitle,
                    email,
                    phone,
                    employeeID,
                    userRole
                };
                alert("User updated successfully!");
            } else {
                // Add new user
                const userNumber = await generateUserNumber();
                users.push({
                    userNumber, username, employeeID, firstName, middleName, lastName,
                    initials, positionTitle, email, phone, userRole, status: "Active"
                });
                alert("User added successfully!");
            }

            await saveUsersToLocalStorage();
            await renderUsers();
            addUserForm.reset();
            addUserModal.classList.remove("show");
        } else {
            alert("Please fill in all required fields.");
        }
    });

    // Load & Render Users on Page Load
    await renderUsers();
});

