// CandyVerse — Firebase Database Layer

var CV_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDeEQFAk83CK_Ucv_NqNlld-GhmV_86iAg",
  authDomain:        "candyverse-1c7d4.firebaseapp.com",
  databaseURL:       "https://candyverse-1c7d4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "candyverse-1c7d4",
  storageBucket:     "candyverse-1c7d4.firebasestorage.app",
  messagingSenderId: "952190410403",
  appId:             "1:952190410403:web:407bb553543263fb6c6916"
};

var CV_CONFIG_VALID = true; // config is filled in

var CV_DB_READY = false;
var CV_DB_REF   = null;

function cvInitFirebase() {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(CV_FIREBASE_CONFIG);
    }
    CV_DB_REF   = firebase.database().ref('orders');
    CV_DB_READY = true;
    console.log('🔥 Firebase connected!');
    var warn = document.getElementById('firebase-warn');
    if (warn) warn.style.display = 'none';
  } catch(e) {
    console.error('Firebase init error:', e);
    CV_DB_READY = false;
  }
}

function cvSaveOrder(order, callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.child(order.id).set(order)
      .then(function(){ if (callback) callback(null); })
      .catch(function(e){ if (callback) callback(e); });
  } else {
    var orders = JSON.parse(localStorage.getItem('cv_orders') || '[]');
    var idx = orders.findIndex(function(o){ return o.id === order.id; });
    if (idx >= 0) orders[idx] = order; else orders.unshift(order);
    localStorage.setItem('cv_orders', JSON.stringify(orders));
    if (callback) callback(null);
  }
}

function cvGetOrders(callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.orderByChild('timestamp').once('value', function(snap) {
      var orders = [];
      snap.forEach(function(child){ orders.push(child.val()); });
      orders.reverse();
      callback(orders);
    });
  } else {
    callback(JSON.parse(localStorage.getItem('cv_orders') || '[]'));
  }
}

function cvGetMyOrders(phone, callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.orderByChild('timestamp').once('value', function(snap) {
      var orders = [];
      snap.forEach(function(child){
        var o = child.val();
        if (o && o.customer && o.customer.phone === phone) orders.push(o);
      });
      orders.reverse();
      callback(orders);
    });
  } else {
    var all = JSON.parse(localStorage.getItem('cv_orders') || '[]');
    callback(all.filter(function(o){ return o.customer && o.customer.phone === phone; }));
  }
}

function cvGetOrder(orderId, callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.child(orderId).once('value', function(snap){ callback(snap.val()); });
  } else {
    var orders = JSON.parse(localStorage.getItem('cv_orders') || '[]');
    callback(orders.find(function(o){ return o.id === orderId; }) || null);
  }
}

function cvDeleteOrder(orderId, callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.child(orderId).remove().then(function(){ if(callback) callback(); });
  } else {
    var orders = JSON.parse(localStorage.getItem('cv_orders') || '[]');
    localStorage.setItem('cv_orders', JSON.stringify(orders.filter(function(o){ return o.id !== orderId; })));
    if (callback) callback();
  }
}

function cvClearAllOrders(callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.remove().then(function(){ if(callback) callback(); });
  } else {
    localStorage.removeItem('cv_orders');
    if (callback) callback();
  }
}

function cvListenOrders(callback) {
  if (CV_DB_READY && CV_DB_REF) {
    CV_DB_REF.on('value', function(snap) {
      var orders = [];
      snap.forEach(function(child){ orders.push(child.val()); });
      orders.reverse();
      callback(orders);
    });
  } else {
    callback(JSON.parse(localStorage.getItem('cv_orders') || '[]'));
    setInterval(function(){
      callback(JSON.parse(localStorage.getItem('cv_orders') || '[]'));
    }, 5000);
  }
}