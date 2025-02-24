import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    // Retrieve roles from localStorage or set default roles
    const roles = await loadData("roles") || [
        { name: "General User", description: "Default access level.", permissions: ["read"] },
        { name: "Administrator", description: "Full system access.", permissions: ["read", "write", "delete", "admin"] },
    ];

    const roleList = document.querySelector("#role-list tbody");
    const modal = document.querySelector("#edit-modal");
    const closeModalButton = document.querySelector("#close-modal");
    const saveChangesButton = document.querySelector("#save-changes");

    const roleNameInput = document.querySelector("#edit-role-name");
    const roleDescriptionInput = document.querySelector("#edit-role-description");
    const rolePermissionsInput = document.querySelector("#edit-role-permissions");

    let editingIndex = null;

    // Populate roles into the table
    async function populateRoles() {
        roleList.innerHTML = ""; // Clear the table body
        roles.forEach((role, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${role.name}</td>
                <td>${role.description}</td>
                <td>${role.permissions.join(", ")}</td>
                <td>
                    <button class="edit-role" data-index="${index}">Edit</button>
                    <button class="delete-role" data-index="${index}">Delete</button>
                </td>
            `;
            roleList.appendChild(row);
        });
    }

    // Save roles to localStorage
    async function saveToLocalStorage() {
        await saveData("roles", roles);
    }

    // Open the modal for editing
    async function openModal(role, index) {
        editingIndex = index;
        roleNameInput.value = role.name;
        roleDescriptionInput.value = role.description;

        // Update permissions in the select box
        Array.from(rolePermissionsInput.options).forEach((option) => {
            option.selected = role.permissions.includes(option.value);
        });

        modal.style.display = "block";
    }

    // Close the modal
    async function closeModal() {
        modal.style.display = "none";
        editingIndex = null;
        roleNameInput.value = "";
        roleDescriptionInput.value = "";
        rolePermissionsInput.selectedIndex = -1;
    }

    // Save changes to the role
    async function saveChanges() {
        const updatedName = roleNameInput.value.trim();
        const updatedDescription = roleDescriptionInput.value.trim();
        const updatedPermissions = Array.from(rolePermissionsInput.selectedOptions).map((option) => option.value);

        if (updatedName && updatedDescription && updatedPermissions.length) {
            roles[editingIndex] = { name: updatedName, description: updatedDescription, permissions: updatedPermissions };
            saveToLocalStorage();
            populateRoles();
            closeModal();
        } else {
            alert("Please fill out all fields and select at least one permission.");
        }
    }

    // Handle creating a new role
    document.querySelector("#create-role-button").addEventListener("click", async function () {
        const name = document.querySelector("#role-name").value.trim();
        const description = document.querySelector("#role-description").value.trim();
        const permissions = Array.from(document.querySelector("#role-permissions").selectedOptions).map((option) => option.value);

        if (name && description && permissions.length) {
            roles.push({ name, description, permissions });
            saveToLocalStorage();
            populateRoles();
            document.querySelector("#role-name").value = "";
            document.querySelector("#role-description").value = "";
            document.querySelector("#role-permissions").selectedIndex = -1;
            alert("Role created successfully!");
        } else {
            alert("Please fill out all fields and select at least one permission.");
        }
    });

    // Handle editing and deleting roles
    roleList.addEventListener("click", async function (e) {
        if (e.target.classList.contains("edit-role")) {
            const index = e.target.dataset.index;
            openModal(roles[index], index);
        }

        if (e.target.classList.contains("delete-role")) {
            const index = e.target.dataset.index;
            roles.splice(index, 1);
            saveToLocalStorage();
            populateRoles();
        }
    });

    // Event listeners for modal
    closeModalButton.addEventListener("click", closeModal);
    saveChangesButton.addEventListener("click", saveChanges);

    // Populate the table initially
    populateRoles();
};

// Get modal elements
const createRoleModal = document.querySelector("#create-role-modal");
const openCreateRoleButton = document.querySelector("#open-create-role-modal");
const closeCreateModalButton = document.querySelector("#close-create-modal");

// Open the "Create Role" modal
openCreateRoleButton.addEventListener("click", () => {
    createRoleModal.style.display = "block";
});

// Close the modal when clicking the close button
closeCreateModalButton.addEventListener("click", () => {
    createRoleModal.style.display = "none";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === createRoleModal) {
        createRoleModal.style.display = "none";
    }
});
