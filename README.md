# 🍭 CandyVerse — Candy Snack E-Commerce

## Quick Start

```bash
cd CandyVerse-Full
npm install
npm start
# Visit http://localhost:3000
```

## Pages
| Page | URL |
|------|-----|
| Landing (3D Candy Hut) | `/` |
| Products | `/products.html` |
| Cart | `/cart.html` |
| Checkout | `/checkout.html` |
| Payment (UPI QR) | `/payment.html` |
| Order Success | `/order-success.html` |
| My Orders | `/orders.html` |
| Admin Dashboard | `/admin-orders.html` |

## Flow
Products → Cart → Checkout → Payment → Order Success

**Cart is only cleared after clicking "I Have Paid" on the payment page.**

## Storage
All data stored in browser `localStorage`:
- `cv_cart` — current cart
- `cv_checkout` — delivery details
- `cv_orders` — all orders
- `cv_last_order` — last completed order
