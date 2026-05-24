/* Storefront views */
(function () {
  const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
  const escape = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[m]));

  function productCardHTML(p) {
    const eff = Store.effectivePrice(p);
    const onSale = p.discountPrice > 0;
    const pct = onSale ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
    const isNew = (Date.now() - new Date(p.createdAt).getTime()) < 86400000 * 18;
    const wished = Store.inWishlist(p.id);
    return `
      <a class="product-card" href="#/product/${p.id}">
        <div class="thumb">
          <img src="${p.images[0]}" alt="${escape(p.name)}" loading="lazy"/>
          ${onSale ? `<span class="badge sale">-${pct}%</span>` : (isNew ? `<span class="badge new">New</span>` : "")}
          <button class="wish-btn ${wished ? "on" : ""}" onclick="event.preventDefault(); event.stopPropagation(); App.toggleWish('${p.id}')">♥</button>
        </div>
        <div class="info">
          <div class="brand-line">${escape(p.brand)}</div>
          <div class="name">${escape(p.name)}</div>
          <div class="price-line">
            <span class="price">${fmt(eff)}</span>
            ${onSale ? `<span class="strike">${fmt(p.price)}</span><span class="pct">-${pct}%</span>` : ""}
          </div>
        </div>
      </a>
    `;
  }

  function homeView() {
    const banners = Store.snapshot().banners.filter(b => b.active);
    const banner = banners[0] || Store.snapshot().banners[0];
    const all = Store.products();
    const featured = all.filter(p => p.tag === "Summer Collection").slice(0, 8);
    const arrivals = all.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
    const trending = all.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 8);
    const bestSellers = all.filter(p => p.tag === "Best Sellers");
    const limited = all.filter(p => p.tag === "Limited Edition");
    const discounted = all.filter(p => p.discountPrice > 0).sort((a, b) => (b.price - b.discountPrice) - (a.price - a.discountPrice)).slice(0, 8);

    const renderSection = (title, items, sub) => items.length ? `
      <section class="section">
        <div class="section-head">
          <div>
            <h2>${escape(title)}</h2>
            ${sub ? `<div class="muted">${escape(sub)}</div>` : ""}
          </div>
          <a href="#/shop" class="more muted">View all →</a>
        </div>
        <div class="products-grid">${items.map(productCardHTML).join("")}</div>
      </section>
    ` : "";

    return `
      <section class="hero">
        <img src="${banner.image}" alt=""/>
        <div class="hero-text">
          <div class="eyebrow">the new drop ✦ summer '26</div>
          <h1>${escape(banner.title)}</h1>
          <p>${escape(banner.sub)}</p>
          <a class="btn-primary" href="${banner.link}">${escape(banner.cta)}</a>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>shop by vibe</h2></div>
        <div class="cat-grid">
          <a class="cat-tile" href="#/shop/Men"><img src="https://picsum.photos/id/1027/600/400"/><span>men</span></a>
          <a class="cat-tile" href="#/shop/Women"><img src="https://picsum.photos/id/1014/600/400"/><span>women</span></a>
          <a class="cat-tile" href="#/shop/Kids"><img src="https://picsum.photos/id/1043/600/400"/><span>kids</span></a>
          <a class="cat-tile" href="#/shop/Accessories"><img src="https://picsum.photos/id/1060/600/400"/><span>accessories</span></a>
        </div>
      </section>

      ${renderSection("Summer Collection", featured, "linen szn — soft tones, no rush")}
      ${renderSection("Just Dropped", arrivals, "fresh from the studio this week")}
      ${renderSection("Trending", trending, "what everyone's wearing rn")}
      ${renderSection("Best Sellers", bestSellers, "the ones we can't keep in stock")}
      ${renderSection("Limited Edition", limited, "no restocks — when it's gone, it's gone")}
      ${renderSection("On Sale", discounted, "main-character pieces, marked down")}
    `;
  }

  /* ---------- LISTING ---------- */
  function listingView(params) {
    const q = new URLSearchParams(location.hash.split("?")[1] || "");
    const category = params?.category || q.get("category") || "";
    const tag = q.get("tag") || "";
    const search = q.get("q") || "";

    let products = Store.products().slice();
    if (category) products = products.filter(p => p.category === category);
    if (tag) products = products.filter(p => p.tag === tag);
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.tag || "").toLowerCase().includes(s)
      );
    }

    const filterState = window.__listingFilter || (window.__listingFilter = {
      sizes: new Set(), colors: new Set(), brands: new Set(), categories: new Set(),
      min: 0, max: 0, sort: "popular"
    });
    if (params?.resetFilters) {
      filterState.sizes.clear(); filterState.colors.clear(); filterState.brands.clear();
      filterState.categories.clear(); filterState.min = 0; filterState.max = 0; filterState.sort = "popular";
    }

    let filtered = products.slice();
    if (filterState.sizes.size) filtered = filtered.filter(p => p.sizes.some(s => filterState.sizes.has(s)));
    if (filterState.colors.size) filtered = filtered.filter(p => p.colors.some(c => filterState.colors.has(c)));
    if (filterState.brands.size) filtered = filtered.filter(p => filterState.brands.has(p.brand));
    if (filterState.categories.size && !category) filtered = filtered.filter(p => filterState.categories.has(p.category));
    if (filterState.min) filtered = filtered.filter(p => Store.effectivePrice(p) >= Number(filterState.min));
    if (filterState.max) filtered = filtered.filter(p => Store.effectivePrice(p) <= Number(filterState.max));

    if (filterState.sort === "low") filtered.sort((a, b) => Store.effectivePrice(a) - Store.effectivePrice(b));
    if (filterState.sort === "high") filtered.sort((a, b) => Store.effectivePrice(b) - Store.effectivePrice(a));
    if (filterState.sort === "new") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filterState.sort === "popular") filtered.sort((a, b) => (b.sold || 0) - (a.sold || 0));

    const allSizes = Array.from(new Set(products.flatMap(p => p.sizes)));
    const allColors = Array.from(new Set(products.flatMap(p => p.colors)));
    const allBrands = Array.from(new Set(products.flatMap(p => [p.brand])));
    const colorHex = window.RawDB.COLORS;

    const crumb = category ? `Home / ${escape(category)}` : (tag ? `Home / ${escape(tag)}` : (search ? `Search results for "${escape(search)}"` : "Home / Shop"));
    const title = category || tag || (search ? `Results for "${search}"` : "All Products");

    return `
      <div class="listing-head">
        <div>
          <div class="crumb">${crumb}</div>
          <h2 style="margin:6px 0 0">${escape(title)}</h2>
        </div>
        <div class="flex">
          <span class="muted small">${filtered.length} product${filtered.length === 1 ? "" : "s"}</span>
          <select id="sortSelect">
            <option value="popular" ${filterState.sort === "popular" ? "selected" : ""}>Sort: Popularity</option>
            <option value="new" ${filterState.sort === "new" ? "selected" : ""}>Sort: Newest</option>
            <option value="low" ${filterState.sort === "low" ? "selected" : ""}>Price: Low → High</option>
            <option value="high" ${filterState.sort === "high" ? "selected" : ""}>Price: High → Low</option>
          </select>
        </div>
      </div>

      <div class="listing-layout">
        <aside class="filters">
          <div class="filter-group">
            <h4>Category</h4>
            <div class="chip-row">
              ${window.RawDB.CATEGORIES.map(c => `<span class="chip ${filterState.categories.has(c) ? "on" : ""}" data-cat="${c}">${c}</span>`).join("")}
            </div>
          </div>
          <div class="filter-group">
            <h4>Size</h4>
            <div class="chip-row">
              ${allSizes.map(s => `<span class="chip ${filterState.sizes.has(s) ? "on" : ""}" data-size="${s}">${s}</span>`).join("")}
            </div>
          </div>
          <div class="filter-group">
            <h4>Color</h4>
            <div class="chip-row">
              ${allColors.map(c => {
                const hex = (colorHex.find(x => x.name === c) || {}).hex || "#ccc";
                return `<span class="swatch ${filterState.colors.has(c) ? "on" : ""}" data-color="${c}" style="background:${hex}" title="${c}"></span>`;
              }).join("")}
            </div>
          </div>
          <div class="filter-group">
            <h4>Brand</h4>
            <div class="chip-row">
              ${allBrands.map(b => `<span class="chip ${filterState.brands.has(b) ? "on" : ""}" data-brand="${b}">${b}</span>`).join("")}
            </div>
          </div>
          <div class="filter-group">
            <h4>Price (₹)</h4>
            <div class="range-row">
              <input id="priceMin" type="number" placeholder="Min" value="${filterState.min || ""}"/>
              <input id="priceMax" type="number" placeholder="Max" value="${filterState.max || ""}"/>
            </div>
          </div>
          <button class="btn-ghost" id="clearFilters" style="margin-top:10px;width:100%">Clear filters</button>
        </aside>
        <div>
          ${filtered.length === 0
            ? `<div class="empty-state"><h3>No products match your filters</h3><p>Try clearing filters or browsing all products.</p></div>`
            : `<div class="products-grid">${filtered.map(productCardHTML).join("")}</div>`}
        </div>
      </div>
    `;
  }

  function bindListing() {
    const fs = window.__listingFilter;
    if (!fs) return;
    document.querySelectorAll(".chip[data-size]").forEach(el =>
      el.onclick = () => { fs.sizes.has(el.dataset.size) ? fs.sizes.delete(el.dataset.size) : fs.sizes.add(el.dataset.size); App.rerender(); }
    );
    document.querySelectorAll(".chip[data-brand]").forEach(el =>
      el.onclick = () => { fs.brands.has(el.dataset.brand) ? fs.brands.delete(el.dataset.brand) : fs.brands.add(el.dataset.brand); App.rerender(); }
    );
    document.querySelectorAll(".chip[data-cat]").forEach(el =>
      el.onclick = () => { fs.categories.has(el.dataset.cat) ? fs.categories.delete(el.dataset.cat) : fs.categories.add(el.dataset.cat); App.rerender(); }
    );
    document.querySelectorAll(".swatch[data-color]").forEach(el =>
      el.onclick = () => { fs.colors.has(el.dataset.color) ? fs.colors.delete(el.dataset.color) : fs.colors.add(el.dataset.color); App.rerender(); }
    );
    const sortSel = document.getElementById("sortSelect");
    if (sortSel) sortSel.onchange = () => { fs.sort = sortSel.value; App.rerender(); };
    const minI = document.getElementById("priceMin");
    const maxI = document.getElementById("priceMax");
    if (minI) minI.onchange = () => { fs.min = Number(minI.value) || 0; App.rerender(); };
    if (maxI) maxI.onchange = () => { fs.max = Number(maxI.value) || 0; App.rerender(); };
    const clr = document.getElementById("clearFilters");
    if (clr) clr.onclick = () => { fs.sizes.clear(); fs.colors.clear(); fs.brands.clear(); fs.categories.clear(); fs.min = 0; fs.max = 0; App.rerender(); };
  }

  /* ---------- PRODUCT DETAIL ---------- */
  function detailView(params) {
    const p = Store.getProduct(params.id);
    if (!p) return `<div class="empty-state"><h3>Product not found</h3></div>`;
    Store.trackProductView(p.id);

    const state = window.__pdpState = window.__pdpState && window.__pdpState.id === p.id ? window.__pdpState : {
      id: p.id, size: p.sizes[0], color: p.colors[0], qty: 1, imageIdx: 0
    };

    const colorHex = window.RawDB.COLORS;
    const eff = Store.effectivePrice(p);
    const onSale = p.discountPrice > 0;
    const pct = onSale ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
    const key = state.size + "|" + state.color;
    const stock = p.stock[key] || 0;
    const approved = (p.reviews || []).filter(r => r.approved);
    const avg = approved.length ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1) : "—";
    const stars = n => "★★★★★☆☆☆☆☆".slice(5 - Math.round(n), 10 - Math.round(n));
    const inWish = Store.inWishlist(p.id);

    const related = Store.products().filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);

    return `
      <div class="pdp">
        <div class="pdp-gallery">
          <div class="pdp-thumbs">
            ${p.images.map((img, i) => `<div class="pdp-thumb ${i === state.imageIdx ? "on" : ""}" data-idx="${i}"><img src="${img}"/></div>`).join("")}
          </div>
          <div class="pdp-main-img"><img src="${p.images[state.imageIdx]}" alt="${escape(p.name)}"/></div>
        </div>
        <div class="pdp-info">
          <div class="pdp-brand">${escape(p.brand)}</div>
          <h1>${escape(p.name)}</h1>
          <div class="stars">${stars(Number(avg) || 0)} <span class="muted small">${avg} (${approved.length} reviews)</span></div>
          <div class="pdp-price-row">
            <span class="pdp-price">${fmt(eff)}</span>
            ${onSale ? `<span class="pdp-strike">${fmt(p.price)}</span><span class="pdp-pct">-${pct}% OFF</span>` : ""}
          </div>
          <p class="muted">${escape(p.description)}</p>

          <div class="pdp-section">
            <h4>Color · <span style="text-transform:none;letter-spacing:0">${escape(state.color)}</span></h4>
            <div class="color-pick">
              ${p.colors.map(c => {
                const hex = (colorHex.find(x => x.name === c) || {}).hex || "#ccc";
                return `<div class="swatch ${c === state.color ? "on" : ""}" data-color="${c}" style="background:${hex}" title="${c}"></div>`;
              }).join("")}
            </div>
          </div>

          <div class="pdp-section">
            <h4>Size</h4>
            <div class="size-pick">
              ${p.sizes.map(s => `<span class="chip ${s === state.size ? "on" : ""}" data-size="${s}">${s}</span>`).join("")}
            </div>
          </div>

          <div class="pdp-section">
            <h4>Quantity</h4>
            <div class="qty-row">
              <button id="qtyDown">−</button>
              <input id="qtyInput" type="number" min="1" max="${Math.max(stock, 1)}" value="${state.qty}"/>
              <button id="qtyUp">+</button>
              <span class="stock-line ${stock > 0 ? "in" : "out"}" style="margin-left:14px">
                ${stock > 0 ? `${stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          <div class="pdp-actions">
            <button class="btn-primary" id="addToCart" ${stock === 0 ? "disabled" : ""}>Add to Cart</button>
            <button class="btn-secondary" id="wishToggle">${inWish ? "♥ Saved" : "♡ Wishlist"}</button>
          </div>

          <div class="pdp-section">
            <h4>Customer Reviews</h4>
            ${approved.length === 0 ? `<p class="muted small">No reviews yet.</p>` : approved.map(r => `
              <div class="review">
                <div class="review-head">
                  <div>
                    <div class="review-author">${escape(r.author)}</div>
                    <div class="stars">${stars(r.rating)}</div>
                  </div>
                  <div class="review-date">${new Date(r.date).toLocaleDateString()}</div>
                </div>
                <p style="margin:6px 0 0">${escape(r.text)}</p>
              </div>
            `).join("")}
            <button class="btn-ghost" id="writeReview" style="margin-top:12px">Write a review</button>
          </div>
        </div>
      </div>

      ${related.length ? `
        <section class="section">
          <div class="section-head"><h2>You may also like</h2></div>
          <div class="products-grid">${related.map(productCardHTML).join("")}</div>
        </section>
      ` : ""}
    `;
  }

  function bindDetail() {
    const state = window.__pdpState;
    if (!state) return;
    document.querySelectorAll(".pdp-thumb").forEach(el =>
      el.onclick = () => { state.imageIdx = Number(el.dataset.idx); App.rerender(); }
    );
    document.querySelectorAll(".swatch[data-color]").forEach(el =>
      el.onclick = () => { state.color = el.dataset.color; App.rerender(); }
    );
    document.querySelectorAll(".chip[data-size]").forEach(el =>
      el.onclick = () => { state.size = el.dataset.size; App.rerender(); }
    );
    const qIn = document.getElementById("qtyInput");
    const qUp = document.getElementById("qtyUp");
    const qDn = document.getElementById("qtyDown");
    if (qIn) qIn.onchange = () => { state.qty = Math.max(1, Number(qIn.value) || 1); };
    if (qUp) qUp.onclick = () => { state.qty++; document.getElementById("qtyInput").value = state.qty; };
    if (qDn) qDn.onclick = () => { state.qty = Math.max(1, state.qty - 1); document.getElementById("qtyInput").value = state.qty; };
    const add = document.getElementById("addToCart");
    if (add) add.onclick = () => {
      Store.addToCart(state.id, state.size, state.color, state.qty);
      App.toast("Added to cart");
      App.updateHeader();
    };
    const wish = document.getElementById("wishToggle");
    if (wish) wish.onclick = () => {
      Store.toggleWishlist(state.id);
      App.toast(Store.inWishlist(state.id) ? "Saved to wishlist" : "Removed from wishlist");
      App.rerender();
    };
    const wr = document.getElementById("writeReview");
    if (wr) wr.onclick = () => openReviewModal(state.id);
  }

  function openReviewModal(productId) {
    App.modal(`
      <h4>Write a review</h4>
      <form id="reviewForm" class="form-grid" style="margin-top:10px">
        <div class="full">
          <label>Your name</label>
          <input name="author" required value="${Store.currentUser() ? escape(Store.currentUser().name) : ""}"/>
        </div>
        <div class="full">
          <label>Rating (1-5)</label>
          <input name="rating" type="number" min="1" max="5" value="5" required/>
        </div>
        <div class="full">
          <label>Comment</label>
          <textarea name="text" required></textarea>
        </div>
        <div class="full" style="text-align:right">
          <button type="submit" class="btn-primary">Submit review</button>
        </div>
      </form>
    `);
    document.getElementById("reviewForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.addReview(productId, {
        author: fd.get("author"),
        rating: Number(fd.get("rating")),
        text: fd.get("text")
      });
      App.closeModal();
      App.toast("Review submitted — pending approval");
    };
  }

  /* ---------- CART ---------- */
  function cartView() {
    const cart = Store.getCart();
    if (!cart.length) {
      return `<div class="empty-state"><h3>Your cart is empty</h3><p>Looks like you haven't added anything yet.</p><a class="btn-primary" href="#/shop">Start shopping</a></div>`;
    }
    const items = cart.map(i => {
      const p = Store.getProduct(i.productId);
      return { ...i, product: p };
    }).filter(i => i.product);

    const subtotal = items.reduce((s, i) => s + Store.effectivePrice(i.product) * i.qty, 0);
    const coupon = window.__appliedCoupon;
    const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
    const shipping = subtotal > 1999 ? 0 : 99;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + shipping + tax;

    return `
      <h2 style="margin-bottom:18px">Shopping Cart</h2>
      <div class="cart-layout">
        <div class="cart-list">
          ${items.map(i => `
            <div class="cart-row">
              <img src="${i.product.images[0]}"/>
              <div>
                <div style="font-weight:600">${escape(i.product.name)}</div>
                <div class="muted small">${escape(i.product.brand)} · ${escape(i.size)} · ${escape(i.color)}</div>
              </div>
              <div class="qty-row">
                <button onclick="App.cartQty('${i.productId}','${i.size}','${i.color}', -1)">−</button>
                <input value="${i.qty}" style="width:48px" onchange="App.cartSetQty('${i.productId}','${i.size}','${i.color}', this.value)"/>
                <button onclick="App.cartQty('${i.productId}','${i.size}','${i.color}', 1)">+</button>
              </div>
              <div style="font-weight:700;text-align:right;min-width:90px">${fmt(Store.effectivePrice(i.product) * i.qty)}</div>
              <button class="btn-ghost" onclick="App.cartRemove('${i.productId}','${i.size}','${i.color}')">Remove</button>
            </div>
          `).join("")}
        </div>
        <div class="cart-summary">
          <h4 style="margin:0 0 14px">Order Summary</h4>
          <div class="sum-line"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
          ${coupon ? `<div class="sum-line"><span>Coupon (${coupon.code})</span><span style="color:var(--ok)">−${fmt(discount)}</span></div>` : ""}
          <div class="sum-line"><span>Shipping</span><span>${shipping === 0 ? "FREE" : fmt(shipping)}</span></div>
          <div class="sum-line"><span>Tax (5%)</span><span>${fmt(tax)}</span></div>
          <div class="sum-line total"><span>Total</span><span>${fmt(total)}</span></div>
          <div style="margin:14px 0">
            <div class="flex" style="gap:6px">
              <input id="couponInput" placeholder="Coupon code" value="${coupon ? coupon.code : ""}" style="flex:1;padding:10px;border:1px solid var(--line);border-radius:8px"/>
              <button class="btn-ghost" id="applyCoupon">Apply</button>
            </div>
            <p class="muted small" style="margin:8px 0 0">Try SUMMER20, FESTIVE50, FIRST10</p>
          </div>
          <a class="btn-primary btn-block" href="#/checkout" style="text-align:center;text-decoration:none">Proceed to Checkout</a>
        </div>
      </div>
    `;
  }

  function bindCart() {
    const btn = document.getElementById("applyCoupon");
    if (btn) btn.onclick = () => {
      const code = document.getElementById("couponInput").value.trim();
      if (!code) { window.__appliedCoupon = null; App.rerender(); return; }
      const c = Store.findCoupon(code);
      if (!c) return App.toast("Invalid coupon code", "err");
      if (c.expires && new Date(c.expires) < new Date()) return App.toast("Coupon expired", "err");
      window.__appliedCoupon = c;
      App.toast(`${c.code} applied — ${c.percent}% off`);
      App.rerender();
    };
  }

  /* ---------- CHECKOUT ---------- */
  function checkoutView() {
    const cart = Store.getCart();
    if (!cart.length) { location.hash = "#/cart"; return ""; }
    const user = Store.currentUser();
    if (!user) {
      return `<div class="empty-state"><h3>Please log in to continue</h3><a class="btn-primary" href="#/login">Login</a></div>`;
    }
    const items = cart.map(i => ({ ...i, product: Store.getProduct(i.productId) })).filter(i => i.product);
    const subtotal = items.reduce((s, i) => s + Store.effectivePrice(i.product) * i.qty, 0);
    const coupon = window.__appliedCoupon;
    const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
    const shipping = subtotal > 1999 ? 0 : 99;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = subtotal - discount + shipping + tax;
    const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];

    return `
      <h2 style="margin-bottom:18px">Checkout</h2>
      <div class="cart-layout">
        <div>
          <div class="dash-main" style="margin-bottom:18px">
            <h4 style="margin:0 0 12px">Shipping Address</h4>
            ${user.addresses.length ? `
              <div style="margin-bottom:14px">
                ${user.addresses.map(a => `
                  <label class="flex" style="border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer">
                    <input type="radio" name="addr" value="${a.id}" ${a.id === defAddr.id ? "checked" : ""}/>
                    <div>
                      <div style="font-weight:600">${escape(a.name)} · ${escape(a.phone)}</div>
                      <div class="muted small">${escape(a.line1)}, ${escape(a.city)}, ${escape(a.state)} - ${escape(a.pincode)}</div>
                    </div>
                  </label>
                `).join("")}
              </div>
            ` : ""}
            <details>
              <summary style="cursor:pointer;color:var(--accent);font-weight:600">+ Add a new address</summary>
              <form id="newAddrForm" class="form-grid" style="margin-top:14px">
                <div><label>Name</label><input name="name" required value="${escape(user.name)}"/></div>
                <div><label>Phone</label><input name="phone" required/></div>
                <div class="full"><label>Address line</label><input name="line1" required/></div>
                <div><label>City</label><input name="city" required/></div>
                <div><label>State</label><input name="state" required/></div>
                <div><label>Pincode</label><input name="pincode" required/></div>
                <div class="full"><button type="submit" class="btn-secondary">Save address</button></div>
              </form>
            </details>
          </div>

          <div class="dash-main">
            <h4 style="margin:0 0 12px">Payment Method</h4>
            ${["UPI", "Card", "Net Banking", "Cash on Delivery"].map((m, i) => `
              <label class="flex" style="border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer">
                <input type="radio" name="payment" value="${m}" ${i === 0 ? "checked" : ""}/>
                <span style="font-weight:500">${m}</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="cart-summary">
          <h4 style="margin:0 0 14px">Order Summary</h4>
          ${items.map(i => `
            <div class="flex" style="margin-bottom:10px">
              <img src="${i.product.images[0]}" style="width:48px;height:48px;border-radius:6px;object-fit:cover"/>
              <div style="flex:1">
                <div class="small" style="font-weight:600">${escape(i.product.name)}</div>
                <div class="muted small">${escape(i.size)} · ${escape(i.color)} · Qty ${i.qty}</div>
              </div>
              <div class="small" style="font-weight:600">${fmt(Store.effectivePrice(i.product) * i.qty)}</div>
            </div>
          `).join("")}
          <hr style="border:0;border-top:1px solid var(--line);margin:12px 0"/>
          <div class="sum-line"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
          ${coupon ? `<div class="sum-line"><span>Discount</span><span style="color:var(--ok)">−${fmt(discount)}</span></div>` : ""}
          <div class="sum-line"><span>Shipping</span><span>${shipping === 0 ? "FREE" : fmt(shipping)}</span></div>
          <div class="sum-line"><span>Tax (5%)</span><span>${fmt(tax)}</span></div>
          <div class="sum-line total"><span>Total</span><span>${fmt(total)}</span></div>
          <button class="btn-primary btn-block" id="placeOrder" style="margin-top:18px">Place Order</button>
        </div>
      </div>
    `;
  }

  function bindCheckout() {
    const addrForm = document.getElementById("newAddrForm");
    if (addrForm) addrForm.onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(addrForm);
      Store.addAddress({
        name: fd.get("name"), phone: fd.get("phone"),
        line1: fd.get("line1"), city: fd.get("city"), state: fd.get("state"), pincode: fd.get("pincode"),
        isDefault: false
      });
      App.toast("Address saved");
      App.rerender();
    };
    const place = document.getElementById("placeOrder");
    if (place) place.onclick = () => {
      const user = Store.currentUser();
      const addrId = document.querySelector("input[name='addr']:checked")?.value;
      const payment = document.querySelector("input[name='payment']:checked")?.value || "UPI";
      const addr = user.addresses.find(a => a.id === addrId) || user.addresses[0];
      if (!addr) return App.toast("Add a shipping address first", "err");

      const cart = Store.getCart();
      const items = cart.map(i => {
        const p = Store.getProduct(i.productId);
        return { productId: p.id, name: p.name, price: Store.effectivePrice(p), qty: i.qty, size: i.size, color: i.color, image: p.images[0] };
      });
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
      const coupon = window.__appliedCoupon;
      const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
      const shipping = subtotal > 1999 ? 0 : 99;
      const tax = Math.round((subtotal - discount) * 0.05);
      const total = subtotal - discount + shipping + tax;

      const order = Store.placeOrder({
        userId: user.id,
        items, subtotal, discount, shipping, tax, total,
        address: addr, payment, coupon: coupon?.code || null
      });
      window.__appliedCoupon = null;
      App.toast("Order placed successfully!");
      location.hash = "#/order/" + order.id;
    };
  }

  /* ---------- ORDERS / TRACKING ---------- */
  function ordersView() {
    const user = Store.currentUser();
    if (!user) return `<div class="empty-state"><h3>Please log in to view orders</h3><a class="btn-primary" href="#/login">Login</a></div>`;
    const orders = Store.getOrdersForUser(user.id);
    if (!orders.length) return `<div class="empty-state"><h3>No orders yet</h3><a class="btn-primary" href="#/shop">Start shopping</a></div>`;
    return `
      <h2 style="margin-bottom:18px">My Orders</h2>
      ${orders.map(o => `
        <div class="dash-main" style="margin-bottom:14px">
          <div class="flex" style="margin-bottom:12px">
            <div>
              <div style="font-weight:700">${o.id}</div>
              <div class="muted small">Placed on ${new Date(o.createdAt).toLocaleDateString()} · ${o.items.length} item(s) · ${fmt(o.total)}</div>
            </div>
            <div class="spacer"></div>
            <span class="status-pill ${statusClass(o.status)}">${o.status}</span>
            <a class="btn-ghost" href="#/order/${o.id}">Track</a>
          </div>
          <div class="flex" style="gap:10px">
            ${o.items.slice(0, 4).map(i => `<img src="${i.image}" style="width:54px;height:54px;border-radius:6px;object-fit:cover"/>`).join("")}
            ${o.items.length > 4 ? `<span class="muted small">+${o.items.length - 4} more</span>` : ""}
          </div>
        </div>
      `).join("")}
    `;
  }

  function statusClass(s) {
    const m = { "Order Placed": "placed", "Packed": "packed", "Shipped": "shipped", "Out for Delivery": "ofd", "Delivered": "delivered", "Cancelled": "cancelled" };
    return m[s] || "placed";
  }

  function orderDetailView(params) {
    const o = Store.snapshot().orders.find(x => x.id === params.id);
    if (!o) return `<div class="empty-state"><h3>Order not found</h3></div>`;
    const steps = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
    const currentIdx = steps.indexOf(o.status);
    return `
      <div class="flex" style="margin-bottom:18px">
        <div>
          <a href="#/orders" class="muted small">← Back to orders</a>
          <h2 style="margin:6px 0 0">${o.id}</h2>
          <div class="muted small">Placed on ${new Date(o.createdAt).toLocaleString()}</div>
        </div>
        <div class="spacer"></div>
        <span class="status-pill ${statusClass(o.status)}">${o.status}</span>
        <button class="btn-ghost" onclick="App.downloadInvoice('${o.id}')">Download Invoice</button>
      </div>

      ${o.status !== "Cancelled" ? `
        <div class="dash-main">
          <div class="tracker">
            ${steps.map((s, i) => `
              <div class="tracker-step ${i < currentIdx ? "done" : i === currentIdx ? "current" : ""}">
                ${s}
                <div class="tracker-line"></div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : `<div class="alert err">This order was cancelled.</div>`}

      <div class="dash-main" style="margin-top:18px">
        <h4 style="margin:0 0 12px">Items</h4>
        ${o.items.map(i => `
          <div class="flex" style="padding:10px 0;border-bottom:1px solid var(--line)">
            <img src="${i.image}" style="width:60px;height:60px;border-radius:6px;object-fit:cover"/>
            <div style="flex:1">
              <div style="font-weight:600">${escape(i.name)}</div>
              <div class="muted small">${escape(i.size)} · ${escape(i.color)} · Qty ${i.qty}</div>
            </div>
            <div style="font-weight:700">${fmt(i.price * i.qty)}</div>
          </div>
        `).join("")}
      </div>

      <div class="cart-layout" style="margin-top:18px">
        <div class="dash-main">
          <h4 style="margin:0 0 8px">Shipping to</h4>
          <p class="small" style="margin:0">${escape(o.address.name)}<br/>${escape(o.address.line1)}, ${escape(o.address.city)}<br/>${escape(o.address.state)} - ${escape(o.address.pincode)}<br/>${escape(o.address.phone)}</p>
        </div>
        <div class="cart-summary" style="position:static">
          <h4 style="margin:0 0 14px">Order Summary</h4>
          <div class="sum-line"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
          ${o.discount ? `<div class="sum-line"><span>Discount</span><span style="color:var(--ok)">−${fmt(o.discount)}</span></div>` : ""}
          <div class="sum-line"><span>Shipping</span><span>${o.shipping === 0 ? "FREE" : fmt(o.shipping)}</span></div>
          <div class="sum-line"><span>Tax</span><span>${fmt(o.tax)}</span></div>
          <div class="sum-line total"><span>Total</span><span>${fmt(o.total)}</span></div>
          <div class="muted small" style="margin-top:10px">Paid via ${o.payment}</div>
        </div>
      </div>
    `;
  }

  /* ---------- WISHLIST ---------- */
  function wishlistView() {
    const ids = Store.getWishlist();
    if (!ids.length) return `<div class="empty-state"><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it for later.</p><a class="btn-primary" href="#/shop">Browse products</a></div>`;
    const products = ids.map(id => Store.getProduct(id)).filter(Boolean);
    return `
      <h2 style="margin-bottom:18px">My Wishlist</h2>
      <div class="products-grid">${products.map(productCardHTML).join("")}</div>
    `;
  }

  /* ---------- PROFILE ---------- */
  function profileView(params) {
    const user = Store.currentUser();
    if (!user) {
      location.hash = "#/login";
      return "";
    }
    const tab = params?.tab || "info";
    const sidebar = `
      <div class="dash-side">
        <a href="#/profile" class="${tab === "info" ? "on" : ""}">Profile</a>
        <a href="#/profile/orders" class="${tab === "orders" ? "on" : ""}">My Orders</a>
        <a href="#/profile/addresses" class="${tab === "addresses" ? "on" : ""}">Saved Addresses</a>
        <a href="#/wishlist">Wishlist</a>
        <a href="#" onclick="event.preventDefault(); Auth.logout()" style="color:var(--accent)">Logout</a>
      </div>
    `;
    let body = "";
    if (tab === "info") {
      body = `
        <h3 style="margin-top:0">Profile Info</h3>
        <form id="profileForm" class="form-grid">
          <div><label>Name</label><input name="name" value="${escape(user.name)}" required/></div>
          <div><label>Email</label><input name="email" value="${escape(user.email)}" required/></div>
          <div class="full"><label>New Password (leave blank to keep)</label><input name="password" type="password"/></div>
          <div class="full"><button type="submit" class="btn-primary">Save changes</button></div>
        </form>
      `;
    } else if (tab === "orders") {
      const orders = Store.getOrdersForUser(user.id);
      body = orders.length ? `
        <h3 style="margin-top:0">My Orders</h3>
        <table class="tbl">
          <tr><th>ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr>
          ${orders.map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${o.items.length}</td>
              <td>${fmt(o.total)}</td>
              <td><span class="status-pill ${statusClass(o.status)}">${o.status}</span></td>
              <td><a href="#/order/${o.id}" class="btn-link">View</a> · <button class="btn-link" onclick="App.downloadInvoice('${o.id}')">Invoice</button></td>
            </tr>
          `).join("")}
        </table>
      ` : `<p class="muted">No orders yet.</p>`;
    } else if (tab === "addresses") {
      body = `
        <div class="flex" style="margin-bottom:14px">
          <h3 style="margin:0">Saved Addresses</h3>
          <div class="spacer"></div>
          <button class="btn-primary" id="addAddrBtn">+ Add Address</button>
        </div>
        ${user.addresses.length ? user.addresses.map(a => `
          <div style="border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:10px">
            <div class="flex">
              <div>
                <div style="font-weight:600">${escape(a.name)}${a.isDefault ? ` <span class="tag">Default</span>` : ""}</div>
                <div class="muted small">${escape(a.line1)}, ${escape(a.city)}, ${escape(a.state)} - ${escape(a.pincode)} · ${escape(a.phone)}</div>
              </div>
              <div class="spacer"></div>
              <button class="btn-link" onclick="App.removeAddress('${a.id}')" style="color:var(--bad)">Remove</button>
            </div>
          </div>
        `).join("") : `<p class="muted">No saved addresses.</p>`}
      `;
    }
    return `<div class="dash-layout">${sidebar}<div class="dash-main">${body}</div></div>`;
  }

  function bindProfile(params) {
    const f = document.getElementById("profileForm");
    if (f) f.onsubmit = (e) => {
      e.preventDefault();
      const user = Store.currentUser();
      const fd = new FormData(f);
      const patch = { name: fd.get("name"), email: fd.get("email") };
      if (fd.get("password")) patch.password = fd.get("password");
      Store.updateUser(user.id, patch);
      App.toast("Profile updated");
      App.rerender();
    };
    const addBtn = document.getElementById("addAddrBtn");
    if (addBtn) addBtn.onclick = () => {
      App.modal(`
        <h4>Add a new address</h4>
        <form id="addrModalForm" class="form-grid" style="margin-top:10px">
          <div><label>Name</label><input name="name" required/></div>
          <div><label>Phone</label><input name="phone" required/></div>
          <div class="full"><label>Address line</label><input name="line1" required/></div>
          <div><label>City</label><input name="city" required/></div>
          <div><label>State</label><input name="state" required/></div>
          <div><label>Pincode</label><input name="pincode" required/></div>
          <div class="full"><label class="flex"><input type="checkbox" name="isDefault"/> Set as default</label></div>
          <div class="full"><button type="submit" class="btn-primary">Save</button></div>
        </form>
      `);
      document.getElementById("addrModalForm").onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        Store.addAddress({
          name: fd.get("name"), phone: fd.get("phone"), line1: fd.get("line1"),
          city: fd.get("city"), state: fd.get("state"), pincode: fd.get("pincode"),
          isDefault: !!fd.get("isDefault")
        });
        App.closeModal();
        App.toast("Address added");
        App.rerender();
      };
    };
  }

  window.Storefront = {
    productCardHTML,
    homeView, listingView, bindListing,
    detailView, bindDetail,
    cartView, bindCart,
    checkoutView, bindCheckout,
    ordersView, orderDetailView,
    wishlistView,
    profileView, bindProfile,
    statusClass, fmt, escape
  };
})();
