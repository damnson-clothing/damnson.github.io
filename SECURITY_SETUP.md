# Security & Configuration Setup

## ✅ What Changed

1. **Removed WhatsApp Integration** - Orders no longer auto-open WhatsApp
2. **Google Sheets Only** - All orders saved to and loaded from Google Sheets
3. **Secure Configuration** - Sensitive data moved to separate config file

## 🔐 Security Improvements

### Sensitive Data Now Hidden
- ✅ Admin password not visible in code
- ✅ Google Sheets API URL not exposed
- ✅ Config file excluded from GitHub (via .gitignore)

## 📋 Setup Instructions

### Step 1: Configure Your Settings

1. Open the file: `config.js`
2. Update these values:

```javascript
const CONFIG = {
    // Your Google Apps Script Web App URL
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec',
    
    // Your admin password
    ADMIN_PASSWORD: 'your_secure_password_here'
};
```

3. Save the file

### Step 2: Keep Config Secure

The `config.js` file is already in `.gitignore`, which means:
- ✅ It won't be pushed to GitHub
- ✅ Your secrets stay private
- ✅ Only you have access to these values

### Step 3: Deploy to GitHub

When you push to GitHub:

```powershell
git add .
git commit -m "Updated to use secure config"
git push
```

**Important:** The `config.js` file will NOT be uploaded (it's ignored).

### Step 4: Setup Config on GitHub Pages

Since `config.js` is not on GitHub, you need to create it directly on your hosting:

**Option A: Create via GitHub UI**
1. Go to your GitHub repository
2. Click "Add file" → "Create new file"
3. Name it: `config.js`
4. Paste your actual configuration
5. Commit directly to main branch

**Option B: Use config.template.js**
1. The repository has `config.template.js` as a reference
2. Copy it and rename to `config.js` in your repo
3. Update with your actual values

## 🎯 How It Works Now

### Customer Orders:
1. Customer fills order form
2. Order sent directly to Google Sheets
3. Success message shown
4. No WhatsApp auto-open

### Admin Dashboard:
1. Login with password (from config.js)
2. Loads orders from Google Sheets
3. View/filter orders
4. Delete removes from view only (not from sheets)

## ⚠️ Important Notes

### For Local Development:
- Keep `config.js` with real values locally
- Never commit it to GitHub

### For Production (GitHub Pages):
- Create `config.js` directly in repository via GitHub UI
- Or use a different deployment method that supports environment variables

### Contact Customers:
- View customer contact numbers in admin panel
- Click phone number to call directly
- Or copy number to contact via your preferred method

## 🔄 Future Updates

When you make changes locally:

```powershell
# Add changes (config.js will be skipped automatically)
git add .

# Commit
git commit -m "Your update message"

# Push
git push
```

## ✨ Benefits

✅ **More Secure** - Secrets not in public code
✅ **Cleaner** - No WhatsApp auto-open
✅ **Centralized** - All data in Google Sheets
✅ **Flexible** - Easy to update config without code changes
✅ **Professional** - Better user experience

## 📞 Need Help?

If orders aren't working:
1. Check browser console (F12) for errors
2. Verify `config.js` exists and has correct values
3. Confirm Google Apps Script is deployed correctly
4. Test Google Sheets API URL directly
