// CandyVerse — Admin Dashboard (Firebase-powered, cross-device)

var allOrders = [];
var filtered  = [];

var ORDER_STEPS = ['Order Placed','Preparing','Packed','Shipped','Out for Delivery','Delivered'];
var STEP_EMOJI  = {'Order Placed':'📋','Preparing':'👨‍🍳','Packed':'📦','Shipped':'🚚','Out for Delivery':'🛵','Delivered':'🎉'};
var STEP_COLORS = {
  'Order Placed':    {bg:'rgba(0,180,255,0.12)', border:'rgba(0,180,255,0.4)',  color:'#0055aa'},
  'Preparing':       {bg:'rgba(255,143,0,0.12)', border:'rgba(255,143,0,0.4)',  color:'#b34700'},
  'Packed':          {bg:'rgba(224,64,251,0.12)',border:'rgba(224,64,251,0.4)', color:'#7a00b5'},
  'Shipped':         {bg:'rgba(0,180,255,0.15)', border:'rgba(0,180,255,0.5)',  color:'#003d99'},
  'Out for Delivery':{bg:'rgba(255,77,143,0.12)',border:'rgba(255,77,143,0.4)', color:'#cc0066'},
  'Delivered':       {bg:'rgba(0,200,83,0.12)',  border:'rgba(0,200,83,0.4)',   color:'#00875a'}
};

function getSheetWebhook(){ return localStorage.getItem('cv_sheet_webhook')||''; }

function syncToSheets(order){
  var url=getSheetWebhook(); if(!url) return;
  var payload={
    orderId:order.id, date:order.date,
    customerName:order.customer?order.customer.name:'',
    phone:order.customer?order.customer.phone:'',
    address:order.customer?order.customer.address:'',
    items:order.items.map(function(i){return i.name+' x'+i.qty;}).join(', '),
    subtotal:order.subtotal||order.total, delivery:order.delivery||0, total:order.total,
    paymentMethod:order.customer?order.customer.paymentMethod:'',
    paymentStatus:order.paymentStatus||'', orderStatus:order.orderStatus||'Order Placed',
    lastUpdated:new Date().toLocaleString('en-IN')
  };
  fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(function(){});
}

function syncAllToSheets(){
  var url=getSheetWebhook();
  if(!url){alert('⚠️ Please set your Google Sheets webhook URL first!');return;}
  allOrders.forEach(function(o){syncToSheets(o);});
  showToast('📊 All orders sent to Google Sheets!','✅');
}

function showToast(msg,icon){
  var t=document.getElementById('toast'); if(!t) return;
  document.getElementById('toast-msg').textContent=msg;
  var ti=t.querySelector('.toast-icon'); if(ti) ti.textContent=icon||'💫';
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},3000);
}

function renderStats(){
  var total=allOrders.length;
  var revenue=allOrders.reduce(function(s,o){return s+o.total;},0);
  var paid=allOrders.filter(function(o){return o.paymentStatus==='Paid';}).length;
  var delivered=allOrders.filter(function(o){return o.orderStatus==='Delivered';}).length;
  var items=allOrders.reduce(function(s,o){return s+o.items.reduce(function(ss,i){return ss+i.qty;},0);},0);
  var el=document.getElementById('admin-stats'); if(!el) return;
  el.innerHTML=
    '<div class="stat-card"><span class="stat-value">'+total+'</span><span class="stat-label">Total Orders</span></div>'+
    '<div class="stat-card"><span class="stat-value">₹'+revenue.toLocaleString('en-IN')+'</span><span class="stat-label">Revenue</span></div>'+
    '<div class="stat-card"><span class="stat-value">'+paid+'</span><span class="stat-label">Paid</span></div>'+
    '<div class="stat-card"><span class="stat-value">'+delivered+'</span><span class="stat-label">Delivered</span></div>'+
    '<div class="stat-card"><span class="stat-value">'+items+'</span><span class="stat-label">Items Sold</span></div>';
}

function statusBadge(status){
  var s=STEP_COLORS[status]||STEP_COLORS['Order Placed'], e=STEP_EMOJI[status]||'📋';
  return '<span style="display:inline-flex;align-items:center;gap:.3rem;background:'+s.bg+';border:1.5px solid '+s.border+';color:'+s.color+';border-radius:99px;padding:.25rem .8rem;font-size:.78rem;font-weight:800;">'+e+' '+status+'</span>';
}

function renderOrders(list){
  var container=document.getElementById('admin-orders-list'); if(!container) return;
  if(!list.length){
    container.innerHTML='<div style="text-align:center;padding:4rem;opacity:.5;"><div style="font-size:4rem;margin-bottom:1rem">📦</div><p style="font-family:\'Fredoka One\',cursive;font-size:1.5rem">No orders found</p></div>';
    return;
  }
  container.innerHTML=list.map(function(order,idx){
    var itemRows=order.items.map(function(item){
      return '<tr><td>'+(item.emoji||'🍭')+' '+item.name+'</td><td>× '+item.qty+'</td><td>₹'+item.price+'</td><td style="color:#b34700;font-weight:800">₹'+(item.price*item.qty).toLocaleString('en-IN')+'</td></tr>';
    }).join('');
    var payBadge=order.paymentStatus==='Paid'
      ?'<span class="order-status status-paid">✅ Paid</span>'
      :'<span class="order-status status-pending">🕐 Pending</span>';
    var oStatus=order.orderStatus||'Order Placed';
    var opts=ORDER_STEPS.map(function(step){
      return '<option value="'+step+'"'+(step===oStatus?' selected':'')+'>'+((STEP_EMOJI[step]||'')+' '+step)+'</option>';
    }).join('');
    var methodEmoji={upi:'📱',card:'💳',netbanking:'🏦',cod:'💵','Cash on Delivery':'💵'}[order.customer&&order.customer.paymentMethod]||'💳';
    var delay=(Math.min(idx,10)*0.06).toFixed(2);

    return '<div class="order-card" style="animation:adminCardIn 0.4s ease '+delay+'s both;">'+
      '<div class="order-header">'+
        '<div>'+
          '<div class="order-id">🛒 '+order.id+'</div>'+
          '<div class="order-date">📅 '+order.date+'</div>'+
          '<div style="font-size:.82rem;color:var(--text-muted);font-weight:600;margin-top:.2rem">👤 '+(order.customer&&order.customer.name||'Guest')+' · 📱 '+(order.customer&&order.customer.phone||'N/A')+'</div>'+
        '</div>'+
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:.5rem">'+
          '<div class="order-total-badge">₹'+order.total.toLocaleString('en-IN')+'</div>'+
          payBadge+
          '<span style="font-size:.8rem;color:var(--text-muted);font-weight:700">'+methodEmoji+' '+(order.customer&&order.customer.paymentMethod||'UPI').toString().toUpperCase()+'</span>'+
        '</div>'+
      '</div>'+
      '<div style="background:rgba(255,255,255,.35);border-radius:12px;padding:1rem;margin:.75rem 0;border:1.5px solid rgba(255,77,143,.15)">'+
        '<div style="font-weight:800;font-size:.85rem;color:var(--text-muted);margin-bottom:.6rem;text-transform:uppercase;letter-spacing:.5px">📍 Order Status</div>'+
        '<div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">'+
          statusBadge(oStatus)+
          '<select onchange="updateOrderStatus(\''+order.id+'\', this.value)" style="padding:.4rem .8rem;border-radius:99px;border:2px solid rgba(255,26,108,.3);background:rgba(255,255,255,.8);font-family:\'Nunito\',sans-serif;font-weight:800;font-size:.82rem;color:#3d0040;cursor:pointer;outline:none">'+opts+'</select>'+
          '<a href="order-track.html?id='+order.id+'" target="_blank" style="font-size:.8rem;font-weight:800;color:#0055aa;text-decoration:none;padding:.3rem .8rem;background:rgba(0,180,255,.1);border:1.5px solid rgba(0,180,255,.3);border-radius:99px">👁 Preview</a>'+
        '</div>'+
      '</div>'+
      '<table class="order-items-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>'+itemRows+'</tbody></table>'+
      '<div style="background:rgba(255,255,255,.2);border-radius:8px;padding:.75rem;margin-top:.5rem">'+
        '<div style="font-size:.82rem;color:var(--text-muted);font-weight:600">📍 '+(order.customer&&order.customer.address||'N/A')+'</div>'+
        '<div style="margin-top:.4rem;display:flex;gap:1rem;font-size:.82rem;font-weight:700">'+
          '<span style="color:var(--text-muted)">Subtotal: ₹'+(order.subtotal||order.total).toLocaleString('en-IN')+'</span>'+
          '<span style="color:var(--text-muted)">Delivery: '+(order.delivery===0?'FREE':'₹'+order.delivery)+'</span>'+
        '</div>'+
      '</div>'+
      '<div style="margin-top:.75rem;display:flex;gap:.75rem;justify-content:flex-end;flex-wrap:wrap">'+
        '<button class="btn btn-sm" style="background:rgba(0,200,83,.1);color:#00875a;border:1.5px solid rgba(0,200,83,.3)" onclick="syncSingleToSheets(\''+order.id+'\')">📊 Sync</button>'+
        '<button class="btn btn-sm" style="background:rgba(255,230,109,.1);color:#b34700;border:1px solid rgba(255,230,109,.3)" onclick="togglePayStatus(\''+order.id+'\')">💳 Toggle Pay</button>'+
        '<button class="btn btn-danger btn-sm" onclick="deleteOrder(\''+order.id+'\')">🗑 Delete</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function applyFilters(){
  var search=document.getElementById('admin-search')?document.getElementById('admin-search').value.toLowerCase().trim():'';
  var status=document.getElementById('admin-status-filter')?document.getElementById('admin-status-filter').value:'all';
  filtered=allOrders.filter(function(order){
    var matchStatus=status==='all'||order.paymentStatus===status;
    var matchSearch=!search||
      order.id.toLowerCase().includes(search)||
      (order.customer&&order.customer.name||'').toLowerCase().includes(search)||
      (order.customer&&order.customer.phone||'').includes(search)||
      order.items.some(function(i){return i.name.toLowerCase().includes(search);});
    return matchStatus&&matchSearch;
  });
  renderOrders(filtered);
}

function updateOrderStatus(orderId, newStatus){
  cvGetOrder(orderId, function(order){
    if(!order) return;
    order.orderStatus = newStatus;
    if(!order.statusTimestamps) order.statusTimestamps={};
    order.statusTimestamps[newStatus] = Date.now();
    cvSaveOrder(order, function(){
      showToast('✅ Status: '+newStatus, STEP_EMOJI[newStatus]||'📋');
      syncToSheets(order);
    });
  });
}

function togglePayStatus(orderId){
  cvGetOrder(orderId, function(order){
    if(!order) return;
    order.paymentStatus = order.paymentStatus==='Paid'?'Pending':'Paid';
    cvSaveOrder(order, function(){ syncToSheets(order); });
  });
}

function syncSingleToSheets(orderId){
  var url=getSheetWebhook();
  if(!url){alert('⚠️ Set your Google Sheets webhook URL first!');return;}
  cvGetOrder(orderId, function(order){ if(order){ syncToSheets(order); showToast('📊 Synced!','✅'); } });
}

function deleteOrder(orderId){
  if(!confirm('Delete order '+orderId+'?')) return;
  cvDeleteOrder(orderId, function(){showToast('Deleted','🗑');});
}

function clearAllOrders(){
  if(!allOrders.length) return;
  if(!confirm('⚠️ Delete ALL '+allOrders.length+' orders? Cannot be undone.')) return;
  cvClearAllOrders(function(){allOrders=[];filtered=[];renderStats();renderOrders([]);});
}

function exportExcel(){
  if(!window.XLSX){
    showToast('Loading Excel library...','⏳');
    var script=document.createElement('script');
    script.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload=function(){doExportExcel();};
    document.head.appendChild(script);
  } else { doExportExcel(); }
}

function doExportExcel(){
  var rows=[['Order ID','Date','Customer','Phone','Address','Items','Subtotal','Delivery','Total','Payment Method','Payment Status','Order Status']];
  allOrders.forEach(function(order){
    rows.push([order.id,order.date,order.customer&&order.customer.name||'',order.customer&&order.customer.phone||'',order.customer&&order.customer.address||'',
      order.items.map(function(i){return i.name+' x'+i.qty;}).join(', '),
      order.subtotal||order.total,order.delivery||0,order.total,
      order.customer&&order.customer.paymentMethod||'',order.paymentStatus||'',order.orderStatus||'Order Placed']);
  });
  var wb=XLSX.utils.book_new();
  var ws=XLSX.utils.aoa_to_sheet(rows);
  ws['!cols']=[{wch:14},{wch:18},{wch:16},{wch:13},{wch:30},{wch:40},{wch:10},{wch:10},{wch:10},{wch:14},{wch:14},{wch:16}];
  XLSX.utils.book_append_sheet(wb,ws,'Orders');
  XLSX.writeFile(wb,'CandyVerse-Orders-'+new Date().toISOString().slice(0,10)+'.xlsx');
  showToast('📊 Excel downloaded!','✅');
}

function saveWebhookUrl(){
  var url=document.getElementById('webhook-url').value.trim();
  if(url){ localStorage.setItem('cv_sheet_webhook',url); showToast('✅ Webhook saved!','📊'); document.getElementById('webhook-status').textContent='✅ Connected'; document.getElementById('webhook-status').style.color='#00875a'; }
  else   { localStorage.removeItem('cv_sheet_webhook'); showToast('Cleared','🗑'); document.getElementById('webhook-status').textContent='Not connected'; document.getElementById('webhook-status').style.color='#b34700'; }
}

function testWebhook(){
  var url=getSheetWebhook(); if(!url){alert('Set a webhook URL first!');return;}
  fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:'TEST',date:new Date().toLocaleString('en-IN'),customerName:'Test',phone:'9999999999',address:'Test',items:'Test x1',subtotal:99,delivery:0,total:99,paymentMethod:'UPI',paymentStatus:'Paid',orderStatus:'Order Placed',lastUpdated:new Date().toLocaleString('en-IN')})})
    .then(function(){showToast('✅ Test sent! Check your Sheet.','📊');})
    .catch(function(){showToast('⚠️ Could not reach URL','❌');});
}

// ── Styles ─────────────────────────────────────────────
var s=document.createElement('style');
s.textContent='@keyframes adminCardIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
document.head.appendChild(s);

// ── Init — listen for REAL-TIME changes from Firebase ──
window.addEventListener('DOMContentLoaded', function(){
  var savedUrl=getSheetWebhook();
  var urlInput=document.getElementById('webhook-url');
  var statusEl=document.getElementById('webhook-status');
  if(urlInput&&savedUrl) urlInput.value=savedUrl;
  if(statusEl){ if(savedUrl){statusEl.textContent='✅ Connected';statusEl.style.color='#00875a';}else{statusEl.textContent='Not connected';statusEl.style.color='#b34700';} }
  var searchEl=document.getElementById('admin-search');
  var filterEl=document.getElementById('admin-status-filter');
  if(searchEl) searchEl.addEventListener('input',applyFilters);
  if(filterEl) filterEl.addEventListener('change',applyFilters);

  // 🔥 Real-time listener — updates instantly when ANY device places an order
  cvListenOrders(function(orders){
    allOrders = orders;
    renderStats();
    applyFilters();
    updateCountdownBadge();
  });
});

// ── Auto-sync to Google Sheets every 10 seconds ────────
var autoSyncCountdown=10;
function updateCountdownBadge(){
  var badge=document.getElementById('auto-sync-badge'); if(!badge) return;
  var url=getSheetWebhook();
  if(!url){ badge.innerHTML='⏸ Auto-sync paused — no webhook set'; badge.style.color='#888'; badge.style.borderColor='rgba(180,180,180,.3)'; badge.style.background='rgba(180,180,180,.1)'; return; }
  badge.innerHTML='🔄 Auto-syncing to Sheets in <b>'+autoSyncCountdown+'s</b>';
  badge.style.color='#0055aa'; badge.style.borderColor='rgba(0,180,255,.35)'; badge.style.background='rgba(0,180,255,.1)';
}
setInterval(function(){
  autoSyncCountdown--;
  if(autoSyncCountdown<=0){
    autoSyncCountdown=10;
    var url=getSheetWebhook();
    if(url){
      allOrders.forEach(function(o){syncToSheets(o);});
      var badge=document.getElementById('auto-sync-badge');
      if(badge){ badge.innerHTML='✅ Synced! '+allOrders.length+' orders pushed'; badge.style.color='#00875a'; badge.style.borderColor='rgba(0,200,83,.4)'; badge.style.background='rgba(0,200,83,.12)'; setTimeout(updateCountdownBadge,2000); return; }
    }
  }
  updateCountdownBadge();
},1000);
updateCountdownBadge();
