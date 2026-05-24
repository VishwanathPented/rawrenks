# Rawrenks — Deployment Guide & Cost Breakdown

This is a single-page app (HTML + CSS + vanilla JS) that uses `localStorage` as its
"database". You can ship it as-is for a free demo, or layer on a real backend
when you're ready for actual customers. This doc covers both paths and the real
running costs at each scale.

> Prices below are typical Indian-market list prices as of May 2026.
> Always check the provider's current pricing — they shift quarterly.

---

## TL;DR — Pick a tier

| Tier        | Use case                                | Monthly cost (INR)  |
|-------------|------------------------------------------|---------------------|
| **Free**    | Portfolio demo, no real orders           | ₹0 + domain (~₹100/mo amortized) |
| **MVP**     | First real customers, < 1,000 orders/mo  | ₹500 – ₹1,500       |
| **Growth**  | 1k – 20k orders/mo, light traffic spikes | ₹3,500 – ₹8,000     |
| **Scale**   | 50k+ orders/mo, regional traffic         | ₹15,000 – ₹60,000+  |

Plus **payment gateway fees** (~2% per transaction — not a fixed cost).

---

## Stage 1 — Deploy the current site (FREE)

Right now the app is 100% static. Drop it on any static host and it works
forever. Data lives in the visitor's browser only — fine for a portfolio,
not for selling.

### Option A — Vercel (recommended for static)
1. Push the folder to a GitHub repo.
2. Go to vercel.com → New Project → Import the repo.
3. Framework preset: **Other**. Build command: leave blank. Output dir: `.`
4. Deploy. You get `https://rawrenks.vercel.app` free.

### Option B — Netlify
1. netlify.com → "Add new site" → Drag-and-drop the `Rawrenks/` folder.
2. Free `rawrenks.netlify.app` instantly.

### Option C — GitHub Pages
1. Push to a repo.
2. Settings → Pages → Source: `main` branch, root.
3. Free at `username.github.io/rawrenks`.

### Option D — Cloudflare Pages
1. pages.cloudflare.com → Connect repo. Same as Vercel.
2. Free with great global CDN.

**Cost: ₹0/month.** All four have free TLS, global CDN, and unlimited bandwidth
for personal projects.

---

## Stage 2 — Add a real backend (MVP, ₹500–1,500/mo)

The current code calls `Store.*` functions that read/write `localStorage`. To
go live, you replace those functions with `fetch()` calls to a backend that
persists data in a real database. Everything else (UI, routing, components)
stays the same.

### What you need to add

| Concern             | Why                              | Recommended provider             |
|---------------------|-----------------------------------|----------------------------------|
| Database            | Products, orders, users           | **Supabase** (Postgres + Auth)   |
| Authentication      | Real signup/login                 | Supabase Auth (included)         |
| File storage        | Product images                    | Cloudflare R2 or Supabase Storage |
| Payments            | Take real money                   | **Razorpay** (India) / Stripe    |
| Transactional email | Order confirmations               | Resend or Brevo                  |
| Domain              | rawrenks.com instead of `.vercel.app` | Cloudflare Registrar or Namecheap |

### Cost breakdown (MVP)

| Item                    | Provider              | Cost (INR/mo) | Notes                                        |
|-------------------------|-----------------------|---------------|----------------------------------------------|
| Frontend hosting        | Vercel / Netlify free | ₹0            | Free until ~100GB bandwidth                  |
| Database + Auth         | Supabase Free         | ₹0            | 500MB DB, 50k auth users, 1GB storage        |
| Image storage           | Cloudflare R2 free    | ₹0            | 10GB free, no egress fees                    |
| Domain                  | Cloudflare Registrar  | ₹90–125/mo    | ₹1,100/yr for .com at cost; .in ~₹600/yr     |
| Email (transactional)   | Resend Free           | ₹0            | 3k emails/mo, 100/day                        |
| Payment gateway         | Razorpay              | 2% per txn    | No fixed cost — pay-per-transaction          |
| Monitoring              | Sentry Free           | ₹0            | 5k errors/mo                                 |
| Backups                 | Supabase Free         | ₹0            | Daily, 7-day retention                       |
| **Total fixed**         |                       | **~₹100/mo**  | Just the domain. Everything else is free.    |

**Reality check:** the free tiers carry you through your first ~1,000 monthly
orders. The day you cross Supabase's free DB limits or Vercel's bandwidth, you
upgrade just that one component — not the whole stack.

---

## Stage 3 — Growth (₹3,500–8,000/mo)

You've got real traffic. Free tiers start throttling. Time to pay.

| Item                      | Provider         | Plan                | Cost (INR/mo)   |
|---------------------------|------------------|---------------------|-----------------|
| Frontend                  | Vercel Pro       | $20/mo              | ~₹1,700         |
| Database + Auth + Storage | Supabase Pro     | $25/mo              | ~₹2,100         |
| Domain                    | Cloudflare       | per year            | ~₹100           |
| Email                     | Resend           | $20/mo for 50k      | ~₹1,700         |
| CDN for images            | Cloudflare R2    | $0.015/GB stored    | ~₹100–400       |
| Monitoring                | Sentry Team      | $26/mo              | ~₹2,200         |
| **Total fixed**           |                  |                     | **~₹6,000–8,000** |

Plus the variable cost: payment-gateway fees at ~2% of revenue.

### Cheaper alternative for this tier
- Database: **Neon** (serverless Postgres) — free tier scales further than Supabase
- Hosting: **Cloudflare Pages** — Pro is $5/mo, very generous limits
- Email: **Brevo** — 300 emails/day free, then ₹2,000/mo for 20k

This combo brings the fixed monthly down to ~₹3,500.

---

## Stage 4 — Scale (₹15,000–60,000+/mo)

50k+ orders/month, regional or national traffic, search/recommendations
infrastructure, multiple admins, dedicated support.

| Item                       | Provider                    | Cost (INR/mo)        |
|----------------------------|-----------------------------|----------------------|
| Frontend + edge functions  | Vercel Enterprise / AWS     | ₹8,000–25,000        |
| Database                   | AWS RDS Postgres (db.t3.medium) or PlanetScale Scaler | ₹6,000–18,000 |
| Object storage + CDN       | AWS S3 + CloudFront         | ₹2,000–8,000         |
| Search                     | Algolia (10k records, 100k searches) | ₹5,000     |
| Email                      | AWS SES (1M emails ≈ ₹85) + Resend Pro | ₹1,500    |
| Monitoring + APM           | Sentry Business + Datadog basic | ₹6,000–12,000   |
| Caching / queue            | Upstash Redis Pay-as-go     | ₹500–2,500           |
| Domain + DNS               | Cloudflare                  | ₹100                 |
| **Total fixed**            |                             | **~₹29,000–72,000**  |

At this stage you should also budget for:
- A part-time DevOps engineer or ops contractor (₹15,000–40,000/mo)
- A staging environment (~2× your prod database cost)
- DDoS protection (Cloudflare Pro/Business: ₹1,700/mo or ₹17,000/mo)

---

## Component-by-component pricing reference

### Domains
| TLD     | First-year (typical)  | Renewal   | Where to buy            |
|---------|-----------------------|-----------|-------------------------|
| `.com`  | ₹900–1,200/yr         | ₹1,200–1,500/yr | Cloudflare (at cost), Namecheap, Porkbun |
| `.in`   | ₹600–800/yr           | ₹700–900/yr | BigRock, Namecheap     |
| `.store`| ₹150 first yr (often promo) | ₹3,500/yr+ | Namecheap, GoDaddy   |
| `.shop` | ₹250 first yr promo   | ₹3,000/yr+ | Namecheap              |

**Recommendation:** buy from **Cloudflare Registrar** (no markup, no upsell)
or **Porkbun** (cheap renewals). Avoid GoDaddy and Hostinger — their renewals
are 2–3× higher.

### Database options

| Provider       | Free tier              | Paid entry  | Notes                                   |
|----------------|------------------------|-------------|-----------------------------------------|
| **Supabase**   | 500MB DB, 50k MAU      | $25/mo      | Postgres + Auth + Storage all in one. Easiest. |
| **Neon**       | 0.5GB, autoscale       | $19/mo      | Serverless Postgres, branchable DBs.   |
| **PlanetScale**| ❌ (paid-only since 2024) | $39/mo    | MySQL, great branching. Pricey.        |
| **Railway**    | $5 starter credit/mo   | ~$10–30/mo  | Postgres + app server in one place.    |
| **Firebase**   | Generous free          | Pay-as-go   | NoSQL — would need rewrite for this app.|
| **AWS RDS**    | 750hr/mo free for 12mo | ₹2,500+/mo  | Standard, scales, but you manage it.   |

### Hosting (frontend)
| Provider          | Free        | Paid entry   | Best for                                |
|-------------------|-------------|--------------|-----------------------------------------|
| **Vercel**        | Hobby free  | $20/mo Pro   | Easiest deploy + great DX               |
| **Netlify**       | 100GB free  | $19/mo Pro   | Forms + simple webhooks built in        |
| **Cloudflare Pages** | Free, generous | $5/mo Pro | Cheapest at scale, global CDN          |
| **GitHub Pages**  | Free        | —            | Portfolio only — no custom backend      |
| **AWS S3 + CloudFront** | $0.5/mo storage + bandwidth | ~₹200–2,000+/mo | Most control. More setup work. |

### Image / file storage
| Provider             | Storage cost      | Egress cost          |
|----------------------|-------------------|----------------------|
| **Cloudflare R2**    | $0.015/GB/mo      | **$0** (huge win)    |
| **AWS S3**           | $0.023/GB/mo      | $0.09/GB out         |
| **Supabase Storage** | $0.021/GB/mo      | $0.09/GB out         |
| **Backblaze B2**     | $0.005/GB/mo      | $0.01/GB out         |

For an image-heavy clothing store, **R2** wins — no egress means you don't pay
extra when customers browse galleries.

### Payment gateways (India)
| Provider     | Fee (cards/UPI)         | Fixed?      | Notes                            |
|--------------|-------------------------|-------------|----------------------------------|
| **Razorpay** | 2% per txn              | No setup fee| Industry standard in India       |
| **Cashfree** | 1.75% per txn           | No setup fee| Slightly cheaper                 |
| **PayU**     | 2% per txn              | No setup fee| Enterprise-friendly              |
| **Stripe**   | 2.9% + ₹2 per txn (intl) | No setup fee| Great for international         |

UPI-only transactions can often be priced lower (~0.4–0.9% or flat ₹2).
Negotiate the rate once you cross ~₹10L/mo in processing volume.

### Email
| Provider | Free tier        | Paid entry         |
|----------|------------------|--------------------|
| Resend   | 3k/mo, 100/day   | $20/mo for 50k     |
| Brevo    | 300/day forever  | ₹2,000/mo for 20k  |
| AWS SES  | 62k/mo from EC2  | $0.10 per 1k       |
| Mailgun  | 100/day for 3mo  | $35/mo             |

### Monitoring & analytics
| Tool             | Free          | Paid entry  | What it does                  |
|------------------|---------------|-------------|-------------------------------|
| **Sentry**       | 5k errors/mo  | $26/mo      | Error tracking                |
| **Plausible**    | —             | $9/mo       | Privacy-friendly analytics    |
| **PostHog**      | 1M events/mo  | $0–scale    | Product analytics + funnels   |
| **Cloudflare Web Analytics** | Free | Free      | Page views, no PII            |
| **UptimeRobot**  | 50 monitors   | $7/mo       | Uptime alerts                 |

---

## Migration path: localStorage → real backend

The current code is structured so this is a 1-day swap, not a rewrite.

### Files that need to change
- [js/store.js](js/store.js) — every function that mutates `db` becomes a `fetch()` call to your API.
- [js/data.js](js/data.js) — keep for local dev; in prod, seed via SQL migration.
- [js/auth.js](js/auth.js) — replace the in-memory check with Supabase Auth SDK calls.

### Suggested backend stack (matches Stage 2 above)
```
Frontend (Vercel)
   ↓ HTTPS
Supabase
 ├── Postgres ──── products, orders, users, coupons, banners, reviews
 ├── Auth ──────── replaces Auth.bindLogin / bindSignup
 ├── Storage ───── product images (or use R2)
 └── Edge Funcs ── webhooks (Razorpay, order status)

Razorpay Checkout (client-side)
   ↓ webhook
Supabase Edge Function → updates order.status = "Order Placed"
```

### Indexes to add on day 1 (Postgres)
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tag      ON products(tag);
CREATE INDEX idx_orders_user       ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status     ON orders(status);
```

---

## Recommended starting setup

If you want the fastest path from "demo on disk" to "selling online":

1. **Domain** — Cloudflare Registrar, `.com` or `.in` (~₹100/mo)
2. **Frontend** — Vercel free tier
3. **Backend** — Supabase free tier (Postgres + Auth + Storage)
4. **Payments** — Razorpay (no setup cost, 2% per txn)
5. **Email** — Resend free tier
6. **Images** — Cloudflare R2 free tier
7. **Monitoring** — Sentry free + Cloudflare Web Analytics

**Total fixed monthly: ~₹100** until you outgrow free tiers. You only start
paying real money around 1,000 orders/month — by which point the business is
generating revenue to cover it.

---

## Things people forget to budget

- **GST registration** — required in India once turnover crosses ₹40L (₹20L
  for services). Filing costs ~₹1,000/mo via a CA.
- **Shipping partner** — Delhivery / Shiprocket / Bluedart. Pay-per-shipment,
  not monthly. Shiprocket has a free dashboard but tacks ~₹15/shipment as platform fees.
- **Returns** — set aside 5–10% of revenue as a returns/refund reserve.
- **Photography** — product photos are not free. Either DIY (camera + light kit
  ~₹15,000 once) or hire (~₹500–2,000 per product).
- **Customer support** — Tidio/Crisp free tiers help; expect ~₹1,000/mo when
  you cross 100 conversations/month.
- **Legal pages** — Terms, Privacy, Refund Policy. Templates are fine to start,
  but a lawyer review costs ₹5,000–15,000 one-time.

---

## Quick-deploy commands (Vercel example)

```bash
# 1. Create a git repo
cd /Users/vishwanathpented/Desktop/Rawrenks
git init
git add .
git commit -m "Initial Rawrenks storefront"

# 2. Push to GitHub (create empty repo at github.com first)
git remote add origin git@github.com:YOUR-USERNAME/rawrenks.git
git push -u origin main

# 3. Install Vercel CLI and deploy
npm i -g vercel
vercel              # follow prompts, accepts defaults for static site
vercel --prod       # deploy to production URL
```

No build step needed — Vercel serves the static files directly.

---

That's everything. Start free, swap components only as you outgrow them.
