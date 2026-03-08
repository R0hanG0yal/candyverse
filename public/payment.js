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

  var upiBtn=document.getElementById('upi-copy');
  if(upiBtn){
    upiBtn.addEventListener('click',function(){
      navigator.clipboard.writeText('candyverse@upi').then(function(){
        var lbl=document.getElementById('copy-label');
        if(lbl){lbl.textContent='✓ copied!';setTimeout(function(){lbl.textContent='tap to copy';},2000);}
      }).catch(function(){});
    });
  }
})();

function confirmPayment(){
  var btn=document.getElementById('paid-btn');
  btn.disabled=true;
  btn.textContent='⏳ Saving...';

  var cart=getCart();
  if(!cart.length){ window.location.href='products.html'; return; }

  var checkout={};
  try{checkout=JSON.parse(localStorage.getItem('cv_checkout')||'{}');}catch(e){}
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

  // Step 1 — Save to localStorage (instant, always works)
  try{
    var orders=JSON.parse(localStorage.getItem('cv_orders')||'[]');
    orders.unshift(order);
    localStorage.setItem('cv_orders',JSON.stringify(orders));
    localStorage.setItem('cv_last_order',JSON.stringify(order));
    localStorage.removeItem('cv_cart');
  }catch(e){}

  // Step 2 — Save to Firebase then redirect
  // Initialize Firebase right now if not already done
  try{ cvInitFirebase(); }catch(e){}

  function goToSuccess(){ window.location.href='order-success.html'; }

  if(typeof CV_DB_READY !== 'undefined' && CV_DB_READY && CV_DB_REF){
    // Firebase is ready — save then redirect
    CV_DB_REF.child(order.id).set(order)
      .then(function(){ goToSuccess(); })
      .catch(function(){ goToSuccess(); }); // even if Firebase fails, still redirect
    // Safety net — redirect after 3s no matter what
    setTimeout(goToSuccess, 3000);
  } else {
    // Firebase not ready — redirect immediately
    goToSuccess();
  }
}