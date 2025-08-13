import html2pdf from 'html2pdf.js';

export const generateInvoicePDF = async (invoiceData) => {
  console.log('Generating PDF for invoice:', invoiceData);
  
  // Validate input data
  if (!invoiceData) {
    console.error('No invoice data provided');
    return;
  }

  if (!invoiceData.products || !Array.isArray(invoiceData.products)) {
    console.error('Invalid products data');
    return;
  }

  try {
    // Fetch the HTML template
    let htmlTemplate;
    try {
      const response = await fetch('/invoiceTemplate.html');
      if (response.ok) {
        htmlTemplate = await response.text();
      } else {
        throw new Error('Template not found');
      }
    } catch (fetchError) {
      console.log('Using fallback template:', fetchError.message);
      htmlTemplate = await getTemplateFromAssets();
    }

    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = htmlTemplate;
    
    // Populate the template with invoice data
    populateInvoiceData(container, invoiceData);
    
    // Configure PDF options for single page
    const pdfOptions = {
      margin: [5, 5, 5, 5], // Reduced margins to fit more content
      filename: `Invoice_${invoiceData.bill_no?.bill_prefix || 'Invoice_'}${invoiceData.bill_no?.no || 'N/A'}_${new Date(invoiceData.bill_date).toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        height: 1123, // A4 height in pixels at 96 DPI (297mm)
        width: 794   // A4 width in pixels at 96 DPI (210mm)
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    // Generate and download PDF
    await html2pdf().from(container).set(pdfOptions).save();
    
    console.log('PDF generated successfully');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

// Function to populate the HTML template with invoice data
const populateInvoiceData = (container, invoiceData) => {
  // Invoice details
  setElementText(container, '#invoice-number', `${invoiceData.bill_no?.bill_prefix || ''}${invoiceData.bill_no?.no || 'N/A'}`);
  setElementText(container, '#invoice-date', formatDate(invoiceData.bill_date));
  setElementText(container, '#transport', invoiceData.transportation_account?.name || 'N/A');
  setElementText(container, '#order-number', invoiceData.po_no || 'Telephonic');
  setElementText(container, '#lr-number', invoiceData.lr_no || '---');
  setElementText(container, '#lr-date', formatDate(invoiceData.trans_date));

  // Receiver details (billed to)
  setElementText(container, '#receiver-name', invoiceData.delivery_party_account?.name || 'N/A');
  setElementText(container, '#receiver-address', formatAddress(invoiceData.delivery_party_account));
  setElementText(container, '#receiver-contact', formatContact(invoiceData.delivery_party_account));
  setElementText(container, '#receiver-state', invoiceData.delivery_party_account?.state || 'N/A');
  setElementText(container, '#receiver-state-code', getStateCode(invoiceData.delivery_party_account?.state) || 'N/A');
  setElementText(container, '#receiver-gst', invoiceData.delivery_party_account?.gst || 'N/A');
  setElementText(container, '#receiver-pan', invoiceData.delivery_party_account?.panNo || 'N/A');

  // Consignee details (shipped to) - same as receiver for now
  setElementText(container, '#consignee-name', invoiceData.delivery_party_account?.name || 'N/A');
  setElementText(container, '#consignee-address', formatAddress(invoiceData.delivery_party_account));
  setElementText(container, '#consignee-contact', formatContact(invoiceData.delivery_party_account));
  setElementText(container, '#consignee-state', invoiceData.delivery_party_account?.state || 'N/A');
  setElementText(container, '#consignee-state-code', getStateCode(invoiceData.delivery_party_account?.state) || 'N/A');
  setElementText(container, '#consignee-gst', invoiceData.delivery_party_account?.gst || 'N/A');
  setElementText(container, '#consignee-pan', invoiceData.delivery_party_account?.panNo || 'N/A');

  // Products table
  populateProductsTable(container, invoiceData.products);

  // Calculate totals and taxes
  const totalBoxes = invoiceData.products.reduce((acc, prod) => acc + Number(prod.boxes || 0), 0);
  const totalQuantity = invoiceData.products.reduce((acc, prod) => acc + Number(prod.boxes || 0) * Number(prod.no_of_pcs || 0), 0);
  
  // Calculate IGST (assuming 18% for interstate transactions)
  const subtotalAmount = invoiceData.total_products_amount || 0;
  const igstAmount = subtotalAmount * 0.18;
  const totalWithIGST = subtotalAmount + igstAmount;
  
  // Round off to nearest rupee
  const roundedTotal = Math.round(totalWithIGST);
  const roundOff = roundedTotal - totalWithIGST;
  
  setElementText(container, '#total-boxes', totalBoxes.toString());
  setElementText(container, '#total-quantity', totalQuantity.toString());
  setElementText(container, '#subtotal-amount', `₹${subtotalAmount.toFixed(2)}`);
  setElementText(container, '#igst-amount', `₹${igstAmount.toFixed(2)}`);
  setElementText(container, '#round-off', `₹${roundOff.toFixed(2)}`);
  setElementText(container, '#final-amount', `₹${roundedTotal.toFixed(2)}`);
  
  // Amount in words
  setElementText(container, '#amount-in-words', numberToWords(roundedTotal));
  
  // Balance information (sample data - you can modify as needed)
  const lastBalance = 787793.00; // Sample data
  const currentAmount = roundedTotal;
  const netBalance = lastBalance - currentAmount;
  
  setElementText(container, '#last-balance', `₹${lastBalance.toFixed(2)}`);
  setElementText(container, '#current-amount', `₹${currentAmount.toFixed(2)}`);
  setElementText(container, '#net-balance', `₹${Math.abs(netBalance).toFixed(2)} ${netBalance >= 0 ? 'Credit' : 'Debit'}`);
};

// Function to populate products table
const populateProductsTable = (container, products) => {
  const tbody = container.querySelector('#products-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  products.forEach((product, index) => {
    const row = document.createElement('tr');
    
    // Get product name and HSN
    let productName = 'N/A';
    let hsnCode = 'N/A';
    
    if (typeof product.product === 'object' && product.product?.name) {
      productName = product.product.name;
      hsnCode = product.product.hsn || 'N/A';
    } else if (typeof product.product === 'string') {
      productName = product.product; // Product ID as fallback
    }

    const quantity = (product.boxes || 0) * (product.no_of_pcs || 0);
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="product-name">${productName}</td>
      <td>${hsnCode}</td>
      <td>${product.boxes || 0}</td>
      <td>${quantity}</td>
      <td>₹${product.rate || 0}</td>
      <td>${product.discount || 0}%</td>
      <td>₹${product.total_amount?.toFixed(2) || '0.00'}</td>
    `;
    
    tbody.appendChild(row);
  });
};

// Helper function to set element text
const setElementText = (container, selector, text) => {
  const element = container.querySelector(selector);
  if (element) {
    element.textContent = text;
  }
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB');
  } catch (error) {
    return dateString;
  }
};

// Helper function to format address
const formatAddress = (party) => {
  if (!party) return 'N/A';
  
  const addressParts = [
    party.addressLine1,
    party.addressLine2,
    party.addressLine3,
    party.city,
    party.state,
    party.pinCode
  ].filter(Boolean);
  
  return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
};

// Helper function to format contact
const formatContact = (party) => {
  if (!party) return 'N/A';
  
  const contactParts = [
    party.mobileNo ? `Mobile: ${party.mobileNo}` : null
  ].filter(Boolean);
  
  return contactParts.length > 0 ? contactParts.join(', ') : 'N/A';
};

// Helper function to get state code from state name
const getStateCode = (stateName) => {
  const stateCodes = {
    'Gujarat': '24',
    'Tamil Nadu': '33',
    'Maharashtra': '27',
    'Karnataka': '29',
    'Telangana': '36',
    'Andhra Pradesh': '37',
    'Kerala': '32',
    'Delhi': '07',
    'Uttar Pradesh': '09',
    'Madhya Pradesh': '23',
    'Rajasthan': '08',
    'Punjab': '03',
    'Haryana': '06',
    'West Bengal': '19',
    'Bihar': '10',
    'Odisha': '21',
    'Assam': '18',
    'Jharkhand': '20',
    'Chhattisgarh': '22',
    'Uttarakhand': '05',
    'Himachal Pradesh': '02',
    'Jammu and Kashmir': '01',
    'Goa': '30',
    'Sikkim': '11',
    'Arunachal Pradesh': '12',
    'Manipur': '14',
    'Meghalaya': '17',
    'Mizoram': '15',
    'Nagaland': '13',
    'Tripura': '16'
  };
  return stateCodes[stateName] || 'N/A';
};

// Helper function to convert number to words (Indian numbering system)
const numberToWords = (amount) => {
  if (amount === 0) return 'Zero Rupees Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertLessThanOneThousand = (num) => {
    if (num === 0) return '';
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      if (num % 10 === 0) return tens[Math.floor(num / 10)];
      return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    }
    if (num < 1000) {
      if (num % 100 === 0) return ones[Math.floor(num / 100)] + ' Hundred';
      return ones[Math.floor(num / 100)] + ' Hundred ' + convertLessThanOneThousand(num % 100);
    }
  };
  
  const convert = (num) => {
    if (num === 0) return 'Zero';
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;
    
    let result = '';
    
    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }
    
    return result.trim();
  };
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' ' + convert(paise) + ' Paise';
  }
  result += ' Only';
  
  return result;
};

// Fallback function to get template from assets (for development)
const getTemplateFromAssets = async () => {
  // This is a fallback for development environments
  // In production, the template should be served from the public folder
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .tax-invoice { font-size: 20px; color: #333; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section { border: 1px solid #ddd; padding: 15px; }
            .section h3 { margin-bottom: 15px; color: #555; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .products { margin-bottom: 30px; }
            .products table { width: 100%; border-collapse: collapse; }
            .products th, .products td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .products th { background: #f5f5f5; }
            .totals { text-align: right; }
            .final-amount { font-size: 18px; font-weight: bold; color: #d32f2f; }
        </style>
    </head>
    <body>
        <div class="invoice">
            <div class="header">
                <div class="company-name">ANANT POLYMERS</div>
                <div class="tax-invoice">TAX INVOICE</div>
                <div>ORIGINAL</div>
            </div>
            
            <div class="details">
                <div class="section">
                    <h3>Invoice Details</h3>
                    <div class="row">
                        <span>Invoice No.:</span>
                        <span id="invoice-number">N/A</span>
                    </div>
                    <div class="row">
                        <span>Invoice Date:</span>
                        <span id="invoice-date">N/A</span>
                    </div>
                </div>
                
                <div class="section">
                    <h3>Transport Details</h3>
                    <div class="row">
                        <span>Transport:</span>
                        <span id="transport">N/A</span>
                    </div>
                    <div class="row">
                        <span>Order No.:</span>
                        <span id="order-number">N/A</span>
                    </div>
                </div>
            </div>
            
            <div class="products">
                <table>
                    <thead>
                        <tr>
                            <th>Sr.</th>
                            <th>Description</th>
                            <th>HSN/SAC</th>
                            <th>Box</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Discount</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="products-tbody">
                    </tbody>
                </table>
            </div>
            
            <div class="totals">
                <div class="row">
                    <span>Total Amount:</span>
                    <span id="total-amount">₹0.00</span>
                </div>
                <div class="row">
                    <span>Freight:</span>
                    <span id="freight-amount">₹0.00</span>
                </div>
                <div class="row">
                    <span>Final Amount:</span>
                    <span class="final-amount" id="final-amount">₹0.00</span>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};
