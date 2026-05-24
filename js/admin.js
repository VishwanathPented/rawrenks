/* Admin panel views */
(function () {
  const fmt = n => "₹" + Number(n).toLocaleString("en-IN");
  const escape = Storefront.escape;

  function requireAdmin() {
    const u = Store.currentUser();
    if (!u || u.role !== "admin") {
      return `<div class="empty-state">
        <h3>Admin access required</h3>
        <p>Sign in as admin to access this panel.<br/>Demo: admin@rawrenks.com / admin123</p>
        <a class="btn-primary" href="#/login">Login</a>
      </div>`;
    }
    return null;
  }

  function sidebar(active) {
    return `
      <div class="admin-side">
        <h3>RAWRENKS ADMIN</h3>
        <a href="#/admin" class="${active === "dashboard" ? "on" : ""}">Dashboard</a>
        <a href="#/admin/products" class="${active === "products" ? "on" : ""}">Products</a>
        <a href="#/admin/inventory" class="${active === "inventory" ? "on" : ""}">Inventory</a>
        <a href="#/admin/orders" class="${active === "orders" ? "on" : ""}">Orders</a>
        <a href="#/admin/users" class="${active === "users" ? "on" : ""}">Users</a>
        <a href="#/admin/coupons" class="${active === "coupons" ? "on" : ""}">Coupons</a>
        <a href="#/admin/banners" class="${active === "banners" ? "on" : ""}">Banners</a>
        <a href="#/admin/reviews" class="${active === "reviews" ? "on" : ""}">Reviews</a>
        <a href="#/admin/analytics" class="${active === "analytics" ? "on" : ""}">Analytics</a>
        <a href="#/" style="margin-top:20px;opacity:0.5">← Back to Store</a>
      </div>
    `;
  }

  function shell(active, body) {
    return `<div class="admin-shell">${sidebar(active)}<div class="admin-main">${body}</div></div>`;
  }

  /* ---------- DASHBOARD ---------- */
  function dashboardView() {
    const guard = requireAdmin(); if (guard) return guard;
    const a = Store.analytics();
    const months = Object.keys(a.monthly);
    const maxVal = Math.max(...Object.values(a.monthly), 1);

    return shell("dashboard", `
      <h2 style="margin-top:0">Dashboard</h2>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="label">Total Sales</div><div class="value">${fmt(a.total)}</div><div class="change">↑ All time</div></div>
        <div class="kpi-card"><div class="label">Total Orders</div><div class="value">${a.orderCount}</div><div class="change">↑ All time</div></div>
        <div class="kpi-card"><div class="label">Avg Order Value</div><div class="value">${fmt(a.orderCount ? Math.round(a.total / a.orderCount) : 0)}</div></div>
        <div class="kpi-card"><div class="label">Low Stock Items</div><div class="value" style="color:${a.lowStock.length ? "var(--bad)" : "var(--ink)"}">${a.lowStock.length}</div></div>
      </div>

      <div class="chart-card">
        <h4>Revenue by Month</h4>
        ${months.length === 0 ? `<p class="muted">No sales data yet.</p>` : `
        <div class="bar-chart" style="padding-top:24px">
          ${months.map(m => `
            <div class="bar" style="height:${(a.monthly[m] / maxVal) * 180}px">
              <i>${fmt(a.monthly[m])}</i>
              <span>${m}</span>
            </div>
          `).join("")}
        </div>
        <div style="height:30px"></div>
        `}
      </div>

      <div class="form-grid" style="margin-top:20px">
        <div class="chart-card">
          <h4>Top Selling Products</h4>
          ${a.topProducts.length ? a.topProducts.map(p => `
            <div class="flex" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <img src="${p.images[0]}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"/>
              <div style="flex:1">
                <div style="font-weight:600;font-size:13px">${escape(p.name)}</div>
                <div class="muted small">${p.sold || 0} sold</div>
              </div>
              <div style="font-weight:700">${fmt(Store.effectivePrice(p))}</div>
            </div>
          `).join("") : `<p class="muted">No data yet.</p>`}
        </div>
        <div class="chart-card">
          <h4>Low Stock Alerts</h4>
          ${a.lowStock.length ? a.lowStock.slice(0, 6).map(p => `
            <div class="flex" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <img src="${p.images[0]}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"/>
              <div style="flex:1">
                <div style="font-weight:600;font-size:13px">${escape(p.name)}</div>
                <div class="muted small">${Store.totalStock(p)} left in stock</div>
              </div>
              <a href="#/admin/inventory" class="btn-link">Restock</a>
            </div>
          `).join("") : `<p class="muted">No low stock items 🎉</p>`}
        </div>
      </div>

      <div class="chart-card" style="margin-top:20px">
        <h4>Recent Orders</h4>
        <table class="tbl">
          <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr>
          ${a.recent.map(o => {
            const u = Store.snapshot().users.find(x => x.id === o.userId);
            return `<tr>
              <td>${o.id}</td>
              <td>${u ? escape(u.name) : "Guest"}</td>
              <td>${fmt(o.total)}</td>
              <td><span class="status-pill ${Storefront.statusClass(o.status)}">${o.status}</span></td>
              <td><a href="#/admin/orders" class="btn-link">View</a></td>
            </tr>`;
          }).join("")}
        </table>
      </div>
    `);
  }

  /* ---------- PRODUCTS ---------- */
  function productsView() {
    const guard = requireAdmin(); if (guard) return guard;
    const products = Store.products();
    return shell("products", `
      <div class="flex">
        <h2 style="margin:0">Products (${products.length})</h2>
        <div class="spacer"></div>
        <input id="prodSearch" placeholder="Search..." style="padding:8px 12px;border:1px solid var(--line);border-radius:8px"/>
        <button class="btn-primary" onclick="Admin.openProductForm()">+ Add Product</button>
      </div>
      <div id="prodTableWrap" style="margin-top:18px">
        ${productsTable(products)}
      </div>
    `);
  }

  function productsTable(products) {
    return `<table class="tbl">
      <tr><th>Image</th><th>Name</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
      ${products.map(p => `
        <tr>
          <td><img src="${p.images[0]}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"/></td>
          <td>${escape(p.name)}</td>
          <td>${escape(p.brand)}</td>
          <td>${escape(p.category)}</td>
          <td>
            ${fmt(Store.effectivePrice(p))}
            ${p.discountPrice ? `<span class="muted small" style="text-decoration:line-through">${fmt(p.price)}</span>` : ""}
          </td>
          <td>${Store.totalStock(p)}</td>
          <td>
            ${Store.isOutOfStock(p) ? `<span class="status-pill cancelled">Out</span>` :
              Store.isLowStock(p) ? `<span class="status-pill packed">Low</span>` :
              `<span class="status-pill delivered">In stock</span>`}
          </td>
          <td>
            <button class="btn-link" onclick="Admin.openProductForm('${p.id}')">Edit</button>
            · <button class="btn-link" onclick="Admin.deleteProduct('${p.id}')" style="color:var(--bad)">Delete</button>
          </td>
        </tr>
      `).join("")}
    </table>`;
  }

  function bindProducts() {
    const s = document.getElementById("prodSearch");
    if (s) s.oninput = () => {
      const q = s.value.toLowerCase();
      const filtered = Store.products().filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      document.getElementById("prodTableWrap").innerHTML = productsTable(filtered);
    };
  }

  function openProductForm(id) {
    const p = id ? Store.getProduct(id) : null;
    const sizes = (p?.sizes || []).join(", ");
    const colors = (p?.colors || []).join(", ");
    const images = (p?.images || []).join("\n");

    App.modal(`
      <h3 style="margin:0 0 14px">${p ? "Edit Product" : "Add Product"}</h3>
      <form id="prodForm" class="form-grid">
        <div class="full"><label>Name</label><input name="name" required value="${p ? escape(p.name) : ""}"/></div>
        <div><label>Brand</label>
          <input list="brandsList" name="brand" required value="${p ? escape(p.brand) : ""}"/>
          <datalist id="brandsList">${window.RawDB.BRANDS.map(b => `<option>${b}</option>`).join("")}</datalist>
        </div>
        <div><label>Category</label>
          <select name="category" required>
            ${window.RawDB.CATEGORIES.map(c => `<option ${p?.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div><label>Price (₹)</label><input name="price" type="number" required value="${p?.price || ""}"/></div>
        <div><label>Discount Price (₹, optional)</label><input name="discountPrice" type="number" value="${p?.discountPrice || ""}"/></div>
        <div class="full"><label>Description</label><textarea name="description" required>${p ? escape(p.description) : ""}</textarea></div>
        <div><label>Sizes (comma-separated)</label><input name="sizes" required value="${sizes || "S, M, L, XL"}"/></div>
        <div><label>Colors (comma-separated)</label><input name="colors" required value="${colors || "Black, White"}"/></div>
        <div class="full"><label>Image URLs (one per line)</label>
          <textarea name="images" required>${images || "https://picsum.photos/seed/new1/600/600\nhttps://picsum.photos/seed/new2/600/600"}</textarea>
        </div>
        <div><label>Tag</label>
          <select name="tag">
            <option value="">— None —</option>
            ${["Summer Collection", "Best Sellers", "Limited Edition", "New Arrivals", "Trending"].map(t =>
              `<option ${p?.tag === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div><label>Initial stock per variant</label><input name="initStock" type="number" value="${p ? "" : "10"}" placeholder="${p ? "Leave blank to keep" : "10"}"/></div>
        <div class="full" style="text-align:right">
          ${p ? `<button type="button" class="btn-ghost" onclick="Admin.markOutOfStock('${p.id}')">Mark Out of Stock</button>` : ""}
          <button type="submit" class="btn-primary">${p ? "Save changes" : "Add product"}</button>
        </div>
      </form>
    `);

    document.getElementById("prodForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const sizes = fd.get("sizes").split(",").map(s => s.trim()).filter(Boolean);
      const colors = fd.get("colors").split(",").map(s => s.trim()).filter(Boolean);
      const images = fd.get("images").split("\n").map(s => s.trim()).filter(Boolean);
      const initStock = fd.get("initStock") ? Number(fd.get("initStock")) : null;

      const patch = {
        name: fd.get("name"),
        brand: fd.get("brand"),
        category: fd.get("category"),
        description: fd.get("description"),
        price: Number(fd.get("price")),
        discountPrice: Number(fd.get("discountPrice")) || 0,
        sizes, colors, images,
        tag: fd.get("tag") || ""
      };

      if (initStock != null) {
        const stock = {};
        sizes.forEach(s => colors.forEach(c => stock[s + "|" + c] = initStock));
        patch.stock = stock;
      }

      if (p) {
        Store.adminUpdateProduct(p.id, patch);
        App.toast("Product updated");
      } else {
        Store.adminAddProduct(patch);
        App.toast("Product added");
      }
      App.closeModal();
      App.rerender();
    };
  }

  function deleteProduct(id) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    Store.adminDeleteProduct(id);
    App.toast("Product deleted");
    App.rerender();
  }

  function markOutOfStock(id) {
    const p = Store.getProduct(id);
    if (!p) return;
    const stock = {};
    Object.keys(p.stock).forEach(k => stock[k] = 0);
    Store.adminUpdateProduct(id, { stock });
    App.closeModal();
    App.toast("Marked as out of stock");
    App.rerender();
  }

  /* ---------- INVENTORY ---------- */
  function inventoryView() {
    const guard = requireAdmin(); if (guard) return guard;
    const products = Store.products();
    return shell("inventory", `
      <div class="flex">
        <h2 style="margin:0">Inventory</h2>
        <div class="spacer"></div>
        <span class="muted small">Click a quantity to edit</span>
      </div>
      <div style="margin-top:14px">
        ${products.map(p => `
          <details style="border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:10px">
            <summary style="cursor:pointer">
              <strong>${escape(p.name)}</strong>
              <span class="muted small"> · ${escape(p.brand)} · Total: ${Store.totalStock(p)} · Sold: ${p.sold || 0}</span>
              ${Store.isLowStock(p) ? `<span class="status-pill packed" style="margin-left:8px">Low</span>` : ""}
              ${Store.isOutOfStock(p) ? `<span class="status-pill cancelled" style="margin-left:8px">Out</span>` : ""}
            </summary>
            <table class="tbl" style="margin-top:12px">
              <tr><th>Variant</th><th>Stock</th><th>Action</th></tr>
              ${Object.entries(p.stock).map(([k, v]) => `
                <tr>
                  <td>${escape(k.replace("|", " · "))}</td>
                  <td><input type="number" value="${v}" data-pid="${p.id}" data-vkey="${escape(k)}" class="inv-input" style="width:80px;padding:4px 8px;border:1px solid var(--line);border-radius:6px"/></td>
                  <td><span class="muted small">${v === 0 ? "Out of stock" : v < 5 ? "Low" : "OK"}</span></td>
                </tr>
              `).join("")}
            </table>
          </details>
        `).join("")}
      </div>
    `);
  }

  function bindInventory() {
    document.querySelectorAll(".inv-input").forEach(el => {
      el.onchange = () => {
        const p = Store.getProduct(el.dataset.pid);
        if (!p) return;
        p.stock[el.dataset.vkey] = Math.max(0, Number(el.value) || 0);
        Store.adminUpdateProduct(p.id, { stock: p.stock });
        App.toast("Stock updated");
      };
    });
  }

  /* ---------- ORDERS ---------- */
  function ordersAdminView() {
    const guard = requireAdmin(); if (guard) return guard;
    const filt = window.__adminOrderFilt || (window.__adminOrderFilt = "All");
    const all = Store.snapshot().orders;
    const orders = filt === "All" ? all : all.filter(o => o.status === filt);

    return shell("orders", `
      <div class="flex">
        <h2 style="margin:0">Orders (${all.length})</h2>
        <div class="spacer"></div>
        ${["All", "Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"].map(s =>
          `<button class="chip ${filt === s ? "on" : ""}" onclick="Admin.filterOrders('${s}')">${s}</button>`).join("")}
      </div>
      <table class="tbl" style="margin-top:18px">
        <tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
        ${orders.map(o => {
          const u = Store.snapshot().users.find(x => x.id === o.userId);
          return `<tr>
            <td>${o.id}</td>
            <td>${u ? escape(u.name) : "Guest"}<br/><span class="muted small">${u ? escape(u.email) : ""}</span></td>
            <td>${o.items.length}</td>
            <td>${fmt(o.total)}</td>
            <td>${o.payment}</td>
            <td><span class="status-pill ${Storefront.statusClass(o.status)}">${o.status}</span></td>
            <td class="muted small">${new Date(o.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn-link" onclick="Admin.openOrderActions('${o.id}')">Manage</button>
            </td>
          </tr>`;
        }).join("")}
      </table>
    `);
  }

  function filterOrders(status) {
    window.__adminOrderFilt = status;
    App.rerender();
  }

  function openOrderActions(orderId) {
    const o = Store.snapshot().orders.find(x => x.id === orderId);
    if (!o) return;
    const statuses = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    App.modal(`
      <h3 style="margin:0 0 14px">${o.id}</h3>
      <p class="muted small">Customer: ${(Store.snapshot().users.find(u => u.id === o.userId) || {}).email || "Guest"}</p>
      <p><strong>Current status:</strong> <span class="status-pill ${Storefront.statusClass(o.status)}">${o.status}</span></p>
      <div class="form-grid">
        <div class="full">
          <label>Update Status</label>
          <select id="statusSel">
            ${statuses.map(s => `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="full" style="display:flex;gap:8px">
          <button class="btn-primary" onclick="Admin.applyOrderStatus('${o.id}')">Update Status</button>
          <button class="btn-secondary" onclick="App.downloadInvoice('${o.id}'); App.closeModal();">Generate Invoice</button>
          ${o.status !== "Cancelled" ? `<button class="btn-danger" onclick="Admin.refundOrder('${o.id}')">Cancel/Refund</button>` : ""}
        </div>
      </div>
      <h4 style="margin-top:18px">Items</h4>
      ${o.items.map(i => `<div class="flex" style="padding:6px 0"><img src="${i.image}" style="width:40px;height:40px;border-radius:4px;object-fit:cover"/><div style="flex:1"><div class="small" style="font-weight:600">${escape(i.name)}</div><div class="muted small">${i.size} · ${i.color} · Qty ${i.qty}</div></div><div>${fmt(i.price * i.qty)}</div></div>`).join("")}
    `);
  }

  function applyOrderStatus(orderId) {
    const sel = document.getElementById("statusSel");
    if (!sel) return;
    Store.updateOrderStatus(orderId, sel.value);
    App.closeModal();
    App.toast("Status updated");
    App.rerender();
  }

  function refundOrder(orderId) {
    if (!confirm("Cancel and refund this order?")) return;
    Store.updateOrderStatus(orderId, "Cancelled");
    App.closeModal();
    App.toast("Order cancelled");
    App.rerender();
  }

  /* ---------- USERS ---------- */
  function usersView() {
    const guard = requireAdmin(); if (guard) return guard;
    const users = Store.snapshot().users;
    return shell("users", `
      <h2 style="margin-top:0">Users (${users.length})</h2>
      <table class="tbl">
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Orders</th><th>Status</th><th>Joined</th><th></th></tr>
        ${users.map(u => {
          const orderCount = Store.getOrdersForUser(u.id).length;
          return `<tr>
            <td>${escape(u.name)}</td>
            <td>${escape(u.email)}</td>
            <td><span class="tag">${u.role}</span></td>
            <td>${orderCount}</td>
            <td>${u.blocked ? `<span class="status-pill cancelled">Blocked</span>` : `<span class="status-pill delivered">Active</span>`}</td>
            <td class="muted small">${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>
              <button class="btn-link" onclick="Admin.viewUserOrders('${u.id}')">Orders</button>
              ${u.role !== "admin" ? ` · <button class="btn-link" onclick="Admin.toggleBlock('${u.id}')" style="color:var(--bad)">${u.blocked ? "Unblock" : "Block"}</button>` : ""}
            </td>
          </tr>`;
        }).join("")}
      </table>
    `);
  }

  function toggleBlock(userId) {
    const u = Store.snapshot().users.find(x => x.id === userId);
    if (!u) return;
    Store.updateUser(userId, { blocked: !u.blocked });
    App.toast(u.blocked ? "User unblocked" : "User blocked");
    App.rerender();
  }

  function viewUserOrders(userId) {
    const u = Store.snapshot().users.find(x => x.id === userId);
    const orders = Store.getOrdersForUser(userId);
    App.modal(`
      <h3 style="margin:0 0 12px">${escape(u.name)} — Order History</h3>
      ${orders.length === 0 ? `<p class="muted">No orders.</p>` : `
        <table class="tbl">
          <tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr>
          ${orders.map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              <td>${fmt(o.total)}</td>
              <td><span class="status-pill ${Storefront.statusClass(o.status)}">${o.status}</span></td>
            </tr>
          `).join("")}
        </table>
      `}
    `);
  }

  /* ---------- COUPONS ---------- */
  function couponsView() {
    const guard = requireAdmin(); if (guard) return guard;
    const coupons = Store.snapshot().coupons;
    return shell("coupons", `
      <div class="flex">
        <h2 style="margin:0">Coupons (${coupons.length})</h2>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Admin.openCouponForm()">+ Create Coupon</button>
      </div>
      <table class="tbl" style="margin-top:18px">
        <tr><th>Code</th><th>Discount</th><th>Expires</th><th>Status</th><th>Used</th><th></th></tr>
        ${coupons.map(c => `
          <tr>
            <td><strong>${c.code}</strong></td>
            <td>${c.percent}%</td>
            <td>${c.expires}</td>
            <td>${c.active ? `<span class="status-pill delivered">Active</span>` : `<span class="status-pill cancelled">Disabled</span>`}</td>
            <td>${c.used || 0}</td>
            <td>
              <button class="btn-link" onclick="Admin.toggleCoupon('${c.code}')">${c.active ? "Disable" : "Enable"}</button>
              · <button class="btn-link" onclick="Admin.deleteCoupon('${c.code}')" style="color:var(--bad)">Delete</button>
            </td>
          </tr>
        `).join("")}
      </table>
    `);
  }

  function openCouponForm() {
    App.modal(`
      <h3 style="margin:0 0 14px">New Coupon</h3>
      <form id="couponForm" class="form-grid">
        <div><label>Code</label><input name="code" required placeholder="SUMMER20" style="text-transform:uppercase"/></div>
        <div><label>Discount %</label><input name="percent" type="number" min="1" max="100" required/></div>
        <div class="full"><label>Expires</label><input name="expires" type="date" required/></div>
        <div class="full" style="text-align:right"><button type="submit" class="btn-primary">Create</button></div>
      </form>
    `);
    document.getElementById("couponForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      Store.adminAddCoupon({
        code: fd.get("code").toUpperCase(),
        percent: Number(fd.get("percent")),
        expires: fd.get("expires"),
        active: true,
        used: 0
      });
      App.closeModal();
      App.toast("Coupon created");
      App.rerender();
    };
  }

  function toggleCoupon(code) {
    const c = Store.snapshot().coupons.find(x => x.code === code);
    if (!c) return;
    Store.adminUpdateCoupon(code, { active: !c.active });
    App.rerender();
  }

  function deleteCoupon(code) {
    if (!confirm("Delete this coupon?")) return;
    Store.adminDeleteCoupon(code);
    App.toast("Coupon deleted");
    App.rerender();
  }

  /* ---------- BANNERS ---------- */
  function bannersView() {
    const guard = requireAdmin(); if (guard) return guard;
    const banners = Store.snapshot().banners;
    return shell("banners", `
      <div class="flex">
        <h2 style="margin:0">Banner Management</h2>
        <div class="spacer"></div>
        <button class="btn-primary" onclick="Admin.openBannerForm()">+ Add Banner</button>
      </div>
      <div style="margin-top:18px">
        ${banners.map(b => `
          <div style="border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px">
            <div style="display:grid;grid-template-columns:240px 1fr auto;gap:16px;align-items:center">
              <img src="${b.image}" style="width:240px;height:120px;object-fit:cover;border-radius:8px"/>
              <div>
                <div style="font-weight:700;font-size:17px">${escape(b.title)}</div>
                <div class="muted small">${escape(b.sub)}</div>
                <div class="muted small" style="margin-top:6px">CTA: ${escape(b.cta)} → ${escape(b.link)}</div>
              </div>
              <div style="text-align:right">
                ${b.active ? `<span class="status-pill delivered">Active</span>` : `<span class="status-pill cancelled">Inactive</span>`}<br/>
                <button class="btn-link" onclick="Admin.openBannerForm('${b.id}')" style="margin-top:8px">Edit</button>
                · <button class="btn-link" onclick="Admin.toggleBanner('${b.id}')">${b.active ? "Hide" : "Show"}</button>
                · <button class="btn-link" onclick="Admin.deleteBanner('${b.id}')" style="color:var(--bad)">Delete</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `);
  }

  function openBannerForm(id) {
    const b = id ? Store.snapshot().banners.find(x => x.id === id) : null;
    App.modal(`
      <h3 style="margin:0 0 14px">${b ? "Edit Banner" : "Add Banner"}</h3>
      <form id="bannerForm" class="form-grid">
        <div class="full"><label>Title</label><input name="title" required value="${b ? escape(b.title) : ""}"/></div>
        <div class="full"><label>Subtitle</label><input name="sub" value="${b ? escape(b.sub) : ""}"/></div>
        <div><label>CTA text</label><input name="cta" required value="${b ? escape(b.cta) : "Shop now"}"/></div>
        <div><label>CTA link</label><input name="link" required value="${b ? escape(b.link) : "#/shop"}"/></div>
        <div class="full"><label>Image URL</label><input name="image" required value="${b ? escape(b.image) : "https://picsum.photos/seed/banner/1600/700"}"/></div>
        <div class="full"><label class="flex"><input type="checkbox" name="active" ${b?.active ? "checked" : ""}/> Active on homepage</label></div>
        <div class="full" style="text-align:right"><button type="submit" class="btn-primary">${b ? "Save" : "Create"}</button></div>
      </form>
    `);
    document.getElementById("bannerForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {
        title: fd.get("title"), sub: fd.get("sub"),
        cta: fd.get("cta"), link: fd.get("link"),
        image: fd.get("image"), active: !!fd.get("active")
      };
      if (b) Store.adminUpdateBanner(b.id, data);
      else Store.adminAddBanner(data);
      App.closeModal();
      App.toast(b ? "Banner updated" : "Banner created");
      App.rerender();
    };
  }

  function toggleBanner(id) {
    const b = Store.snapshot().banners.find(x => x.id === id);
    if (!b) return;
    Store.adminUpdateBanner(id, { active: !b.active });
    App.rerender();
  }

  function deleteBanner(id) {
    if (!confirm("Delete this banner?")) return;
    Store.adminDeleteBanner(id);
    App.toast("Banner deleted");
    App.rerender();
  }

  /* ---------- REVIEWS ---------- */
  function reviewsView() {
    const guard = requireAdmin(); if (guard) return guard;
    const allReviews = [];
    Store.products().forEach(p => {
      (p.reviews || []).forEach(r => allReviews.push({ ...r, product: p }));
    });
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    return shell("reviews", `
      <h2 style="margin-top:0">Review Management (${allReviews.length})</h2>
      <p class="muted small">Approve or remove customer reviews. Only approved reviews show on product pages.</p>
      <table class="tbl" style="margin-top:14px">
        <tr><th>Product</th><th>Author</th><th>Rating</th><th>Comment</th><th>Status</th><th>Date</th><th></th></tr>
        ${allReviews.map(r => `
          <tr>
            <td>
              <div class="flex">
                <img src="${r.product.images[0]}" style="width:32px;height:32px;border-radius:4px;object-fit:cover"/>
                <span class="small">${escape(r.product.name)}</span>
              </div>
            </td>
            <td>${escape(r.author)}</td>
            <td>${"★".repeat(r.rating)}</td>
            <td class="small">${escape(r.text)}</td>
            <td>${r.approved ? `<span class="status-pill delivered">Approved</span>` : `<span class="status-pill packed">Pending</span>`}</td>
            <td class="muted small">${new Date(r.date).toLocaleDateString()}</td>
            <td>
              <button class="btn-link" onclick="Admin.toggleReview('${r.product.id}','${r.id}')">${r.approved ? "Unapprove" : "Approve"}</button>
              · <button class="btn-link" onclick="Admin.deleteReview('${r.product.id}','${r.id}')" style="color:var(--bad)">Delete</button>
            </td>
          </tr>
        `).join("")}
      </table>
    `);
  }

  function toggleReview(pid, rid) {
    Store.adminToggleReview(pid, rid);
    App.rerender();
  }

  function deleteReview(pid, rid) {
    if (!confirm("Delete this review?")) return;
    Store.adminDeleteReview(pid, rid);
    App.toast("Review deleted");
    App.rerender();
  }

  /* ---------- ANALYTICS ---------- */
  function analyticsView() {
    const guard = requireAdmin(); if (guard) return guard;
    const a = Store.analytics();
    const products = Store.products();
    const months = Object.keys(a.monthly);
    const maxVal = Math.max(...Object.values(a.monthly), 1);
    const orderCount = a.orderCount;
    const totalViews = products.reduce((s, p) => s + (p.views || 0), 0);
    const conversionRate = totalViews ? ((orderCount / totalViews) * 100).toFixed(2) : "0.00";

    return shell("analytics", `
      <h2 style="margin-top:0">Analytics & Reports</h2>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="label">Total Revenue</div><div class="value">${fmt(a.total)}</div></div>
        <div class="kpi-card"><div class="label">Total Orders</div><div class="value">${orderCount}</div></div>
        <div class="kpi-card"><div class="label">Product Views</div><div class="value">${totalViews}</div></div>
        <div class="kpi-card"><div class="label">Conversion Rate</div><div class="value">${conversionRate}%</div></div>
      </div>

      <div class="chart-card">
        <h4>Monthly Revenue</h4>
        ${months.length ? `
          <div class="bar-chart" style="padding-top:24px">
            ${months.map(m => `<div class="bar" style="height:${(a.monthly[m] / maxVal) * 180}px"><i>${fmt(a.monthly[m])}</i><span>${m}</span></div>`).join("")}
          </div>
          <div style="height:30px"></div>
        ` : `<p class="muted">No sales yet.</p>`}
      </div>

      <div class="form-grid" style="margin-top:20px">
        <div class="chart-card">
          <h4>Most Viewed Products</h4>
          ${a.mostViewed.map(p => `
            <div class="flex" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <img src="${p.images[0]}" style="width:40px;height:40px;border-radius:4px;object-fit:cover"/>
              <div style="flex:1">
                <div class="small" style="font-weight:600">${escape(p.name)}</div>
                <div class="muted small">${p.views || 0} views · ${p.sold || 0} sold</div>
              </div>
              <div class="small">${p.views ? ((p.sold / p.views) * 100).toFixed(1) + "%" : "—"}</div>
            </div>
          `).join("")}
        </div>
        <div class="chart-card">
          <h4>Top Selling Products</h4>
          ${a.topProducts.map(p => `
            <div class="flex" style="padding:8px 0;border-bottom:1px solid var(--line)">
              <img src="${p.images[0]}" style="width:40px;height:40px;border-radius:4px;object-fit:cover"/>
              <div style="flex:1">
                <div class="small" style="font-weight:600">${escape(p.name)}</div>
                <div class="muted small">${p.sold || 0} sold</div>
              </div>
              <div style="font-weight:700" class="small">${fmt((p.sold || 0) * Store.effectivePrice(p))}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `);
  }

  window.Admin = {
    dashboardView, productsView, bindProducts, openProductForm, deleteProduct, markOutOfStock,
    inventoryView, bindInventory,
    ordersAdminView, filterOrders, openOrderActions, applyOrderStatus, refundOrder,
    usersView, toggleBlock, viewUserOrders,
    couponsView, openCouponForm, toggleCoupon, deleteCoupon,
    bannersView, openBannerForm, toggleBanner, deleteBanner,
    reviewsView, toggleReview, deleteReview,
    analyticsView
  };
})();
