import { loadData, saveData } from "./data-handler.js";

document.addEventListener("DOMContentLoaded", async function () {
    const userTableBody = document.querySelector(".user-table tbody");
    const addUserForm = document.querySelector("#add-user-form");
    const addUserModal = document.querySelector("#add-user-modal");
    const createUserButton = document.querySelector("#create-user-button");
    const closeModalButton = document.querySelector("#close-modal-button");
    const userRoleDropdown = document.querySelector("#user-role");

    let editUserIndex = null; // Track user being edited

    // Load users from local storage or initialize with mock data
    let users = await loadData("users") || [];

    // Save users to local storage
    async function saveUsersToLocalStorage() {
        await saveData("users", users);
    }

    // Save initials to localStorage
    async function saveInitialsToLocalStorage() {
        const userInitials = users.map(user => user.initials).filter(initials => initials);
        await saveData("analystInitials", userInitials);
    }

    // Function to render users in the table
    async function renderUsers() {
        userTableBody.innerHTML = ""; // Clear the table body

        if (users.length === 0) {
            const noDataRow = document.createElement("tr");
            noDataRow.innerHTML = `<td colspan="13">No users available. Create a new one!</td>`;
            userTableBody.appendChild(noDataRow);
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
                        <button class="edit-user" data-index="${index}">Edit</button>
                        <button class="inactivate-user" data-index="${index}">Inactivate</button>
                        <button class="reset-password" data-index="${index}">Reset Password</button>
                        <button class="delete-user" data-index="${index}">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        }

        await saveInitialsToLocalStorage(); // Save initials every time the table is rendered
    }

    // ✅ Load & Render Users on Page Load
    await renderUsers();

    // Event listener to show the modal for adding a new user
    createUserButton.addEventListener("click", async function () {
        editUserIndex = null; // Reset edit index
        addUserForm.reset(); // Clear form
        await populateUserRoleDropdown(); // Populate roles in the dropdown
        addUserModal.classList.add("show");
    });

    // Event listener to close the modal
    closeModalButton.addEventListener("click", async function () {
        addUserModal.classList.remove("show");
    });

    // Event listener to add or edit a user
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

        if (firstName && lastName && initials && positionTitle && email && phone && userRole && employeeID) {
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
                users.push({ userNumber, username, employeeID, firstName, middleName, lastName, initials, positionTitle, email, phone, userRole, status: "Active" });
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

    // Event listener for table actions
    userTableBody.addEventListener("click", async function (e) {
        const index = e.target.dataset.index;

        if (e.target.classList.contains("edit-user")) {
            // Load user data into the form
            const user = users[index];
            document.querySelector("#first-name").value = user.firstName;
            document.querySelector("#middle-name").value = user.middleName;
            document.querySelector("#last-name").value = user.lastName;
            document.querySelector("#initials").value = user.initials;
            document.querySelector("#username").value = user.username;
            document.querySelector("#position-title").value = user.positionTitle;
            document.querySelector("#email").value = user.email;
            document.querySelector("#phone").value = user.phone;
            userRoleDropdown.value = user.userRole; // Select the correct role
            document.querySelector("#employee-id").value = user.employeeID;

            editUserIndex = index; // Set edit index
            addUserModal.classList.add("show");
        }

        if (e.target.classList.contains("inactivate-user")) {
            users[index].status = "Inactive";
            await saveUsersToLocalStorage();
            await renderUsers();
        }

        if (e.target.classList.contains("reset-password")) {
            const newPassword = prompt("Enter a new password:");
            const confirmNewPassword = prompt("Confirm the new password:");
            if (newPassword && newPassword === confirmNewPassword) {
                alert(`Password for ${users[index].firstName} ${users[index].lastName} has been reset.`);
            } else {
                alert("Passwords do not match. Password reset failed.");
            }
        }

        if (e.target.classList.contains("delete-user")) {
            if (confirm("Are you sure you want to delete this user?")) {
                users.splice(index, 1);
                await saveUsersToLocalStorage();
                await renderUsers();
            }
        }
    });

    // Function to generate a random 4-digit user number
    async function generateUserNumber() {
        return String(Math.floor(1000 + Math.random() * 9000)); // Random 4-digit number as a string
    }

    // Populate roles into the dropdown
    async function populateUserRoleDropdown() {
        const roles = await loadData("roles") || [];
        userRoleDropdown.innerHTML = '<option value="" disabled selected>Select a role</option>'; // Reset dropdown
        roles.forEach(role => {
            const option = document.createElement("option");
            option.value = role.name;
            option.textContent = role.name;
            userRoleDropdown.appendChild(option);
        });
    }
});
