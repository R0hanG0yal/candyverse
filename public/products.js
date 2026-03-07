// ═══════════════════════════════════════════════════════
//  CandyVerse — Products Page
// ═══════════════════════════════════════════════════════

const PRODUCTS = [
  {
    id: 'choco-truffle',
    name: 'Choco Dream Truffles',
    desc: 'Velvety dark chocolate ganache melts in your mouth like a dream',
    price: 149,
    img: 'images/choco.jpg',
    category: 'chocolate',
    badge: '🔥 Hot',
    stars: 5,
    emoji: '🍫',
  },
  {
    id: 'gummy-bears',
    name: 'Rainbow Gummy Bears',
    desc: 'Chewy fruity bears in 8 rainbow flavours — impossible to eat just one',
    price: 99,
    img: 'images/gummy.jpg',
    category: 'gummies',
    badge: '❤️ Fav',
    stars: 5,
    emoji: '🐻',
  },
  {
    id: 'strawberry-clouds',
    name: 'Strawberry Cloud Puffs',
    desc: 'Airy puffs bursting with real strawberry — like biting into a cloud',
    price: 119,
    img: 'images/strawberry.jpg',
    category: 'fruity',
    badge: null,
    stars: 4,
    emoji: '🍓',
  },
  {
    id: 'lollipop-mix',
    name: 'Galaxy Lollipop Mix',
    desc: 'Swirling cosmic lollipops in watermelon, blueberry & mango',
    price: 89,
    img: null,
    category: 'hard',
    badge: '🆕 New',
    stars: 4,
    emoji: '🍭',
  },
  {
    id: 'sour-worms',
    name: 'Sour Neon Worms',
    desc: 'Face-puckering sour worms with electric neon colours — danger level 10',
    price: 109,
    img: null,
    category: 'gummies',
    badge: null,
    stars: 5,
    emoji: '🐛',
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy Floss',
    desc: 'Spun sugar magic in pink bubblegum & blue raspberry flavours',
    price: 79,
    img: null,
    category: 'special',
    badge: '💖 Love',
    stars: 4,
    emoji: '☁️',
  },
  {
    id: 'jawbreakers',
    name: 'Mega Jawbreakers',
    desc: 'Layered hard candy spheres with 5 flavour surprises hidden inside',
    price: 59,
    img: null,
    category: 'hard',
    badge: null,
    stars: 4,
    emoji: '🌈',
  },
  {
    id: 'candy-buttons',
    name: 'Candy Dot Buttons',
    desc: 'Classic sugar dots on paper strips — nostalgia packed in every row',
    price: 49,
    img: null,
    category: 'special',
    badge: null,
    stars: 3,
    emoji: '🔴',
  },
  {
    id: 'mango-rings',
    name: 'Mango Fizz Rings',
    desc: 'Fizzy sugar-coated mango rings — the ultimate tropical candy hit',
    price: 129,
    img: null,
    category: 'fruity',
    badge: '🆕 New',
    stars: 5,
    emoji: '🥭',
  },
  {
    id: 'choco-pops',
    name: 'Choco Popping Rocks',
    desc: 'Milk chocolate infused with popping candy — explodes in your mouth',
    price: 159,
    img: null,
    category: 'chocolate',
    badge: '⚡ Pop',
    stars: 5,
    emoji: '💥',
  },
  {
    id: 'peach-rings',
    name: 'Fuzzy Peach Rings',
    desc: 'Soft sugary rings with a peachy-keen punch of summer flavour',
    price: 89,
    img: null,
    category: 'fruity',
    badge: null,
    stars: 4,
    emoji: '🍑',
  },
  {
    id: 'candy-canes',
    name: 'Mini Candy Canes',
    desc: 'Classic peppermint canes twisted with fruit stripes — holiday vibes',
    price: 69,
    img: null,
    category: 'hard',
    badge: null,
    stars: 4,
    emoji: '🎄',
  },
];

// ── Emoji gradient backgrounds for no-image cards ──────
const emojiGradients = [
  'linear-gradient(135deg,#FF6B9D,#FF3D7F)',
  'linear-gradient(135deg,#6BCFFF,#007acc)',
  'linear-gradient(135deg,#FFE66D,#ffa726)',
  'linear-gradient(135deg,#B06BFF,#7C3AED)',
  'linear-gradient(135deg,#6BFFB8,#00c853)',
  'linear-gradient(135deg,#FF9de2,#ff5599)',
];

// ── Cart helpers ───────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cv_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cv_cart', JSON.stringify(cart));
}
function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, emoji: product.emoji, qty: 1 });
  }
  saveCart(cart);
}
function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = getCartCount();
}

// ── Toast ──────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Stars HTML ─────────────────────────────────────────
function starsHTML(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// ── Render Products ────────────────────────────────────
function renderProducts(list) {
  const grid = document.getElementById('products-grid');
  if (!list.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;opacity:0.5;">
      <div style="font-size:4rem">🍬</div>
      <p style="font-family:'Fredoka One',cursive;font-size:1.5rem;margin-top:1rem">No candy found!</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map((p, idx) => {
    const bg = emojiGradients[idx % emojiGradients.length];
    const imgHTML = p.img
      ? `<img src="${p.img}" alt="${p.name}" loading="lazy" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bg};font-size:5rem;">${p.emoji}</div>`;

    const badgeHTML = p.badge
      ? `<span class="product-badge">${p.badge}</span>`
      : '';

    return `
      <div class="product-card" data-id="${p.id}" data-cat="${p.category}" style="animation: cardAppear 0.5s ease ${idx * 0.05}s both;">
        <div class="product-img-wrap">
          ${imgHTML}
          ${badgeHTML}
        </div>
        <div class="product-info">
          <div class="product-stars">${starsHTML(p.stars)}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-footer">
            <span class="product-price">₹${p.price}</span>
            <button class="add-cart-btn" data-id="${p.id}">+ Cart</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Card appear animation
  const style = document.createElement('style');
  style.textContent = `@keyframes cardAppear {
    from { opacity:0; transform:translateY(30px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }`;
  document.head.appendChild(style);

  // Bind add-to-cart buttons
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return;
      addToCart(p);
      updateCartBadge();
      btn.textContent = '✓ Added!';
      btn.classList.add('added');
      showToast(`🍭 ${p.name} added to cart!`);
      setTimeout(() => {
        btn.textContent = '+ Cart';
        btn.classList.remove('added');
      }, 1500);
    });
  });
}

// ── Filter & Search ────────────────────────────────────
let currentCat = 'all';
let currentSearch = '';

function applyFilters() {
  let list = PRODUCTS;
  if (currentCat !== 'all') list = list.filter(p => p.category === currentCat);
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  renderProducts(list);
}

document.getElementById('search-input').addEventListener('input', e => {
  currentSearch = e.target.value.trim();
  applyFilters();
});

document.getElementById('category-filters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCat = btn.dataset.cat;
  applyFilters();
});

// ── Floating BG Candies ────────────────────────────────
function createBgCandies() {
  const container = document.getElementById('bg-candies');
  const emojis = ['🍭','🍬','🍫','🧁','🍩','🍡','🌟','💖'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'floating-candy';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (10 + Math.random() * 15) + 's';
    el.style.animationDelay = (Math.random() * 10) + 's';
    el.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
    container.appendChild(el);
  }
}

// ── Init ───────────────────────────────────────────────
renderProducts(PRODUCTS);
updateCartBadge();
createBgCandies();
