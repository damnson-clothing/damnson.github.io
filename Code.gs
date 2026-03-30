// ============================================================
// DamnSon Clothing — Google Apps Script Backend
// Deploy: Extensions > Apps Script > Deploy > Web App
// Execute as: Me | Access: Anyone
// ============================================================

const API_KEY = 'damnson_secure_2026_key';
const SHEET_PRODUCTS  = 'Products';
const SHEET_ORDERS    = 'Orders';
const SHEET_INVENTORY = 'Inventory';

// ── Rate limiting ─────────────────────────────────────────
function checkRateLimit(ip) {
  const cache = CacheService.getScriptCache();
  const key   = 'rl_' + (ip || 'unknown').replace(/[^a-z0-9]/gi, '_');
  const hits  = parseInt(cache.get(key) || '0');
  if (hits > 60) return false;
  cache.put(key, String(hits + 1), 60);
  return true;
}

// ── Entry points ──────────────────────────────────────────
function doGet(e) {
  const ip = e && e.parameter ? (e.parameter.ip || '') : '';
  if (!checkRateLimit(ip)) return json({ status: 'error', message: 'Rate limit exceeded' });

  const p = e.parameter || {};
  if (p.apiKey !== API_KEY) return json({ status: 'error', message: 'Unauthorized' });

  try {
    switch (p.action) {
      case 'getProducts':  return json(getProducts());
      case 'getProduct':   return json(getProduct(p.id));
      case 'getOrders':    return json(getOrders());
      case 'getInventory': return json(getInventory());
      default:             return json(getProducts()); // backwards compat
    }
  } catch (err) {
    return json({ status: 'error', message: err.message });
  }
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch(_) {}

  if (body.apiKey !== API_KEY) return json({ status: 'error', message: 'Unauthorized' });

  try {
    switch (body.action) {
      case 'addProduct':       return json(addProduct(body));
      case 'updateProduct':    return json(updateProduct(body));
      case 'deleteProduct':    return json(deleteProduct(body.productId));
      case 'addOrder':         return json(addOrder(body));
      case 'updateOrderStatus':return json(updateOrderStatus(body.orderNumber, body.status));
      case 'updateInventory':  return json(updateInventory(body.productId || body.product, body.size, body.stock));
      case 'decreaseStock':    return json(decreaseStock(body.productId || body.product, body.size, body.quantity));
      default: return json({ status: 'error', message: 'Unknown action: ' + body.action });
    }
  } catch (err) {
    return json({ status: 'error', message: err.message });
  }
}

function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Sheet helpers ─────────────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initSheet(sheet, name);
  }
  return sheet;
}

function initSheet(sheet, name) {
  const headers = {
    Products:  ['productId','name','price','description','status','featured','badge',
                 'image1','image2','image3','image4','sortOrder','createdAt','updatedAt'],
    Orders:    ['orderNumber','timestamp','customerName','contactNumber','address',
                 'product','productId','size','quantity','paymentMode','total','notes','status'],
    Inventory: ['productId','product','size','stock','reserved','lastUpdated']
  };
  if (headers[name]) {
    sheet.getRange(1, 1, 1, headers[name].length).setValues([headers[name]]);
    sheet.getRange(1, 1, 1, headers[name].length)
      .setFontWeight('bold')
      .setBackground('#1a1a1a')
      .setFontColor('#ffffff');
  }
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function findRowByField(sheet, field, value) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const col = headers.indexOf(field);
  if (col === -1) return -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][col]) === String(value)) return i + 1; // 1-indexed
  }
  return -1;
}

function getColIndex(sheet, field) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.indexOf(field); // 0-indexed
}

// ── Products ──────────────────────────────────────────────
function getProducts() {
  const sheet = getSheet(SHEET_PRODUCTS);
  const rows  = sheetToObjects(sheet);
  const inv   = sheetToObjects(getSheet(SHEET_INVENTORY));

  const products = rows
    .filter(r => r.status === 'active')
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .map(p => ({
      ...p,
      price:     Number(p.price),
      featured:  p.featured === true || p.featured === 'TRUE',
      sortOrder: Number(p.sortOrder) || 0,
      images:    [p.image1, p.image2, p.image3, p.image4].filter(Boolean)
    }));

  return { status: 'success', products, inventory: inv };
}

function getProduct(id) {
  const sheet = getSheet(SHEET_PRODUCTS);
  const rows  = sheetToObjects(sheet);
  const p = rows.find(r => r.productId === id);
  if (!p) return { status: 'error', message: 'Product not found' };
  return { status: 'success', product: { ...p, images: [p.image1, p.image2, p.image3, p.image4].filter(Boolean) } };
}

function getAllProducts() {
  // Admin version — returns all statuses
  const sheet = getSheet(SHEET_PRODUCTS);
  const rows  = sheetToObjects(sheet);
  return {
    status: 'success',
    products: rows
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
      .map(p => ({ ...p, price: Number(p.price), images: [p.image1,p.image2,p.image3,p.image4].filter(Boolean) }))
  };
}

function addProduct(body) {
  const sheet = getSheet(SHEET_PRODUCTS);
  const now   = new Date().toISOString();
  const id    = body.productId || ('DS-' + Date.now());

  const row = [
    id,
    body.name        || '',
    Number(body.price) || 0,
    body.description || '',
    body.status      || 'draft',
    body.featured    ? 'TRUE' : 'FALSE',
    body.badge       || '',
    body.image1      || '',
    body.image2      || '',
    body.image3      || '',
    body.image4      || '',
    Number(body.sortOrder) || 99,
    now, now
  ];
  sheet.appendRow(row);

  // Seed inventory rows for each size
  ['S','M','L','XL','XXL'].forEach(size => {
    addInventoryRow(id, body.name, size, 0);
  });

  return { status: 'success', message: 'Product added', productId: id };
}

function updateProduct(body) {
  const sheet  = getSheet(SHEET_PRODUCTS);
  const rowNum = findRowByField(sheet, 'productId', body.productId);
  if (rowNum === -1) return { status: 'error', message: 'Product not found' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const fields  = ['name','price','description','status','featured','badge',
                   'image1','image2','image3','image4','sortOrder','updatedAt'];

  fields.forEach(field => {
    const col = headers.indexOf(field);
    if (col === -1) return;
    let val = body[field];
    if (val === undefined) return;
    if (field === 'updatedAt') val = new Date().toISOString();
    if (field === 'featured')  val = (val === true || val === 'true' || val === 'TRUE') ? 'TRUE' : 'FALSE';
    sheet.getRange(rowNum, col + 1).setValue(val);
  });
  // Always update updatedAt
  const updCol = headers.indexOf('updatedAt');
  if (updCol !== -1) sheet.getRange(rowNum, updCol + 1).setValue(new Date().toISOString());

  return { status: 'success', message: 'Product updated' };
}

function deleteProduct(productId) {
  const sheet  = getSheet(SHEET_PRODUCTS);
  const rowNum = findRowByField(sheet, 'productId', productId);
  if (rowNum === -1) return { status: 'error', message: 'Product not found' };
  sheet.deleteRow(rowNum);
  return { status: 'success', message: 'Product deleted' };
}

// ── Orders ────────────────────────────────────────────────
function getOrders() {
  const sheet = getSheet(SHEET_ORDERS);
  const rows  = sheetToObjects(sheet);
  // Ensure backwards compat — status defaults to 'pending'
  const orders = rows.map(o => ({ ...o, status: o.status || 'pending' }))
                     .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return { status: 'success', orders };
}

function addOrder(body) {
  const sheet = getSheet(SHEET_ORDERS);
  const row = [
    body.orderNumber || ('DS' + Date.now()),
    body.timestamp   || new Date().toISOString(),
    body.customerName   || '',
    body.contactNumber  || '',
    body.address        || '',
    body.product        || '',
    body.productId      || '',
    body.size           || '',
    Number(body.quantity) || 1,
    body.paymentMode    || '',
    body.total          || '',
    body.notes          || '',
    'pending'
  ];
  sheet.appendRow(row);
  return { status: 'success', message: 'Order saved', orderNumber: row[0] };
}

function updateOrderStatus(orderNumber, status) {
  const sheet  = getSheet(SHEET_ORDERS);
  const rowNum = findRowByField(sheet, 'orderNumber', orderNumber);
  if (rowNum === -1) return { status: 'error', message: 'Order not found' };
  const col = getColIndex(sheet, 'status');
  if (col === -1) return { status: 'error', message: 'Status column missing' };
  sheet.getRange(rowNum, col + 1).setValue(status);
  return { status: 'success', message: 'Status updated' };
}

// ── Inventory ─────────────────────────────────────────────
function getInventory() {
  const sheet = getSheet(SHEET_INVENTORY);
  return { status: 'success', inventory: sheetToObjects(sheet) };
}

function addInventoryRow(productId, productName, size, stock) {
  const sheet = getSheet(SHEET_INVENTORY);
  const rows  = sheetToObjects(sheet);
  const exists = rows.find(r => r.productId === productId && r.size === size);
  if (exists) return;
  sheet.appendRow([productId, productName, size, stock, 0, new Date().toISOString()]);
}

function updateInventory(productId, size, stock) {
  const sheet  = getSheet(SHEET_INVENTORY);
  const data   = sheet.getDataRange().getValues();
  const headers= data[0];
  const pidCol = headers.indexOf('productId');
  const prodCol= headers.indexOf('product');
  const sizeCol= headers.indexOf('size');
  const stkCol = headers.indexOf('stock');
  const updCol = headers.indexOf('lastUpdated');

  for (let i = 1; i < data.length; i++) {
    const matchId   = String(data[i][pidCol])  === String(productId);
    const matchName = String(data[i][prodCol]) === String(productId); // legacy name-based
    const matchSize = String(data[i][sizeCol]) === String(size);
    if ((matchId || matchName) && matchSize) {
      sheet.getRange(i + 1, stkCol + 1).setValue(Number(stock));
      if (updCol !== -1) sheet.getRange(i + 1, updCol + 1).setValue(new Date().toISOString());
      return { status: 'success', message: 'Inventory updated' };
    }
  }
  // Not found — create row
  sheet.appendRow([productId, productId, size, Number(stock), 0, new Date().toISOString()]);
  return { status: 'success', message: 'Inventory row created' };
}

function decreaseStock(productId, size, quantity) {
  const sheet  = getSheet(SHEET_INVENTORY);
  const data   = sheet.getDataRange().getValues();
  const headers= data[0];
  const pidCol = headers.indexOf('productId');
  const prodCol= headers.indexOf('product');
  const sizeCol= headers.indexOf('size');
  const stkCol = headers.indexOf('stock');
  const updCol = headers.indexOf('lastUpdated');

  for (let i = 1; i < data.length; i++) {
    const matchId   = String(data[i][pidCol])  === String(productId);
    const matchName = String(data[i][prodCol]) === String(productId);
    const matchSize = String(data[i][sizeCol]) === String(size);
    if ((matchId || matchName) && matchSize) {
      const current = Number(data[i][stkCol]) || 0;
      const updated = Math.max(0, current - Number(quantity));
      sheet.getRange(i + 1, stkCol + 1).setValue(updated);
      if (updCol !== -1) sheet.getRange(i + 1, updCol + 1).setValue(new Date().toISOString());
      return { status: 'success', message: 'Stock decreased', remaining: updated };
    }
  }
  return { status: 'error', message: 'Inventory row not found' };
}

// ── Admin: get all products (including drafts) ────────────
// Override getOrders for admin (already returns all)
// Add action to doGet for admin panel
const _doGet = doGet;
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.apiKey === API_KEY && p.action === 'getAllProducts') {
    try { return json(getAllProducts()); } catch(err) { return json({ status:'error', message: err.message }); }
  }
  return _doGet(e);
}
