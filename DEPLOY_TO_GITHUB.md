# Deploy to GitHub Pages

## Quick Deploy Guide

### Option A: Deploy to `neilalcabasa.github.io/damnson` (Easiest)

#### Step 1: Create Repository
1. Go to [github.com/neilalcabasa](https://github.com/neilalcabasa)
2. Click **New Repository**
3. Repository name: `damnson`
4. Make it **Public**
5. **DO NOT** initialize with README
6. Click **Create repository**

#### Step 2: Push Your Code

Open PowerShell in your project folder and run:

```powershell
cd c:\Users\alcab\Documents\damnson

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DamnSon Clothing website"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/neilalcabasa/damnson.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
4. Click **Save**
5. Wait 1-2 minutes

Your site will be live at: **`https://neilalcabasa.github.io/damnson`**

---

### Option B: Deploy to `damnsonclothing.github.io` (Professional)

#### Step 1: Create GitHub Organization
1. Go to [github.com](https://github.com)
2. Click your profile picture (top-right) → **Settings**
3. Left sidebar → **Organizations**
4. Click **New organization**
5. Choose **Free** plan
6. Organization name: `damnsonclothing`
7. Contact email: your email
8. Click **Next** → **Complete setup**

#### Step 2: Create Repository
1. Go to [github.com/damnsonclothing](https://github.com/damnsonclothing)
2. Click **New Repository**
3. Repository name: **`damnsonclothing.github.io`** (EXACTLY this name)
4. Make it **Public**
5. Click **Create repository**

#### Step 3: Push Your Code

```powershell
cd c:\Users\alcab\Documents\damnson

git init
git add .
git commit -m "Initial commit - DamnSon Clothing website"
git remote add origin https://github.com/damnsonclothing/damnsonclothing.github.io.git
git branch -M main
git push -u origin main
```

#### Step 4: GitHub Pages is Auto-Enabled
Your site will be automatically live at: **`https://damnsonclothing.github.io`**

---

## After Deployment

### Update Google Sheets (Important!)
Once deployed, you need to update the Google Sheets Web App settings:

1. Go to your Google Apps Script
2. Click **Deploy** → **Manage deployments**
3. Click **Edit** (pencil icon)
4. Update **Who has access** to **Anyone**
5. Save

### Test Your Live Site
1. Visit your GitHub Pages URL
2. Try placing a test order
3. Check if it appears in your Google Sheet
4. Verify WhatsApp integration works
5. Test admin panel: `your-url/admin.html`

---

## Custom Domain (Optional - Future)

Want a custom domain like `www.damnsonclothing.com`?

1. Buy domain from: Namecheap, GoDaddy, Google Domains
2. In GitHub repo: **Settings** → **Pages** → **Custom domain**
3. Add your domain and follow instructions
4. Update DNS settings (provided by GitHub)

Cost: ~$10-15/year

---

## Updating Your Site

After making changes locally:

```powershell
cd c:\Users\alcab\Documents\damnson
git add .
git commit -m "Updated product prices"
git push
```

Changes will be live in 1-2 minutes!

---

## Troubleshooting

**Site not loading?**
- Wait 5 minutes after first deployment
- Check Settings → Pages shows green checkmark
- Verify repository is Public

**Orders not saving to Google Sheets?**
- Check you updated the Web App URL in `script.js` and `admin.html`
- Verify Google Apps Script is deployed as "Anyone" can access
- Check browser console (F12) for errors

**Admin page not working?**
- Make sure you access it at: `your-url/admin.html`
- Password is: `damnson2026`

---

## Recommended: Option B (damnsonclothing.github.io)

This gives you:
✅ Professional URL
✅ Brand recognition
✅ Easy to remember
✅ Can add custom domain later

Takes only 5 extra minutes!
