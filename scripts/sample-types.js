import { loadData, saveData } from "./data-handler.js";

window.onload = async function () {
    const sampleTypes = await loadData('sampleTypes') || [];
    const tableBody = document.querySelector("#sample-types-table tbody");
    tableBody.innerHTML = ''; // Clear existing content

    if (sampleTypes.length === 0) {
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="7">No sample types available. Create a new one!</td>`;
        tableBody.appendChild(noDataRow);
    } else {
        sampleTypes.forEach((sampleType, index) => {
            const specification = [];
            if (sampleType.accuracy) specification.push("Accuracy");
            if (sampleType.precision) specification.push("Precision");
            if (sampleType.pql) specification.push("PQL");

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${sampleType.type}</td>
                <td>${sampleType.typeAbbreviation || "N/A"}</td>
                <td>${sampleType.typeName || "N/A"}</td>
                <td>${sampleType.typeNameAbbreviation || "N/A"}</td>
                <td>${sampleType.description}</td>
                <td>${specification.join(", ") || "None"}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Remove functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const index = this.dataset.index;
            sampleTypes.splice(index, 1);
            await saveData('sampleTypes', sampleTypes);
            location.reload();
        });
    });

    // Edit functionality
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.dataset.index;
            const sampleType = sampleTypes[index];

            document.getElementById('edit-sample-type').value = sampleType.type;
            document.getElementById('edit-sample-type-abbreviation').value = sampleType.typeAbbreviation || "";
            document.getElementById('edit-sample-type-name').value = sampleType.typeName || "";
            document.getElementById('edit-sample-type-name-abbreviation').value = sampleType.typeNameAbbreviation || "";
            document.getElementById('edit-sample-description').value = sampleType.description;
            document.getElementById('edit-accuracy').checked = sampleType.accuracy || false;
            document.getElementById('edit-precision').checked = sampleType.precision || false;
            document.getElementById('edit-pql').checked = sampleType.pql || false;

            document.getElementById('edit-modal').style.display = 'block';

            // Save changes
            document.getElementById('save-edit').onclick = async function () {
                sampleType.type = document.getElementById('edit-sample-type').value;
                sampleType.typeAbbreviation = document.getElementById('edit-sample-type-abbreviation').value;
                sampleType.typeName = document.getElementById('edit-sample-type-name').value;
                sampleType.typeNameAbbreviation = document.getElementById('edit-sample-type-name-abbreviation').value;
                sampleType.description = document.getElementById('edit-sample-description').value;
                sampleType.accuracy = document.getElementById('edit-accuracy').checked;
                sampleType.precision = document.getElementById('edit-precision').checked;
                sampleType.pql = document.getElementById('edit-pql').checked;

                sampleTypes[index] = sampleType;
                await saveData('sampleTypes', sampleTypes);
                location.reload();
            };

            // Cancel edit
            document.getElementById('cancel-edit').onclick = function () {
                document.getElementById('edit-modal').style.display = 'none';
            };
        });
    });

    // Open "New Sample Type" modal instead of navigating away
    document.getElementById('new-sample-type').addEventListener('click', function () {
        document.getElementById('new-sample-type-modal').style.display = 'block';
    });

    // Save new sample type
    document.getElementById('save-new-sample-type').addEventListener('click', async function () {
        const newType = document.getElementById('new-sample-type-input').value.trim();
        const newTypeAbbreviation = document.getElementById('new-sample-type-abbreviation').value.trim();
        const newTypeName = document.getElementById('new-sample-type-name').value.trim();
        const newTypeNameAbbreviation = document.getElementById('new-sample-type-name-abbreviation').value.trim();
        const newDescription = document.getElementById('new-sample-description').value.trim();
        const accuracy = document.getElementById('new-accuracy').checked;
        const precision = document.getElementById('new-precision').checked;
        const pql = document.getElementById('new-pql').checked;

        if (!newType || !newTypeAbbreviation || !newTypeName || !newTypeNameAbbreviation || !newDescription) {
            alert("All fields are required!");
            return;
        }

        sampleTypes.push({
            type: newType,
            typeAbbreviation: newTypeAbbreviation,
            typeName: newTypeName,
            typeNameAbbreviation: newTypeNameAbbreviation,
            description: newDescription,
            accuracy,
            precision,
            pql
        });

        await saveData('sampleTypes', sampleTypes);

        // Close modal and refresh page
        document.getElementById('new-sample-type-modal').style.display = 'none';
        location.reload();
    });

    // Cancel new sample type creation
    document.getElementById('cancel-new-sample-type').addEventListener('click', function () {
        document.getElementById('new-sample-type-modal').style.display = 'none';
    });
};
