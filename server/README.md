# Rawrenks Backend

Express 5 + MongoDB + JWT cookies + Cloudinary + Razorpay + Socket.IO.
Adapted from the Nandan Foods backend for a fashion catalog (size × color stock matrix).

## Quick start

```bash
cd server
cp .env.example .env        # then fill in real values in .env
npm install
npm run dev                  # nodemon, hot-reloads on file change
```

Server boots on `http://localhost:4000` (override with `PORT` in `.env`).

### Verify it boots
```
GET  /              → name/version/status
GET  /api/health    → uptime + db status + missing env vars
```

If `MONGODB_URI` is unset the server still boots but `/api/health` will report `db: "error"`. All routes that need DB will fail with a clear message.

## Phased build

| Phase | Scope | Status |
|---|---|---|
| 1 | Scaffold: folders, models, routers, env wiring, boot | ✅ |
| 2 | User auth + seller auth (register/OTP/login/forgot/reset) | stubs return 501 |
| 3 | Product CRUD + Cloudinary upload + seed script | stubs (list/byId already work) |
| 4 | Cart sync + address book + COD checkout | stubs |
| 5 | Razorpay create + verify | stubs |
| 6 | Seller dashboard stats | stubs |
| 7 (opt) | Socket.IO realtime stock | wired, no emits yet |

Stub responses look like:
```json
{ "success": false, "message": "Not implemented yet: registerUser — lands in Phase 2." }
```

## Folder layout

```
server/
├── server.js                # entry — Express + Socket.IO
├── package.json
├── .env                     # gitignored, your secrets
├── .env.example             # committed template
├── configs/
│   ├── db.js                # mongoose connect
│   ├── cloudinary.js
│   ├── nodemailer.js        # lazy SMTP transporter
│   ├── multer.js            # disk storage for image uploads
│   └── checkEnv.js          # boot-time env audit
├── middlewares/
│   ├── authUser.js          # JWT cookie → req.userId
│   ├── authSeller.js        # admin cookie → admin only
│   └── rateLimiter.js       # auth + OTP limiters
├── models/
│   ├── User.js              # email/pw/OTP + cartItems Map + wishlist
│   ├── Product.js           # size×color stock Map, reviews, tag, sold
│   ├── Order.js             # snapshot items, history, Razorpay fields
│   └── Address.js
├── routes/
│   ├── userRoute.js
│   ├── sellerRoute.js
│   ├── productRoute.js
│   ├── cartRoute.js
│   ├── addressRoute.js
│   └── orderRoute.js
└── controllers/
    ├── _stub.js             # 501 helper
    └── *Controller.js
```

## Data shape notes

- **Cart key** — `"<productId>|<size>|<color>"` → quantity. Matches the storefront's existing cart shape.
- **Stock matrix** — `Product.stock` is a `Map`, key `"<size>|<color>"` → qty. Matches `js/data.js`.
- **Categories** — enum `["Men", "Women", "Accessories"]` (Kids was removed).
- **Discount** — `discountPrice: 0` means no discount; effective price = `discountPrice || price`.
