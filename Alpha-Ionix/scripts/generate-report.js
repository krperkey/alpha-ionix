function generateReport() {
    const urlParams = new URLSearchParams(window.location.search);
    const workorderID = urlParams.get('id');
    const workordersArray = JSON.parse(localStorage.getItem('workordersArray')) || [];
    const sampleDataArray = JSON.parse(localStorage.getItem('sampleDataArray')) || [];
    const batches = JSON.parse(localStorage.getItem('batches')) || [];

    const workorder = workordersArray.find(w => w.id === workorderID);

    if (!workorder) {
        alert('Workorder not found!');
        return;
    }

    const doc = new jspdf.jsPDF();

    // Custom font
    doc.setFont("helvetica", "bold");

    // Function to add headers and footers
    const addHeaderFooter = (doc, pageNumber, totalPages) => {
        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100);
        doc.text(`Reported: ${new Date().toLocaleString()}`, 10, 290); // Generated date at bottom-left
        doc.text(`Page ${pageNumber} of ${totalPages}`, 200, 290, { align: "right" }); // Page number at bottom-right
    };

    // Add light background for each page
    const addBackground = (doc) => {
        doc.setFillColor(255, 255, 255); // Light gray (#F5F5F5)
        doc.rect(0, 0, 210, 297, 'F'); // Full-page rectangle
    };

    // Add styled title to each page
    const addTitle = (doc, title) => {
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Gold
        doc.text(title, 105, 25, { align: "center" });

        doc.setDrawColor(218, 165, 32); // Gold
        doc.setLineWidth(0.5);
        doc.line(14, 27.5, 195.7, 27.5); // Horizontal line below the title
    };

    // Total pages tracker
    let currentPage = 1;

    // Page 1: Workorder Info and Samples Table
    addBackground(doc);
    addTitle(doc, "Workorder Summary");
    addHeaderFooter(doc, currentPage++, "");

    const workorderTable = [
        ['Workorder ID', workorder.id],
        ['Client Profile', workorder.clientProfile],
        ['Facility Name', workorder.facilityId],
        ['Description', workorder.description],
    ];
    doc.autoTable({
        startY: 30,
        head: [['Field', 'Value']],
        body: workorderTable,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [218, 165, 32] }, // Black with gold text
        bodyStyles: { textColor: [0, 0, 0], fillColor: [245, 245, 245] }, // Black text on light gray rows
        alternateRowStyles: { fillColor: [255, 255, 255] }, // White for alternating rows
    });

    const sampleTable = workorder.samples.map(sample => [
        sample.id,
        sample.collectDate || 'N/A',
        sample.analysis || 'N/A',
        sample.holdTime || 'N/A',
        sample.dueDate || 'N/A',
        sample.sampleDescription || 'N/A',
    ]);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [
            ['Sample ID', 'Collect Date', 'Analysis', 'Hold Time', 'Due Date', 'Description'],
        ],
        body: sampleTable,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [218, 165, 32] },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0], fillColor: [245, 245, 245] },
    });

    // Page 2: Batch Info
    doc.addPage();
    addBackground(doc);
    addTitle(doc, "Batch Summary");
    addHeaderFooter(doc, currentPage++, "");

    const batchInfoTable = workorder.samples.map(sample => {
        const sampleData = sampleDataArray.find(s => s.id === sample.id) || {};
        const batch = batches.find(b => b.batchId === sampleData.batchId) || {};
        return [
            sample.id || 'N/A', // Sample ID
            sampleData.batchId || 'N/A',
            sampleData.analysis || 'N/A',
        ];
    });

    doc.autoTable({
        startY: 30,
        head: [['Sample ID', 'Batch ID', 'Analysis']],
        body: batchInfoTable,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [218, 165, 32] },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0], fillColor: [245, 245, 245] },
    });

    // Subsequent Pages: Sample Details
    workorder.samples.forEach(sample => {
        doc.addPage();
        addBackground(doc);
        addTitle(doc, `Sample Details: ${sample.id}`);
        addHeaderFooter(doc, currentPage++, "");

        const sampleData = sampleDataArray.find(s => s.id === sample.id) || {};
        const batchID = sampleData.batchId || 'Unknown';
        const batch = batches.find(b => b.batchId === batchID) || {};
        const savedResultsKey = `savedBatchResults-${batchID}`;
        const savedResults = JSON.parse(localStorage.getItem(savedResultsKey)) || {};
        const sampleResults = savedResults[sample.id] || {};
        const analytes = sample.analytes || [];

        const sampleTable = [
            ['Sample ID', sample.id],
            ['Batch ID', batchID],
            ['Collect Date', sample.collectDate || 'N/A'],
            ['Analysis', sample.analysis || 'N/A'],
            ['Description', sample.sampleDescription || 'N/A'],
        ];

        doc.autoTable({
            startY: 30,
            head: [['Field', 'Value']],
            body: sampleTable,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [218, 165, 32] },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            bodyStyles: { textColor: [0, 0, 0], fillColor: [245, 245, 245] },
        });

        if (analytes.length > 0) {
            const resultsTable = analytes.map((analyte, index) => {
                const analyteResult = sampleResults.analytes?.[index] || {};
                const resultValue = analyteResult.result < analyteResult.loq ? 'ND' : analyteResult.result;
                return [
                    analyte, // Analyte Name
                    sampleResults.runDate || 'N/A', // Run Date
                    sampleResults.analyst || 'N/A', // Analyst Name
                    resultValue, // Result or 'ND'
                    analyteResult.units || 'N/A', // Units
                    analyteResult.loq || 'N/A', // Reporting Limit
                ];
            });
        
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['Analyte', 'Run Date', 'Analyst', 'Result', 'Units', 'Reporting Limit']],
                body: resultsTable,
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0], textColor: [218, 165, 32] },
                alternateRowStyles: { fillColor: [255, 255, 255] },
                bodyStyles: { textColor: [0, 0, 0], fillColor: [245, 245, 245] },
            });
        } else {
            doc.text('No sample results available.', 10, doc.lastAutoTable.finalY + 20);
        }
    });        

    // Save the PDF
    doc.save(`Workorder_${workorder.id}_Report.pdf`);
}

















    