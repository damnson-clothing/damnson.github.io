# Google Sheets Integration Setup Guide

## Step 1: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **DamnSon Orders**
4. In the first row, add these headers:
   ```
   Order Number | Timestamp | Customer Name | Contact Number | Address | Product | Size | Quantity | Payment Mode | Total | Notes
   ```

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Copy and paste the code from `google-apps-script.gs` (created in your project)
4. Click **Save** (💾 icon)
5. Name the project: **DamnSon API**

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon (⚙️) next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description:** DamnSon Orders API
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to DamnSon API (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** - you'll need this!
    - It looks like: `https://script.google.com/macros/s/AKfycby.../exec`

## Step 4: Update Your Website

1. Open `script.js` in your project
2. Find the line: `const GOOGLE_SHEET_URL = 'YOUR_WEB_APP_URL_HERE';`
3. Replace `'YOUR_WEB_APP_URL_HERE'` with the URL you copied
4. Save the file

5. Open `admin.html`
6. Find the line: `const GOOGLE_SHEET_URL = 'YOUR_WEB_APP_URL_HERE';`
7. Replace with the same URL
8. Save the file

## Step 5: Test

1. Go to your website (index.html)
2. Place a test order
3. Check your Google Sheet - the order should appear!
4. Open admin.html and verify you can see the order

## Troubleshooting

**Orders not appearing?**
- Make sure you deployed the script as "Anyone" can access
- Check the Web App URL is correct in both files
- Open browser console (F12) to see any error messages

**Authorization issues?**
- Re-deploy the script
- Make sure you clicked "Allow" during authorization

## Benefits

✅ Orders stored in the cloud (accessible anywhere)
✅ Real-time sync across all devices
✅ Automatic backup by Google
✅ Easy to share with team members
✅ Can view/edit directly in Google Sheets
✅ Export to Excel/CSV anytime

## Security Note

The web app URL is public but:
- Only accepts POST requests for adding orders
- Admin dashboard still requires password
- Google Sheet is only accessible to you (unless you share it)
