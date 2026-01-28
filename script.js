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

// Google Sheets Configuration
// IMPORTANT: Replace with your Google Apps Script Web App URL
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxG6lGszAHb4C9ajwnMH9ZUC2f2fqFnFUswn-b0cNZfPOH-vmQN1INU92fHOXA0cFMDlQ/exec';

let currentProduct = null;
let selectedSize = null;
let orderData = {};

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
    
    // Reset size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedSize = null;
    
    modal.style.display = 'block';
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
        quantity: document.getElementById('quantity').value,
        paymentMode: document.getElementById('paymentMode').value,
        notes: document.getElementById('notes').value,
        total: document.getElementById('total').textContent
    };
    
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

    // Store order in localStorage as backup
    const localOrders = JSON.parse(localStorage.getItem('damnson_orders') || '[]');
    localOrders.push(orderData);
    localStorage.setItem('damnson_orders', JSON.stringify(localOrders));

    // Send order to Google Sheets
    if (GOOGLE_SHEET_URL !== 'YOUR_WEB_APP_URL_HERE') {
        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        }).then(() => {
            console.log('Order sent to Google Sheets');
        }).catch(error => {
            console.error('Error sending to Google Sheets:', error);
            // Order is still saved in localStorage as backup
        });
    }
    
    // Create order message
    const orderMessage = `
🛍️ NEW ORDER - DAMNSON CLOTHING

👤 CUSTOMER INFORMATION:
Name: ${formData.customerName}
Contact: ${formData.contactNumber}
Address: ${formData.address}

📦 ORDER DETAILS:
Product: ${formData.product}
Size: ${formData.size}
Quantity: ${formData.quantity}
Total: ${formData.total}

💳 Payment Method: ${formData.paymentMode}

📝 Additional Notes: ${formData.notes || 'None'}

Order #: ${orderData.orderNumber}
---
Please confirm this order via Facebook Messenger.
    `;
    
    // Store order in localStorage for backup
    const orders = JSON.parse(localStorage.getItem('damnson_orders') || '[]');
    orders.push({
        ...formData,
        timestamp: new Date().toISOString(),
        orderNumber: `DS${Date.now()}`
    });
    localStorage.setItem('damnson_orders', JSON.stringify(orders));
    
    // Open WhatsApp with pre-filled message
    const whatsappNumber = '639513253801'; // Philippine number format
    const encodedMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Close order modal
    closeModal('orderModal');
    
    // Show success message
    showSuccessMessage();
    
    // Open WhatsApp in new tab
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1000);
    
    // Reset form
    document.getElementById('orderForm').reset();
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
