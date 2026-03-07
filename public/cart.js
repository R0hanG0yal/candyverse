// ═══════════════════════════════════════════════════════
//  CandyVerse — Cart Page
// ═══════════════════════════════════════════════════════

function getCart() {
  return JSON.parse(localStorage.getItem('cv_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cv_cart', JSON.stringify(cart));
}
function getCartTotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}
function getCartCount(cart) {
  return cart.reduce((s, i) => s + i.qty, 0);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-container');
  const subtitle = document.getElementById('cart-subtitle');
  const badge = document.getElementById('cart-count');

  const count = getCartCount(cart);
  if (badge) badge.textContent = count;

  if (!cart.length) {
    subtitle.textContent = 'Nothing here yet — go add some treats!';
    container.innerHTML = `
      <div class="cart-empty">
        <span class="empty-emoji">🍬</span>
        <h2>Your cart is empty!</h2>
        <p style="color:var(--text-muted);margin-bottom:1.5rem">Looks like you haven't added any candy yet.</p>
        <a href="products.html" class="btn btn-primary btn-lg">🛍 Browse Snacks</a>
      </div>`;
    return;
  }

  subtitle.textContent = `${count} item${count !== 1 ? 's' : ''} in your cart`;

  const total = getCartTotal(cart);
  const delivery = total >= 499 ? 0 : 49;
  const grandTotal = total + delivery;

  const itemsHTML = cart.map(item => {
    const imgHTML = item.img
      ? `<img src="${item.img}" alt="${item.name}" class="cart-item-img" />`
      : `<div class="cart-item-img" style="background:linear-gradient(135deg,rgba(255,107,157,0.3),rgba(107,207,255,0.3));display:flex;align-items:center;justify-content:center;font-size:2.2rem;border-radius:10px;flex-shrink:0;">${item.emoji || '🍭'}</div>`;

    return `
      <div class="cart-item" data-id="${item.id}" style="animation:cartItemIn 0.4s ease both;">
        ${imgHTML}
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price} each</div>
          <div class="cart-item-qty">
            <button class="btn-qty" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-display" id="qty-${item.id}">${item.name} x${item.qty}</span>
            <button class="btn-qty" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-remove">
          <div style="text-align:right;margin-bottom:0.5rem;font-family:'Fredoka One',cursive;color:var(--yellow);font-size:1.1rem;">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </div>
          <button class="btn btn-danger btn-sm" data-remove="${item.id}">🗑 Remove</button>
        </div>
      </div>`;
  }).join('');

  const summaryHTML = `
    <div class="cart-summary">
      <h3>🧾 Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal (${count} items)</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>🚚 Delivery</span>
        <span>${delivery === 0 ? '<span style="color:#00e676">FREE</span>' : '₹' + delivery}</span>
      </div>
      ${delivery === 0 ? '' : `<div style="font-size:0.8rem;color:var(--text-muted);padding:0.25rem 0;">Add ₹${499 - total} more for free delivery!</div>`}
      <div class="summary-row total">
        <span>💰 Grand Total</span>
        <span>₹${grandTotal.toLocaleString('en-IN')}</span>
      </div>
      <div style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap;">
        <a href="products.html" class="btn btn-secondary" style="flex:1;">← Continue Shopping</a>
        <a href="checkout.html" class="btn btn-primary" style="flex:1;">🏠 Proceed to Checkout →</a>
      </div>
    </div>`;

  container.innerHTML = `
    <style>
      @keyframes cartItemIn {
        from { opacity:0; transform:translateX(-20px); }
        to   { opacity:1; transform:translateX(0); }
      }
    </style>
    <div id="cart-items">${itemsHTML}</div>
    ${summaryHTML}`;

  // Bind quantity buttons
  container.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      const cart2 = getCart();
      const item = cart2.find(i => i.id === id);
      if (!item) return;
      if (action === 'inc') {
        item.qty += 1;
      } else {
        item.qty -= 1;
        if (item.qty <= 0) {
          const idx = cart2.indexOf(item);
          cart2.splice(idx, 1);
          showToast(`🗑 ${item.name} removed`);
        }
      }
      saveCart(cart2);
      renderCart();
    });
  });

  // Bind remove buttons
  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      const cart2 = getCart();
      const item = cart2.find(i => i.id === id);
      const idx = cart2.findIndex(i => i.id === id);
      if (idx !== -1) {
        cart2.splice(idx, 1);
        saveCart(cart2);
        showToast(`🗑 ${item?.name || 'Item'} removed from cart`);
        renderCart();
      }
    });
  });
}

renderCart();
