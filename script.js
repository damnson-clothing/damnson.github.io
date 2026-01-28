// Product data
const products = {
    'self-made': {
        name: 'SELF-MADE',
        price: '699.00',
        images: [
            'assets/product 1.jpg',
            'assets/product 1 - 1.jpg'
        ],
        description: 'Premium quality streetwear that represents the grind and hustle. Made for those who build their own path and create their own success. This piece embodies the spirit of self-determination and independence.'
    },
    'resurgence': {
        name: 'RESURGENCE',
        price: '699.00',
        images: [
            'assets/product 2.jpg',
            'assets/product 2 - 2.jpg',
            'assets/product 2-3.jpg',
            'assets/product 2-4.jpg'
        ],
        description: 'Rise from the ashes and make your comeback. This design represents renewal, rebirth, and the power of resilience. Wear it as a statement of your unstoppable spirit and determination to overcome any obstacle.'
    }
};

<<<<<<< HEAD
=======
// Google Sheets Configuration
// IMPORTANT: Replace with your Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxG6lGszAHb4C9ajwnMH9ZUC2f2fqFnFUswn-b0cNZfPOH-vmQN1INU92fHOXA0cFMDlQ/exec';

>>>>>>> 5f34c720180022db61d92829ec4e4b0e636b7478
let currentProduct = null;
let selectedSize = null;
let orderData = {};
let inventoryData = [];

// Load inventory on page load
window.addEventListener('DOMContentLoaded', function() {
    loadInventory();
});

// Inventory Management
function loadInventory() {
    if (typeof CONFIG === 'undefined' || !CONFIG.GOOGLE_SHEET_URL || CONFIG.GOOGLE_SHEET_URL === 'YOUR_WEB_APP_URL_HERE') {
        console.log('Inventory not configured');
        return;
    }

    fetch(CONFIG.GOOGLE_SHEET_URL + '?action=getInventory')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                inventoryData = data.inventory;
                updateProductStockDisplay();
            }
        })
        .catch(error => {
            console.error('Failed to load inventory:', error);
        });
}

function getStock(product, size) {
    const item = inventoryData.find(i => i.product === product && i.size === size);
    return item ? item.stock : 0;
}

function getTotalStock(product) {
    return inventoryData
        .filter(i => i.product === product)
        .reduce((sum, i) => sum + i.stock, 0);
}

function updateProductStockDisplay() {
    // Update SELF-MADE stock
    const selfMadeStock = getTotalStock('SELF-MADE');
    const selfMadeCard = document.querySelector('[data-product="self-made"]');
    if (selfMadeCard) {
        updateProductCardStock(selfMadeCard, selfMadeStock);
    }

    // Update RESURGENCE stock
    const resurgenceStock = getTotalStock('RESURGENCE');
    const resurgenceCard = document.querySelector('[data-product="resurgence"]');
    if (resurgenceCard) {
        updateProductCardStock(resurgenceCard, resurgenceStock);
    }
}

function updateProductCardStock(card, totalStock) {
    // Remove existing stock badge if any
    const existingBadge = card.querySelector('.stock-badge');
    if (existingBadge) existingBadge.remove();

    // Add stock badge
    const productInfo = card.querySelector('.product-info');
    const stockBadge = document.createElement('p');
    stockBadge.className = 'stock-badge';
    
    if (totalStock === 0) {
        stockBadge.textContent = 'OUT OF STOCK';
        stockBadge.classList.add('stock-out');
        // Disable order button
        const orderBtn = card.querySelector('.order-btn');
        if (orderBtn) {
            orderBtn.disabled = true;
            orderBtn.style.opacity = '0.5';
            orderBtn.style.cursor = 'not-allowed';
        }
    } else if (totalStock < 10) {
        stockBadge.textContent = `Only ${totalStock} items left!`;
        stockBadge.classList.add('stock-low');
    } else {
        stockBadge.textContent = `${totalStock} in stock`;
        stockBadge.classList.add('stock-available');
    }
    
    const priceElement = productInfo.querySelector('.product-price');
    priceElement.after(stockBadge);
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Product Modal Functions
function openProductModal(productId) {
    currentProduct = productId;
    const product = products[productId];
    const modal = document.getElementById('productModal');
    
    // Set product details
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalPrice').textContent = `₱${product.price}`;
    document.getElementById('modalDescription').textContent = product.description;
    
    // Set main image
    document.getElementById('modalMainImage').src = product.images[0];
    
    // Create thumbnails
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    thumbnailContainer.innerHTML = '';
    product.images.forEach((img, index) => {
        const thumb = document.createElement('img');
        thumb.src = img;
        thumb.classList.add('thumbnail');
        if (index === 0) thumb.classList.add('active');
        thumb.onclick = () => changeMainImage(img, thumb);
        thumbnailContainer.appendChild(thumb);
    });
    
    // Update size buttons with stock info
    updateSizeButtonsStock(product.name);
    
    // Reset size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedSize = null;
    
    modal.style.display = 'block';
}

function updateSizeButtonsStock(productName) {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    document.querySelectorAll('.size-btn').forEach(btn => {
        const size = btn.dataset.size;
        const stock = getStock(productName, size);
        
        // Update button text with stock
        if (stock === 0) {
            btn.textContent = `${size} (Out)`;
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        } else if (stock < 5) {
            btn.textContent = `${size} (${stock})`;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        } else {
            btn.textContent = size;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

function changeMainImage(imgSrc, thumbnail) {
    document.getElementById('modalMainImage').src = imgSrc;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

// Size selection in modal
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedSize = this.dataset.size;
    });
});

// Modal order button
document.getElementById('modalOrderBtn').addEventListener('click', function() {
    if (!selectedSize) {
        alert('Please select a size first!');
        return;
    }
    
    const product = products[currentProduct];
    closeModal('productModal');
    
    // Small delay for smooth transition
    setTimeout(() => {
        openOrderForm(currentProduct, product.name, product.price);
        // Pre-select the size
        document.getElementById('size').value = selectedSize;
    }, 300);
});

// Order Form Functions
function openOrderForm(productId, productName, price) {
    currentProduct = productId;
    orderData = {
        product: productName,
        price: parseFloat(price)
    };
    
    document.getElementById('productName').value = productName;
    document.getElementById('orderModal').style.display = 'block';
    updateOrderSummary();
}

function updateOrderSummary() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const subtotal = orderData.price * quantity;
    
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₱${subtotal.toFixed(2)}`;
}

// Update summary when quantity changes
document.getElementById('quantity').addEventListener('input', updateOrderSummary);

// Order Form Submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        customerName: document.getElementById('customerName').value,
        contactNumber: document.getElementById('contactNumber').value,
        address: document.getElementById('address').value,
        product: document.getElementById('productName').value,
        size: document.getElementById('size').value,
        quantity: parseInt(document.getElementById('quantity').value),
        paymentMode: document.getElementById('paymentMode').value,
        notes: document.getElementById('notes').value,
        total: document.getElementById('total').textContent
    };
    
    // Check stock availability
    const availableStock = getStock(formData.product, formData.size);
    if (availableStock < formData.quantity) {
        alert(`Sorry, only ${availableStock} items available in size ${formData.size}. Please adjust your quantity or choose a different size.`);
        return;
    }
    
    // Send order to Facebook
    sendOrderToFacebook(formData);
});

function sendOrderToFacebook(formData) {
    // Create order data object
    const orderData = {
        orderNumber: `DS${Date.now()}`,
        timestamp: new Date().toISOString(),
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        product: formData.product,
        size: formData.size,
        quantity: formData.quantity,
        paymentMode: formData.paymentMode,
        total: formData.total,
        notes: formData.notes || ''
    };

    // Check if config is loaded
    if (typeof CONFIG === 'undefined' || !CONFIG.GOOGLE_SHEET_URL || CONFIG.GOOGLE_SHEET_URL === 'YOUR_WEB_APP_URL_HERE') {
        alert('⚠️ Configuration error: Google Sheets URL not set. Please contact administrator.');
        console.error('CONFIG not loaded or GOOGLE_SHEET_URL not configured');
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.submit-order-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'SUBMITTING...';
    submitBtn.disabled = true;

    // Send order to Google Sheets
    fetch(CONFIG.GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'addOrder',
            ...orderData
        })
    }).then(() => {
        console.log('Order sent to Google Sheets successfully');
        
        // Decrease stock after successful order
        return fetch(CONFIG.GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'decreaseStock',
                product: orderData.product,
                size: orderData.size,
                quantity: orderData.quantity
            })
        });
    }).then(() => {
        console.log('Stock updated successfully');
        
        // Reload inventory
        loadInventory();
        
        // Close order modal
        closeModal('orderModal');
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('orderForm').reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
    }).catch(error => {
        console.error('Error sending to Google Sheets:', error);
        alert('⚠️ Failed to submit order. Please try again or contact us directly.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'flex';
}

function closeSuccessMessage() {
    document.getElementById('successMessage').style.display = 'none';
}

// Modal Close Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking X
document.querySelectorAll('.close-modal').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Smooth scroll offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add scroll effect to navbar
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.5)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe product cards
document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

console.log('%c🔥 DAMNSON CLOTHING 🔥', 'font-size: 20px; font-weight: bold; color: #fff; background: #000; padding: 10px;');
console.log('%cDon\'t settle for ordinary streetwear', 'font-size: 14px; color: #888;');
