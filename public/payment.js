// CandyVerse — Payment Page

function getCart()      { return JSON.parse(localStorage.getItem('cv_cart')||'[]'); }
function getCartCount(c){ return c.reduce(function(s,i){return s+i.qty;},0); }
function getCartTotal(c){ return c.reduce(function(s,i){return s+i.price*i.qty;},0); }

function showToast(msg,icon){
  var t=document.getElementById('toast'); if(!t) return;
  document.getElementById('toast-msg').textContent=msg;
  var ti=t.querySelector('.toast-icon'); if(ti) ti.textContent=icon||'💫';
  t.classList.add('show');
}

(function init(){
  var cart=getCart();
  var checkout=JSON.parse(localStorage.getItem('cv_checkout')||'{}');
  if(!cart.length){ window.location.href='cart.html'; return; }

  var badge=document.getElementById('cart-count');
  if(badge) badge.textContent=getCartCount(cart);

  var subtotal=getCartTotal(cart), delivery=subtotal>=499?0:49, total=subtotal+delivery;
  var amtEl=document.getElementById('payment-amount');
  if(amtEl) amtEl.textContent='₹'+total.toLocaleString('en-IN');

  var summaryEl=document.getElementById('payment-order-summary');
  if(summaryEl){
    var lines=cart.map(function(i){
      return '<div style="display:flex;justify-content:space-between;padding:.2rem 0"><span>'+i.name+' × '+i.qty+'</span><span>₹'+(i.price*i.qty).toLocaleString('en-IN')+'</span></div>';
    }).join('');
    var delLine='<div style="display:flex;justify-content:space-between;padding:.2rem 0;color:rgba(100,0,60,.55)"><span>Delivery</span><span>'+(delivery===0?'FREE':'₹'+delivery)+'</span></div>';
    var custLine=checkout.name?'<div style="padding-bottom:.5rem;color:rgba(80,0,40,.75);">👤 '+checkout.name+' · 📱 '+(checkout.phone||'')+'</div>':'';
    summaryEl.innerHTML=custLine+lines+delLine;
  }
})();

var upiBtn=document.getElementById('upi-copy');
if(upiBtn){
  upiBtn.addEventListener('click',function(){
    navigator.clipboard.writeText('candyverse@upi').then(function(){
      var lbl=document.getElementById('copy-label');
      if(lbl){ lbl.textContent='✓ copied!'; setTimeout(function(){ lbl.textContent='tap to copy'; },2000); }
    }).catch(function(){});
  });
}

function confirmPayment(){
  var btn=document.getElementById('paid-btn');
  if(btn){ btn.disabled=true; btn.textContent='⏳ Saving...'; }

  var cart=getCart();
  if(!cart.length){ window.location.href='products.html'; return; }

  var checkout=JSON.parse(localStorage.getItem('cv_checkout')||'{}');
  var subtotal=getCartTotal(cart), delivery=subtotal>=499?0:49, total=subtotal+delivery;

  var order={
    id:'CV'+Date.now(),
    date:new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}),
    timestamp:Date.now(),
    items:cart.map(function(i){return{id:i.id,name:i.name,price:i.price,qty:i.qty,emoji:i.emoji||'🍭'};}),
    subtotal:subtotal, delivery:delivery, total:total,
    customer:{
      name:checkout.name||'Guest',
      phone:checkout.phone||'',
      address:checkout.address||'',
      paymentMethod:checkout.payment||'upi'
    },
    paymentStatus:'Paid',
    orderStatus:'Order Placed',
    statusTimestamps:{'Order Placed':Date.now()}
  };

  // ✅ STEP 1 — Save to localStorage IMMEDIATELY (always works)
  try {
    var orders=JSON.parse(localStorage.getItem('cv_orders')||'[]');
    orders.unshift(order);
    localStorage.setItem('cv_orders',JSON.stringify(orders));
    localStorage.setItem('cv_last_order',JSON.stringify(order));
    localStorage.removeItem('cv_cart');
  } catch(e){}

  // ✅ STEP 2 — Redirect immediately, don't wait for Firebase
  showToast('🎉 Order placed! Redirecting...','🎊');
  setTimeout(function(){ window.location.href='order-success.html'; }, 800);

  // ✅ STEP 3 — Try Firebase in background (doesn't block redirect)
  try {
    if(typeof cvSaveOrder==='function' && typeof CV_CONFIG_VALID!=='undefined' && CV_CONFIG_VALID){
      cvSaveOrder(order, function(){});
    }
  } catch(e){}
}