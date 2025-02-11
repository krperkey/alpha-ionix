// JavaScript for User Management Page

window.onload = async function () {
    const userTableBody = document.querySelector(".user-table tbody");
    const addUserForm = document.querySelector("#add-user-form");
    const addUserModal = document.querySelector("#add-user-modal");
    const createUserButton = document.querySelector("#create-user-button");
    const closeModalButton = document.querySelector("#close-modal-button");

    let editUserIndex = null; // Track user being edited

    // Load users from localForage
    let users = await localforage.getItem("users") || [];

    // Save users to localForage
    async function saveUsersToStorage() {
        await localforage.setItem("users", users);
    }

    // Function to generate a random 4-digit user number
    function generateUserNumber() {
        return String(Math.floor(1000 + Math.random() * 9000)); // Random 4-digit number as a string
    }

    // Function to render users in the table
    function renderUsers() {
        userTableBody.innerHTML = ""; // Clear the table body
        users.forEach((user, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.userNumber}</td>
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

    // Event listener to show the modal for adding a new user
    createUserButton.addEventListener("click", function () {
        editUserIndex = null; // Reset edit index
        addUserForm.reset(); // Clear form
        addUserModal.classList.add("show");
    });

    // Event listener to close the modal
    closeModalButton.addEventListener("click", function () {
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
        const userRole = document.querySelector("#user-role").value.trim();
        const employeeID = document.querySelector("#employee-id").value.trim();
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
                const userNumber = generateUserNumber();
                users.push({ userNumber, employeeID, firstName, middleName, lastName, initials, positionTitle, email, phone, userRole, status: "Active" });
                alert("User added successfully!");
            }
            await saveUsersToStorage();
            renderUsers();
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
            document.querySelector("#position-title").value = user.positionTitle;
            document.querySelector("#email").value = user.email;
            document.querySelector("#phone").value = user.phone;
            document.querySelector("#user-role").value = user.userRole;
            document.querySelector("#employee-id").value = user.employeeID;
            editUserIndex = index; // Set edit index
            addUserModal.classList.add("show");
        }

        if (e.target.classList.contains("inactivate-user")) {
            users[index].status = "Inactive";
            await saveUsersToStorage();
            renderUsers();
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
                await saveUsersToStorage();
                renderUsers();
            }
        }
    });

    // Initial render
    renderUsers();
};
