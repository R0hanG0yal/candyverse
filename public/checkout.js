// CandyVerse — Checkout Page

function getCart()      { return JSON.parse(localStorage.getItem('cv_cart') || '[]'); }
function getCartCount(c){ return c.reduce(function(s,i){return s+i.qty;},0); }
function getCartTotal(c){ return c.reduce(function(s,i){return s+i.price*i.qty;},0); }

(function init() {
  var cart  = getCart();
  var badge = document.getElementById('cart-count');
  if (badge) badge.textContent = getCartCount(cart);
  if (!cart.length) { window.location.href = 'cart.html'; return; }

  var miniItems = document.getElementById('mini-items');
  var miniTotal = document.getElementById('mini-total');
  if (miniItems) {
    miniItems.innerHTML = cart.map(function(i){
      return '<div style="display:flex;justify-content:space-between;padding:.2rem 0"><span>'+i.name+' × '+i.qty+'</span><span>₹'+(i.price*i.qty).toLocaleString('en-IN')+'</span></div>';
    }).join('');
  }
  var total = getCartTotal(cart), delivery = total>=499?0:49;
  if (miniTotal) miniTotal.textContent = 'Total: ₹'+(total+delivery).toLocaleString('en-IN')+(delivery===0?' (Free Delivery!)':'');

  var saved = JSON.parse(localStorage.getItem('cv_checkout')||'{}');
  if (saved.name)    document.getElementById('name').value    = saved.name;
  if (saved.phone)   document.getElementById('phone').value   = saved.phone;
  if (saved.address) document.getElementById('address').value = saved.address;
  if (saved.payment) document.getElementById('payment-method').value = saved.payment;
})();

function showError(msg){ var el=document.getElementById('form-error'); el.textContent=msg; el.style.display='block'; el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
function hideError()   { document.getElementById('form-error').style.display='none'; }

function proceedToPayment() {
  hideError();
  var name    = document.getElementById('name').value.trim();
  var phone   = document.getElementById('phone').value.trim();
  var address = document.getElementById('address').value.trim();
  var payment = document.getElementById('payment-method').value;

  if (!name)                            return showError('Please enter your full name');
  if (!phone||!/^\d{10}$/.test(phone))  return showError('Please enter a valid 10-digit phone number');
  if (!address||address.length<15)      return showError('Please enter your full delivery address');
  if (!payment)                         return showError('Please select a payment method');

  localStorage.setItem('cv_checkout', JSON.stringify({name:name,phone:phone,address:address,payment:payment}));
  var btn = document.getElementById('proceed-btn');
  btn.disabled = true;

  // ── CASH ON DELIVERY ──────────────────────────────────
  if (payment === 'cod') {
    btn.textContent = 'Placing Order...';
    var cart     = getCart();
    var subtotal = getCartTotal(cart);
    var delivery = subtotal>=499?0:49;
    var total    = subtotal+delivery;

    var order = {
      id: 'CV'+Date.now(),
      date: new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}),
      timestamp: Date.now(),
      items: cart.map(function(i){return{id:i.id,name:i.name,price:i.price,qty:i.qty,emoji:i.emoji||'🍭'};}),
      subtotal:subtotal, delivery:delivery, total:total,
      customer:{name:name,phone:phone,address:address,paymentMethod:'Cash on Delivery'},
      paymentStatus:'Pending',
      orderStatus:'Order Placed',
      statusTimestamps:{'Order Placed':Date.now()}
    };

    // Save to Firebase (shared across all devices)
    cvSaveOrder(order, function() {
      localStorage.setItem('cv_last_order', JSON.stringify(order));
      localStorage.removeItem('cv_cart');
      window.location.href = 'order-success.html';
    });
    return;
  }

  // ── UPI / ONLINE ───────────────────────────────────────
  btn.textContent = 'Processing...';
  setTimeout(function(){ window.location.href = 'payment.html'; }, 600);
}
