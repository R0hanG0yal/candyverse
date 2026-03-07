// ═══════════════════════════════════════════════════════
//  CandyVerse — Node.js Server
//  Serves all static files from /public
//  Run: node server/server.js
//  Visit: http://localhost:3000
// ═══════════════════════════════════════════════════════

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers (for dev convenience)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ── Static Files ───────────────────────────────────────
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ── Routes ─────────────────────────────────────────────

// Home → landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🍭 CandyVerse server is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// API: List all pages (useful for debugging)
app.get('/api/pages', (req, res) => {
  const pages = [
    { name: 'Landing Page',   path: '/',                   file: 'index.html' },
    { name: 'Products',       path: '/products.html',      file: 'products.html' },
    { name: 'Cart',           path: '/cart.html',          file: 'cart.html' },
    { name: 'Checkout',       path: '/checkout.html',      file: 'checkout.html' },
    { name: 'Payment',        path: '/payment.html',       file: 'payment.html' },
    { name: 'Order Success',  path: '/order-success.html', file: 'order-success.html' },
    { name: 'My Orders',      path: '/orders.html',        file: 'orders.html' },
    { name: 'Admin Dashboard',path: '/admin-orders.html',  file: 'admin-orders.html' },
  ];
  res.json({ pages, total: pages.length });
});

// Catch-all: serve index.html for unknown routes (SPA fallback)
app.use((req, res) => {
  const requestedFile = path.join(publicPath, req.path);
  if (fs.existsSync(requestedFile) && fs.lstatSync(requestedFile).isFile()) {
    return res.sendFile(requestedFile);
  }
  res.status(404).sendFile(path.join(publicPath, 'index.html'));
});

// ── Keep-alive ping (prevents Render free tier from sleeping) ──
var https = require('https');
setInterval(function() {
  var host = process.env.RENDER_EXTERNAL_URL || 'https://candyverse.onrender.com';
  https.get(host + '/health', function(){}).on('error', function(){});
}, 14 * 60 * 1000); // ping every 14 minutes

// ── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🍭 ════════════════════════════════════════════════');
  console.log('   CandyVerse Server is LIVE!');
  console.log('══════════════════════════════════════════════════');
  console.log(`\n   🌐 http://localhost:${PORT}`);
  console.log(`   🛍  Shop:    http://localhost:${PORT}/products.html`);
  console.log(`   👑  Admin:   http://localhost:${PORT}/admin-orders.html`);
  console.log(`   💚  Health:  http://localhost:${PORT}/health`);
  console.log('\n   Press Ctrl+C to stop\n');
});

module.exports = app;
