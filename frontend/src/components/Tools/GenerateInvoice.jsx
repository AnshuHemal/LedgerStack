import React, { useState, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib"; // Import PDF-lib

const GenerateInvoice = () => {
  const [header, setHeader] = useState("Invoice Header");
  const [content, setContent] = useState("Invoice Content...");
  const [footer, setFooter] = useState("Invoice Footer");

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Function to generate the PDF dynamically
  const generatePDF = async () => {
    // Create a new PDF document
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 400]); // A4 paper size (or any size)

    const { width, height } = page.getSize();

    // Add header to the PDF
    page.drawText(header, {
      x: width / 2 - header.length * 4, // Center text horizontally
      y: height - 50, // 50px from the top
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add content to the PDF
    page.drawText(content, {
      x: 50,
      y: height - 100, // 100px from the top
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add footer to the PDF
    page.drawText(footer, {
      x: width / 2 - footer.length * 4, // Center footer text
      y: 30, // 30px from the bottom
      size: 10,
      color: rgb(0, 0, 0),
    });

    // Serialize the document to bytes
    const pdfBytes = await doc.save();

    // Create a Blob from the PDF bytes
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(blob);

    // Set the preview URL to display the PDF
    setPdfPreviewUrl(pdfUrl);
  };

  // Effect hook to generate PDF when any input changes
  useEffect(() => {
    generatePDF(); // Regenerate PDF whenever any field is updated
  }, [header, content, footer]);

  return (
    <div className="App" style={{ display: "flex", padding: "20px" }}>
      {/* Left side: Form Fields */}
      <div style={{ flex: 1, paddingRight: "20px" }}>
        <h1>Invoice Generator</h1>

        <div>
          <label>Header:</label>
          <input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Enter invoice header"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter invoice content"
            rows="6"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Footer:</label>
          <input
            type="text"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Enter footer"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
      </div>

      {/* Right side: PDF Preview */}
      <div
        style={{ flex: 1, paddingLeft: "20px", borderLeft: "1px solid #ddd" }}
      >
        <h1>PDF Preview</h1>

        {pdfPreviewUrl ? (
          <iframe
            src={pdfPreviewUrl}
            width="100%"
            height="500px"
            title="PDF Preview"
            style={{ border: "none" }}
          />
        ) : (
          <p>Loading PDF preview...</p>
        )}
      </div>
    </div>
  );
};

export default GenerateInvoice;
