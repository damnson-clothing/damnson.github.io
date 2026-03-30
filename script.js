// ============================================================
// DamnSon Clothing — Storefront Script
// All products loaded dynamically from Google Sheets
// ============================================================

let allProducts  = [];
let allInventory = [];
let currentProduct  = null;
let selectedSize    = null;

window.addEventListener('DOMContentLoaded', () => {
  initNav();
  loadProducts();
  initScrollEffects();
});

function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu   = document.querySelector('.nav-menu');

  if (hamburger) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) window.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', () => {
    document.querySelector('.navbar').style.boxShadow =
      window.pageYOffset > 100 ? '0 2px 20px rgba(0,0,0,0.5)' : 'none';
  });
}

async function loadProducts() {
  showState('loading');

  if (!CONFIG?.GOOGLE_SHEET_URL) {
    console.error('CONFIG not set');
    showState('empty');
    return;
  }

  try {
    const res  = await fetch(`${CONFIG.GOOGLE_SHEET_URL}?action=getProducts&apiKey=${CONFIG.API_KEY}`);
    const data = await res.json();

    if (data.status === 'success') {
      allProducts  = data.products  || [];
      allInventory = data.inventory || [];
      renderProducts();
    } else {
      throw new Error(data.message || 'Failed to load products');
    }
  } catch (err) {
    console.error('Product load error:', err);
    showState('empty');
  }
}

function showState(state) {
  document.getElementById('productsLoading').style.display = state === 'loading' ? 'block' : 'none';
  document.getElementById('productsGrid').style.display    = state === 'loaded'  ? 'grid'  : 'none';
  document.getElementById('productsEmpty').style.display   = state === 'empty'   ? 'block' : 'none';
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');

  if (!allProducts.length) {
    showState('empty');
    return;
  }

  grid.innerHTML = allProducts.map(product => buildProductCard(product)).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(50px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
  });

  showState('loaded');
}

function buildProductCard(product) {
  const mainImage   = product.images?.[0] || '';
  const hoverImage  = product.images?.[1] || mainImage;
  const totalStock  = getTotalStock(product.productId || product.name);
  const isOOS       = totalStock === 0;
  
  // --- NEW FIXED BADGE STRING ---
  const badgeHtml   = product.badge
    ? `<div class="product-badge badge-${String(product.badge).toLowerCase().replace(/\s+/g,'-')}">${product.badge}</div>`
    : '';

  const stockBadge = isOOS
    ? `<p class="stock-badge stock-out">OUT OF STOCK</p>`
    : totalStock < 10
      ? `<p class="stock-badge stock-low">Only ${totalStock} left!</p>`
      : `<p class="stock-badge stock-available">${totalStock} in stock</p>`;

  return `
    <div class="product-card" data-product-id="${product.productId}">
      ${badgeHtml}
      <div class="product-image-wrapper">
        ${mainImage
          ? `<img src="${mainImage}"  alt="${product.name}" class="product-image main-image">
             <img src="${hoverImage}" alt="${product.name}" class="product-image hover-image">`
          : `<div style="width:100%;aspect-ratio:1/1;background:var(--card-bg);display:flex;align-items:center;justify-content:center;color:var(--text-secondary)">No Image</div>`
        }
        <div class="product-overlay">
          <button class="quick-view-btn" onclick="openQuickView('${product.productId}')">QUICK VIEW</button>
        </div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">₱${Number(product.price).toLocaleString()}.00</p>
        ${stockBadge}
        <button
          class="order-btn"
          onclick="openOrderForm('${product.productId}')"
          ${isOOS ? 'disabled' : ''}
        >${isOOS ? 'OUT OF STOCK' : 'ORDER NOW'}</button>
      </div>
    </div>
  `;
}

function getStock(productId, size) {
  const item = allInventory.find(i =>
    (i.productId === productId || i.product === productId) && i.size === size
  );
  return item ? Number(item.stock) : 0;
}

function getTotalStock(productId) {
  return allInventory
    .filter(i => i.productId === productId || i.product === productId)
    .reduce((sum, i) => sum + Number(i.stock), 0);
}

function openQuickView(productId) {
  const product = allProducts.find(p => p.productId === productId);
  if (!product) return;
  currentProduct = product;
  selectedSize   = null;

  document.getElementById('modalProductName').textContent  = product.name;
  document.getElementById('modalPrice').textContent        = `₱${Number(product.price).toLocaleString()}.00`;
  document.getElementById('modalDescription').textContent  = product.description || '';

  const images = product.images || [];
  document.getElementById('modalMainImage').src = images[0] || '';

  const thumbContainer = document.getElementById('modalThumbnails');
  thumbContainer.innerHTML = images.map((img, i) => `
    <img src="${img}" class="thumbnail${i === 0 ? ' active' : ''}"
      onclick="changeModalImage('${img}', this)" alt="${product.name}">
  `).join('');

  const sizesEl = document.getElementById('modalSizeOptions');
  const SIZES   = ['S','M','L','XL','XXL'];
  sizesEl.innerHTML = SIZES.map(size => {
    const stock = getStock(productId, size);
    const label = stock === 0 ? `${size} (Out)` : stock < 5 ? `${size} (${stock})` : size;
    return `<button class="size-btn" data-size="${size}" ${stock === 0 ? 'disabled' : ''}
      onclick="selectSize(this, '${size}')">${label}</button>`;
  }).join('');

  document.getElementById('productModal').style.display = 'block';
}

function changeModalImage(src, thumb) {
  document.getElementById('modalMainImage').src = src;
  document.querySelectorAll('#modalThumbnails .thumbnail').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function selectSize(btn, size) {
  document.querySelectorAll('#modalSizeOptions .size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSize = size;
}

document.getElementById('modalOrderBtn').addEventListener('click', () => {
  if (!selectedSize) { alert('Please select a size first!'); return; }
  closeModal('productModal');
  setTimeout(() => {
    openOrderForm(currentProduct.productId, selectedSize);
  }, 200);
});

function openOrderForm(productId, preSelectedSize = '') {
  const product = allProducts.find(p => p.productId === productId);
  if (!product) return;
  currentProduct = product;

  document.getElementById('orderProductDisplay').value = product.name;
  document.getElementById('orderProductId').value      = product.productId;
  document.getElementById('orderProductName').value    = product.name;
  document.getElementById('orderProductPrice').value   = product.price;

  if (preSelectedSize) {
    document.getElementById('orderSize').value = preSelectedSize;
  }

  updateOrderSummary();
  document.getElementById('orderModal').style.display = 'block';
}

function updateOrderSummary() {
  const price    = parseFloat(document.getElementById('orderProductPrice').value) || 0;
  const qty      = parseInt(document.getElementById('orderQty').value) || 1;
  const subtotal = price * qty;
  document.getElementById('subtotal').textContent   = `₱${subtotal.toFixed(2)}`;
  document.getElementById('orderTotal').textContent = `₱${subtotal.toFixed(2)}`;
}

document.getElementById('orderQty').addEventListener('input', updateOrderSummary);

async function submitOrder(e) {
  e.preventDefault();

  const productId   = document.getElementById('orderProductId').value;
  const productName = document.getElementById('orderProductName').value;
  const price       = parseFloat(document.getElementById('orderProductPrice').value);
  const size        = document.getElementById('orderSize').value;
  const qty         = parseInt(document.getElementById('orderQty').value);
  const total       = document.getElementById('orderTotal').textContent;

  const available = getStock(productId, size);
  if (available < qty) {
    alert(`Sorry, only ${available} item(s) available in size ${size}.`);
    return;
  }

  const orderData = {
    action:        'addOrder',
    apiKey:        CONFIG.API_KEY,
    orderNumber:   `DS${Date.now()}`,
    timestamp:     new Date().toISOString(),
    customerName:  document.getElementById('customerName').value,
    contactNumber: document.getElementById('contactNumber').value,
    address:       document.getElementById('address').value,
    product:       productName,
    productId:     productId,
    size,
    quantity:      qty,
    paymentMode:   document.getElementById('paymentMode').value,
    total,
    notes:         document.getElementById('orderNotes').value || ''
  };

  const btn = document.getElementById('submitOrderBtn');
  btn.textContent = 'SUBMITTING...';
  btn.disabled    = true;

  try {
    await fetch(CONFIG.GOOGLE_SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    await fetch(CONFIG.GOOGLE_SHEET_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'decreaseStock', apiKey: CONFIG.API_KEY,
        productId, size, quantity: qty
      })
    });

    const invItem = allInventory.find(i =>
      (i.productId === productId || i.product === productId) && i.size === size
    );
    if (invItem) invItem.stock = Math.max(0, Number(invItem.stock) - qty);

    closeModal('orderModal');
    document.getElementById('orderForm').reset();
    document.getElementById('successMessage').style.display = 'flex';

    renderProducts();

  } catch (err) {
    console.error('Order error:', err);
    alert('Failed to submit order. Please try again.');
  } finally {
    btn.textContent = 'SUBMIT ORDER';
    btn.disabled    = false;
  }
}

function closeSuccess() {
  document.getElementById('successMessage').style.display = 'none';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.modal || btn.closest('.modal')?.id;
    if (id) closeModal(id);
  });
});

window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) e.target.style.display = 'none';
});

const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

function initScrollEffects() {
  document.querySelectorAll('.product-card').forEach(card => cardObserver.observe(card));
}

if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}

console.log('%c🔥 DAMNSON CLOTHING 🔥', 'font-size:20px;font-weight:bold;color:#fff;background:#000;padding:10px;');
console.log('%cDon\'t settle for ordinary streetwear', 'font-size:14px;color:#888;');
