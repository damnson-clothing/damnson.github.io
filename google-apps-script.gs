// Google Apps Script for DamnSon Clothing Orders
// This script handles API requests to store and retrieve orders from Google Sheets

// doPost - Handle incoming orders from website
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add order to sheet
    sheet.appendRow([
      data.orderNumber,
      data.timestamp,
      data.customerName,
      data.contactNumber,
      data.address,
      data.product,
      data.size,
      data.quantity,
      data.paymentMode,
      data.total,
      data.notes || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Order saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet - Retrieve all orders for admin dashboard
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Remove header row
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convert to array of objects
    const orders = rows.map(row => {
      return {
        orderNumber: row[0],
        timestamp: row[1],
        customerName: row[2],
        contactNumber: row[3],
        address: row[4],
        product: row[5],
        size: row[6],
        quantity: row[7],
        paymentMode: row[8],
        total: row[9],
        notes: row[10]
      };
    });
    
    // Sort by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        orders: orders
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
