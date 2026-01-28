# Inventory Management Setup Guide

## Overview
Your website now has a complete inventory management system that tracks stock levels for each product and size.

## Setup Steps

### 1. Update Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Replace ALL code with the content from `google-apps-script.gs`
4. Click **Save**
5. Click **Deploy** → **Manage deployments**
6. Click **Edit** (pencil icon)
7. Update to **New version**
8. Click **Deploy**

### 2. Create Inventory Sheet

Your Google Apps Script will automatically create an "Inventory" sheet when first accessed, but you can set it up manually:

1. In your Google Spreadsheet, create a new sheet named **"Inventory"**
2. Add headers in Row 1:
   ```
   Product | Size | Stock
   ```
3. Add initial inventory (example):
   ```
   SELF-MADE    | S    | 10
   SELF-MADE    | M    | 15
   SELF-MADE    | L    | 20
   SELF-MADE    | XL   | 15
   SELF-MADE    | XXL  | 10
   RESURGENCE   | S    | 10
   RESURGENCE   | M    | 15
   RESURGENCE   | L    | 20
   RESURGENCE   | XL   | 15
   RESURGENCE   | XXL  | 10
   ```

### 3. Rename Orders Sheet

1. Rename your main sheet (Sheet1) to **"Orders"**
2. Keep the same headers as before

Your spreadsheet should now have 2 sheets:
- **Orders** - stores customer orders
- **Inventory** - tracks stock levels

## Features

### On Main Website (index.html)

✅ **Stock Display on Product Cards**
- Shows total available stock for each product
- "X items left" for low stock (< 10)
- "OUT OF STOCK" when stock is 0
- Order button disabled when out of stock

✅ **Size Selection with Stock Info**
- Quick view modal shows stock per size
- "Out" indicator for unavailable sizes
- Stock count for low inventory sizes
- Disabled buttons for out-of-stock sizes

✅ **Stock Validation**
- Checks availability before order submission
- Shows alert if requested quantity exceeds stock
- Prevents ordering more than available

✅ **Auto Stock Update**
- Stock automatically decreases after successful order
- Real-time inventory sync

### In Admin Dashboard (admin.html)

✅ **Inventory Management Section**
- View all products and their stock levels
- Separate cards for each product
- Color-coded status:
  - 🟢 **OK** - Sufficient stock
  - 🟠 **LOW** - Less than 5 items
  - 🔴 **OUT** - No stock

✅ **Update Stock Levels**
- Input new stock quantity for any size
- Click "UPDATE" to save changes
- Changes sync immediately to Google Sheets

✅ **Auto-Load on Login**
- Inventory loads automatically when you login
- Click "↻ REFRESH" to reload latest data

## How It Works

### When Customer Places Order:

1. Customer selects product and size
2. System checks if stock is available
3. If available:
   - Order is saved to "Orders" sheet
   - Stock is decreased in "Inventory" sheet
   - Customer sees success message
   - Website updates to show new stock level
4. If not available:
   - Alert shows available quantity
   - Customer can adjust order

### In Admin Panel:

1. Login to admin dashboard
2. Scroll to "INVENTORY MANAGEMENT" section
3. See current stock for all products/sizes
4. Update stock numbers as needed
5. Click "UPDATE" to save
6. Changes reflect immediately on website

## Managing Stock

### Adding New Stock

1. Open admin dashboard
2. Find the product and size
3. Enter new total quantity
4. Click "UPDATE"

### Checking Low Stock

Look for orange "LOW" indicators in admin panel - these items need restocking soon.

### Out of Stock Items

Items marked "OUT" (red) are not available for purchase on the website.

## Tips

- Set realistic initial stock levels
- Check inventory regularly in admin panel
- Restock items marked as "LOW"
- Orders automatically reduce stock - no manual tracking needed
- Export orders regularly to track sales vs inventory

## Troubleshooting

**Stock not showing on website?**
- Check config.js has correct Google Sheets URL
- Verify "Inventory" sheet exists in Google Sheets
- Check browser console for errors (F12)

**Can't update stock in admin?**
- Make sure you're logged in
- Verify Google Apps Script is deployed
- Check internet connection

**Orders not decreasing stock?**
- Verify latest Google Apps Script code is deployed
- Check "Orders" and "Inventory" sheets both exist
- Test with a small order first

## Need Help?

Check that:
1. Google Apps Script is updated and deployed
2. Both "Orders" and "Inventory" sheets exist
3. config.js has the correct Web App URL
4. You've refreshed the website after changes
