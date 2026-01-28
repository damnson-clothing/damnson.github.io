// Configuration TEMPLATE for DamnSon Clothing
// Copy this file to config.js and fill in your actual values

const CONFIG = {
    // Replace with your Google Apps Script Web App URL
    // Get this from: Google Sheet > Extensions > Apps Script > Deploy > Web App URL
    GOOGLE_SHEET_URL: 'YOUR_WEB_APP_URL_HERE',
    
    // Change this to your desired admin password
    ADMIN_PASSWORD: 'your_secure_password_here'
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
