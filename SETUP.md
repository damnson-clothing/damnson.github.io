# DamnSon Clothing — Dynamic Site Setup Guide

## Files Delivered

| File | Purpose |
|---|---|
| `Code.gs` | Google Apps Script backend (replace existing) |
| `config.js` | Site-wide configuration |
| `index.html` | Storefront — now fully dynamic |
| `script.js` | Storefront JS — no hardcoded products |
| `admin.html` | Admin dashboard with Products CMS |
| `styles.css` | Master stylesheet (storefront + admin) |

---

## Step 1 — Update Google Sheets

Open your Google Sheet and create these sheets (tabs) if they don't exist:

### Sheet: `Products`
Headers (Row 1):
```
productId | name | price | description | status | featured | badge | image1 | image2 | image3 | image4 | sortOrder | createdAt | updatedAt
```

### Sheet: `Orders`
Add a `status` column after `notes` (keep all existing columns):
```
orderNumber | timestamp | customerName | contactNumber | address | product | productId | size | quantity | paymentMode | total | notes | status
```

### Sheet: `Inventory`
Update headers to:
```
productId | product | size | stock | reserved | lastUpdated
```

> **Note:** The Apps Script will auto-create missing sheets and seed correct headers on first run.

---

## Step 2 — Deploy Updated Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Delete all existing code in `Code.gs`
4. Paste the entire contents of the new `Code.gs` file
5. Click **Save** (disk icon)
6. Click **Deploy → Manage Deployments**
7. Click the pencil (edit) icon on your existing deployment
8. Change **Version** to "New version"
9. Click **Deploy**
10. Copy the Web App URL — it should be the same as before

AKfycbxG6lGszAHb4C9ajwnMH9ZUC2f2fqFnFUswn-b0cNZfPOH-vmQN1INU92fHOXA0cFMDlQ

https://script.google.com/macros/s/AKfycbxG6lGszAHb4C9ajwnMH9ZUC2f2fqFnFUswn-b0cNZfPOH-vmQN1INU92fHOXA0cFMDlQ/exec

> If you create a NEW deployment instead of updating, you must update `GOOGLE_SHEET_URL` in `config.js`.

---

## Step 3 — Upload Files to GitHub Pages

Replace the following files in your GitHub repository:
- `config.js` ← new file
- `index.html` ← updated
- `script.js` ← rewritten (no hardcoded products)
- `admin.html` ← major update
- `styles.css` ← updated

Commit and push. GitHub Pages will rebuild in ~60 seconds.

---

## Step 4 — Add Your First Products (Admin)

1. Go to `https://yoursite.github.io/admin.html`
2. Log in with password: `damnson2026`
3. Click the **👕 PRODUCTS** tab
4. Click **+ ADD PRODUCT**
5. Fill in the product form:
   - **Name**: e.g. `SELF-MADE`
   - **Price**: `699`
   - **Status**: `Active`
   - **Image URLs**: Upload images to your GitHub `assets/products/` folder via the GitHub web UI, then paste the public URL (e.g. `https://yourusername.github.io/yourrepo/assets/products/selfmade-front.jpg`)
6. Click **SAVE PRODUCT**

The product will immediately appear on the storefront.

---

## Step 5 — Set Inventory

1. In the admin dashboard, click the **📊 INVENTORY** tab
2. For each product/size combination, enter the stock quantity
3. Click **SET** to save

---

## How to Add Images

### Method A: GitHub Web UI (recommended)
1. Go to your GitHub repository
2. Navigate to `assets/products/`
3. Click **Add file → Upload files**
4. Drag and drop your images
5. Commit changes
6. The public URL will be: `https://yourusername.github.io/yourrepo/assets/products/filename.jpg`

### Method B: Git command line
```bash
git add assets/products/newimage.jpg
git commit -m "Add product image"
git push
```

---

## Admin Dashboard Features

### Orders Tab
- View all orders with full detail
- **Update order status** inline: Pending → Confirmed → Shipped → Cancelled
- Filter by product, status, payment method, date, or search by name/order number
- Export all orders as CSV
- Click **VIEW** to see full order details in a modal

### Products Tab
- See all products (active, draft, archived)
- **Add new products** with name, price, description, images, badge, and sort order
- **Edit any product** by clicking EDIT
- **Toggle featured** by clicking the ★ icon (featured products get priority placement)
- **Delete products** with confirmation dialog
- Set status to Draft to hide from storefront without deleting

### Inventory Tab
- View stock levels for all products by size
- Color indicators: 🟢 OK / 🟠 LOW (< 5 units) / 🔴 OUT
- Update any size/product stock directly
- Stock automatically decreases when customers place orders

---

## Storefront Behavior

- Products load dynamically from Google Sheets on page load
- Only `status: active` products are shown
- Products sort by `sortOrder` field (ascending)
- Out-of-stock products show "OUT OF STOCK" with disabled order button
- Low-stock products (< 10) show remaining quantity
- Product badges (NEW, LIMITED, etc.) display as overlay labels

---

## Changing the Admin Password

1. Open `config.js`
2. Change `ADMIN_PASSWORD: 'damnson2026'` to your new password
3. Open `Code.gs` in Apps Script
4. Change `const API_KEY = 'damnson_secure_2026_key'` if you also want to rotate the API key
5. If you change the API key, update `API_KEY` in `config.js` to match
6. Redeploy the Apps Script and push `config.js` to GitHub

---

## Troubleshooting

**Products not loading on storefront**
- Check browser console for errors
- Verify `GOOGLE_SHEET_URL` in `config.js` is correct
- Make sure the Apps Script is deployed with "Access: Anyone"
- Confirm the `Products` sheet exists and has at least one row with `status: active`

**Orders not saving**
- The order form uses `mode: no-cors` — you won't see a response but it should still save
- Check your Google Sheet's Orders tab directly
- Verify the Apps Script `doPost` function is deployed

**Admin shows blank after login**
- Open browser DevTools → Network tab
- Look for failed requests to the Apps Script URL
- Check that your API_KEY matches between `config.js` and `Code.gs`

**Images not showing**
- Make sure image URLs are publicly accessible
- Test by opening the URL directly in a browser tab
- GitHub Pages URLs are case-sensitive — `Product1.jpg` ≠ `product1.jpg`
