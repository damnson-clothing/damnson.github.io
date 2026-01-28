// Configuration TEMPLATE for DamnSon Clothing
// Copy this file to config.js and fill in your actual values

const CONFIG = {
    // Replace with your Google Apps Script Web App URL
    // Get this from: Google Sheet > Extensions > Apps Script > Deploy > Web App URL
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/s/AKfycbxG6lGszAHb4C9ajwnMH9ZUC2f2fqFnFUswn-b0cNZfPOH-vmQN1INU92fHOXA0cFMDlQ/exec',
    
    // Change this to your desired admin password

    ADMIN_PASSWORD: 'damnson2026'

};

// Make config available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
