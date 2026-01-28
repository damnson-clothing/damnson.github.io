// Google Apps Script for DamnSon Clothing Orders
// This script handles API requests to store and retrieve orders from Google Sheets

// IMPORTANT: Create two sheets in your spreadsheet:
// 1. "Orders" - for order data
// 2. "Inventory" - for stock management

// SECURITY: API Key to prevent unauthorized access
const API_KEY = 'damnson_secure_2026_key'; // Change this to a random string

// Validate API Key
function validateApiKey(apiKey) {
  return apiKey === API_KEY;
}

// doPost - Handle incoming orders from website
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate API Key
    if (!validateApiKey(data.apiKey)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Unauthorized access'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = data.action || 'addOrder';
    
    if (action === 'addOrder') {
      return addOrder(data);
    } else if (action === 'updateInventory') {
      return updateInventory(data);
    } else if (action === 'decreaseStock') {
      return decreaseStock(data);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addOrder(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  
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
}

function updateInventory(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inventory');
  const allData = sheet.getDataRange().getValues();
  
  // Find the row for this product and size
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.product && allData[i][1] === data.size) {
      sheet.getRange(i + 1, 3).setValue(data.stock);
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Inventory updated successfully'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // If not found, add new row
  sheet.appendRow([data.product, data.size, data.stock]);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Inventory item added successfully'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function decreaseStock(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inventory');
  const allData = sheet.getDataRange().getValues();
  
  // Find the row for this product and size
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.product && allData[i][1] === data.size) {
      const currentStock = allData[i][2];
      const newStock = Math.max(0, currentStock - data.quantity);
      sheet.getRange(i + 1, 3).setValue(newStock);
      
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Stock updated successfully',
          newStock: newStock
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Product not found in inventory'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// doGet - Retrieve all orders for admin dashboard
function doGet(e) {
  try {
    // Validate API Key for GET requests too
    if (!validateApiKey(e.parameter.apiKey)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Unauthorized access'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = e.parameter.action || 'getOrders';
    
    if (action === 'getOrders') {
      return getOrders();
    } else if (action === 'getInventory') {
      return getInventory();
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
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
}

function getInventory() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inventory');
  
  // Check if Inventory sheet exists
  if (!sheet) {
    // Create inventory sheet with default data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const newSheet = ss.insertSheet('Inventory');
    newSheet.appendRow(['Product', 'Size', 'Stock']);
    
    // Add default inventory
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const products = ['SELF-MADE', 'RESURGENCE'];
    
    products.forEach(product => {
      sizes.forEach(size => {
        newSheet.appendRow([product, size, 0]);
      });
    });
    
    const data = newSheet.getDataRange().getValues();
    const rows = data.slice(1);
    
    const inventory = rows.map(row => ({
      product: row[0],
      size: row[1],
      stock: row[2]
    }));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        inventory: inventory
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  const inventory = rows.map(row => ({
    product: row[0],
    size: row[1],
    stock: row[2]
  }));
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      inventory: inventory
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
