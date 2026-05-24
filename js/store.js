/* Central store + cart/wishlist/etc */
(function () {
  let db = window.RawDB.load();
  const listeners = [];

  function snapshot() { return db; }
  function persist() { window.RawDB.save(db); listeners.forEach(fn => fn(db)); }
  function subscribe(fn) { listeners.push(fn); }

  function currentUser() {
    if (!db.session.userId) return null;
    return db.users.find(u => u.id === db.session.userId) || null;
  }

  function setSession(userId) {
    db.session.userId = userId;
    if (!db.carts) db.carts = {};
    if (!db.wishlists) db.wishlists = {};
    if (userId && !db.carts[userId]) db.carts[userId] = [];
    if (userId && !db.wishlists[userId]) db.wishlists[userId] = [];
    persist();
  }

  function getCart() {
    const u = currentUser();
    if (!u) {
      if (!db.guestCart) db.guestCart = [];
      return db.guestCart;
    }
    if (!db.carts) db.carts = {};
    if (!db.carts[u.id]) db.carts[u.id] = [];
    return db.carts[u.id];
  }

  function getWishlist() {
    const u = currentUser();
    if (!u) {
      if (!db.guestWish) db.guestWish = [];
      return db.guestWish;
    }
    if (!db.wishlists) db.wishlists = {};
    if (!db.wishlists[u.id]) db.wishlists[u.id] = [];
    return db.wishlists[u.id];
  }

  function setCart(items) {
    const u = currentUser();
    if (!u) db.guestCart = items;
    else db.carts[u.id] = items;
    persist();
  }

  function setWishlist(items) {
    const u = currentUser();
    if (!u) db.guestWish = items;
    else db.wishlists[u.id] = items;
    persist();
  }

  function addToCart(productId, size, color, qty) {
    const cart = getCart().slice();
    const key = productId + "|" + size + "|" + color;
    const existing = cart.find(i => (i.productId + "|" + i.size + "|" + i.color) === key);
    if (existing) existing.qty += qty;
    else cart.push({ productId, size, color, qty });
    setCart(cart);
  }

  function updateCartQty(productId, size, color, qty) {
    const cart = getCart().slice();
    const item = cart.find(i => i.productId === productId && i.size === size && i.color === color);
    if (!item) return;
    if (qty <= 0) {
      const idx = cart.indexOf(item);
      cart.splice(idx, 1);
    } else {
      item.qty = qty;
    }
    setCart(cart);
  }

  function removeFromCart(productId, size, color) {
    const cart = getCart().filter(i => !(i.productId === productId && i.size === size && i.color === color));
    setCart(cart);
  }

  function clearCart() { setCart([]); }

  function toggleWishlist(productId) {
    const wl = getWishlist().slice();
    const idx = wl.indexOf(productId);
    if (idx >= 0) wl.splice(idx, 1);
    else wl.push(productId);
    setWishlist(wl);
  }

  function inWishlist(productId) { return getWishlist().includes(productId); }

  function getProduct(id) { return db.products.find(p => p.id === id); }
  function products() { return db.products; }
  function effectivePrice(p) { return p.discountPrice > 0 ? p.discountPrice : p.price; }

  function placeOrder(order) {
    const id = "ORD" + (1000 + db.orders.length + Math.floor(Math.random() * 100));
    const newOrder = Object.assign({ id, createdAt: new Date().toISOString(), status: "Order Placed",
      history: [{ status: "Order Placed", date: new Date().toISOString() }] }, order);
    db.orders.unshift(newOrder);
    newOrder.items.forEach(item => {
      const p = getProduct(item.productId);
      if (!p) return;
      const key = item.size + "|" + item.color;
      if (p.stock[key] != null) p.stock[key] = Math.max(0, p.stock[key] - item.qty);
      p.sold = (p.sold || 0) + item.qty;
    });
    clearCart();
    persist();
    return newOrder;
  }

  function getOrdersForUser(userId) {
    return db.orders.filter(o => o.userId === userId);
  }

  function updateOrderStatus(orderId, status) {
    const o = db.orders.find(x => x.id === orderId);
    if (!o) return;
    o.status = status;
    o.history = o.history || [];
    o.history.push({ status, date: new Date().toISOString() });
    persist();
  }

  function findCoupon(code) {
    if (!code) return null;
    return db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  }

  function totalStock(p) {
    return Object.values(p.stock || {}).reduce((s, v) => s + (v || 0), 0);
  }

  function isLowStock(p) { return totalStock(p) > 0 && totalStock(p) < 10; }
  function isOutOfStock(p) { return totalStock(p) === 0; }

  function addUser(user) {
    user.id = "u_" + Math.random().toString(36).slice(2, 10);
    user.role = user.role || "customer";
    user.addresses = user.addresses || [];
    user.blocked = false;
    user.createdAt = new Date().toISOString();
    db.users.push(user);
    persist();
    return user;
  }

  function findUserByEmail(email) {
    return db.users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
  }

  function updateUser(userId, patch) {
    const u = db.users.find(x => x.id === userId);
    if (!u) return;
    Object.assign(u, patch);
    persist();
  }

  function addAddress(addr) {
    const u = currentUser();
    if (!u) return;
    addr.id = "a_" + Math.random().toString(36).slice(2, 8);
    if (addr.isDefault) u.addresses.forEach(a => a.isDefault = false);
    u.addresses.push(addr);
    persist();
  }

  function removeAddress(addrId) {
    const u = currentUser();
    if (!u) return;
    u.addresses = u.addresses.filter(a => a.id !== addrId);
    persist();
  }

  /* Admin operations */
  function adminAddProduct(p) {
    p.id = "p_" + Math.random().toString(36).slice(2, 8);
    p.rating = 0;
    p.reviews = [];
    p.views = 0;
    p.sold = 0;
    p.createdAt = new Date().toISOString();
    db.products.unshift(p);
    persist();
    return p;
  }

  function adminUpdateProduct(id, patch) {
    const p = db.products.find(x => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    persist();
  }

  function adminDeleteProduct(id) {
    db.products = db.products.filter(p => p.id !== id);
    persist();
  }

  function adminAddCoupon(c) { db.coupons.push(c); persist(); }
  function adminUpdateCoupon(code, patch) {
    const c = db.coupons.find(x => x.code === code);
    if (c) Object.assign(c, patch);
    persist();
  }
  function adminDeleteCoupon(code) {
    db.coupons = db.coupons.filter(c => c.code !== code);
    persist();
  }

  function adminAddBanner(b) { b.id = "b_" + Math.random().toString(36).slice(2, 8); db.banners.push(b); persist(); }
  function adminUpdateBanner(id, patch) {
    const b = db.banners.find(x => x.id === id);
    if (b) Object.assign(b, patch);
    persist();
  }
  function adminDeleteBanner(id) {
    db.banners = db.banners.filter(b => b.id !== id);
    persist();
  }

  function adminToggleReview(productId, reviewId) {
    const p = getProduct(productId);
    if (!p) return;
    const r = p.reviews.find(x => x.id === reviewId);
    if (r) r.approved = !r.approved;
    persist();
  }

  function adminDeleteReview(productId, reviewId) {
    const p = getProduct(productId);
    if (!p) return;
    p.reviews = p.reviews.filter(r => r.id !== reviewId);
    persist();
  }

  function addReview(productId, review) {
    const p = getProduct(productId);
    if (!p) return;
    p.reviews = p.reviews || [];
    review.id = "rv_" + Math.random().toString(36).slice(2, 8);
    review.date = new Date().toISOString();
    review.approved = false;
    p.reviews.unshift(review);
    persist();
  }

  function trackProductView(productId) {
    const p = getProduct(productId);
    if (!p) return;
    p.views = (p.views || 0) + 1;
    persist();
  }

  function analytics() {
    const total = db.orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + (o.total || 0), 0);
    const orderCount = db.orders.length;
    const monthly = {};
    db.orders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString("default", { month: "short" });
      monthly[key] = (monthly[key] || 0) + (o.status === "Cancelled" ? 0 : o.total);
    });
    const topProducts = db.products.slice().sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
    const mostViewed = db.products.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const lowStock = db.products.filter(p => isLowStock(p));
    const recent = db.orders.slice(0, 5);
    return { total, orderCount, monthly, topProducts, mostViewed, lowStock, recent };
  }

  window.Store = {
    snapshot, subscribe, currentUser, setSession,
    getCart, getWishlist, addToCart, updateCartQty, removeFromCart, clearCart,
    toggleWishlist, inWishlist,
    getProduct, products, effectivePrice,
    placeOrder, getOrdersForUser, updateOrderStatus,
    findCoupon, totalStock, isLowStock, isOutOfStock,
    addUser, findUserByEmail, updateUser, addAddress, removeAddress,
    adminAddProduct, adminUpdateProduct, adminDeleteProduct,
    adminAddCoupon, adminUpdateCoupon, adminDeleteCoupon,
    adminAddBanner, adminUpdateBanner, adminDeleteBanner,
    adminToggleReview, adminDeleteReview,
    addReview, trackProductView, analytics
  };
})();
