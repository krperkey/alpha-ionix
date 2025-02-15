// Import localForage for persistent storage
import { loadData } from "./data-handler.js";

// Fetch and display the standard details based on the ID from the URL
async function loadStandardDetails() {
    const params = new URLSearchParams(window.location.search);
    const standardId = params.get('id');

    if (!standardId) {
        alert('Invalid standard ID.');
        window.location.href = 'standards.html';
        return;
    }

    // Fetch standards asynchronously from localForage
    const standards = await loadData('standards') || [];
    const standard = standards.find(std => std.id === standardId);

    if (!standard) {
        alert('Standard not found.');
        window.location.href = 'standards.html';
        return;
    }

    const container = document.getElementById('standard-details-container');
    container.innerHTML = `
        <section id="standard-form-container">
            <table class="standards-table">
                <h3>Standard Specification</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Standard Name</th>
                            <th>Volume</th>
                            <th>Units</th>
                            <th>Created Date</th>
                            <th>Created By</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${standard.name}</td>
                            <td>${standard.volume}</td>
                            <td>${standard.units}</td>
                            <td>${standard.createdDate}</td>
                            <td>${standard.createdBy}</td>
                        </tr>
                    </tbody>
                </table>
            </table>

            <!-- Second Table -->
            <table class="standards-table">
                <h3>Manufacturer Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Manufacturer</th>
                            <th>Part Number</th>
                            <th>Lot Number</th>
                            <th>Matrix</th>
                            <th>Purity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${standard.manufacturer}</td>
                            <td>${standard.partNumber}</td>
                            <td>${standard.lotNumber}</td>
                            <td>${standard.matrix}</td>
                            <td>${standard.purity}</td>
                        </tr>
                    </tbody>
                </table>
            </table>

            <!-- Third Table -->
            <table class="standards-table">
                <h3>Certification & Expiration</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Preparation Date</th>
                            <th>Certification Issue Date</th>
                            <th>Expiration Date</th>
                            <th>Certificate of Analysis (COA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${standard.preparationDate}</td>
                            <td>${standard.certificationIssueDate}</td>
                            <td>${standard.expirationDate}</td>
                            <td>${standard.coa}</td>
                        </tr>
                    </tbody>
                </table>
            </table>
        </section>

        <section id="analytes-section"> 
            <table class="analytes-table">      
                <h3>Analytes</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Analyte</th>
                            <th>CAS#</th>
                            <th>Concentration</th>
                            <th>Units</th>
                            <th>Uncertainty (+/-)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standard.analytes.map(analyte => `
                            <tr>
                                <td>${analyte.analyte}</td>
                                <td>${analyte.casNumber}</td>
                                <td>${analyte.concentration}</td>
                                <td>${analyte.units}</td>
                                <td>${analyte.uncertainty}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </table>
        </section>
    `;
}

// Initialize the page
window.onload = loadStandardDetails;

