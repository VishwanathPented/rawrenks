/* App bootstrap, search, header, modal, toast, invoice */
(function () {
  function updateHeader() {
    const user = Store.currentUser();
    const cart = Store.getCart();
    const wish = Store.getWishlist();
    document.getElementById("cart-count").textContent = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById("wishlist-count").textContent = wish.length;
    const acc = document.getElementById("account-link");
    if (user) acc.textContent = user.name.split(" ")[0];
    else acc.textContent = "Login";
    acc.href = user ? "#/profile" : "#/login";
    const adminLink = document.getElementById("admin-link");
    if (user && user.role === "admin") adminLink.style.display = "inline-flex";
    else adminLink.style.display = "none";
  }

  function toast(msg, type) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.background = type === "err" ? "var(--bad)" : "var(--ink)";
    t.classList.add("show");
    clearTimeout(window.__toastTm);
    window.__toastTm = setTimeout(() => t.classList.remove("show"), 2400);
  }

  function modal(html) {
    let m = document.getElementById("modalRoot");
    if (!m) {
      m = document.createElement("div");
      m.id = "modalRoot";
      m.className = "modal-overlay";
      m.innerHTML = `<div class="modal"><div class="modal-head"><h3></h3><button class="modal-close" onclick="App.closeModal()">×</button></div><div class="modal-body"></div></div>`;
      document.body.appendChild(m);
      m.onclick = (e) => { if (e.target === m) closeModal(); };
    }
    m.querySelector(".modal-body").innerHTML = html;
    m.classList.add("open");
  }

  function closeModal() {
    const m = document.getElementById("modalRoot");
    if (m) m.classList.remove("open");
  }

  function rerender() { Router.render(); afterRender(); }

  /* Cart helpers used by inline onclick handlers */
  function cartQty(productId, size, color, delta) {
    const cart = Store.getCart();
    const item = cart.find(i => i.productId === productId && i.size === size && i.color === color);
    if (!item) return;
    Store.updateCartQty(productId, size, color, item.qty + delta);
    rerender();
  }
  function cartSetQty(productId, size, color, val) {
    Store.updateCartQty(productId, size, color, Math.max(0, Number(val) || 0));
    rerender();
  }
  function cartRemove(productId, size, color) {
    Store.removeFromCart(productId, size, color);
    toast("Removed from cart");
    rerender();
  }
  function toggleWish(productId) {
    Store.toggleWishlist(productId);
    toast(Store.inWishlist(productId) ? "Saved to wishlist" : "Removed from wishlist");
    updateHeader();
    rerender();
  }
  function removeAddress(addrId) {
    if (!confirm("Remove this address?")) return;
    Store.removeAddress(addrId);
    toast("Address removed");
    rerender();
  }

  function goSearch(q) {
    if (!q || !q.trim()) return;
    location.hash = "#/search?q=" + encodeURIComponent(q.trim());
    document.getElementById("search-suggestions").classList.remove("open");
  }

  function bindSearchSuggest() {
    const input = document.getElementById("search-input");
    const box = document.getElementById("search-suggestions");
    if (!input) return;

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) { box.classList.remove("open"); return; }
      const products = Store.products()
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q))
        .slice(0, 6);
      const brandMatches = Array.from(new Set(Store.products().map(p => p.brand))).filter(b => b.toLowerCase().includes(q)).slice(0, 3);
      const catMatches = window.RawDB.CATEGORIES.filter(c => c.toLowerCase().includes(q));

      let html = "";
      if (catMatches.length) {
        html += catMatches.map(c => `<div class="suggest-item" onclick="location.hash='#/shop/${encodeURIComponent(c)}'"><div class="suggest-cat">Category</div><div>${c}</div></div>`).join("");
      }
      if (brandMatches.length) {
        html += brandMatches.map(b => `<div class="suggest-item" onclick="App.goSearch('${b}')"><div class="suggest-cat">Brand</div><div>${b}</div></div>`).join("");
      }
      if (products.length) {
        html += products.map(p => `
          <div class="suggest-item" onclick="location.hash='#/product/${p.id}'">
            <img src="${p.images[0]}" alt=""/>
            <div>
              <div style="font-size:13px">${p.name}</div>
              <div class="suggest-cat">${p.brand} · ${p.category}</div>
            </div>
          </div>
        `).join("");
      }
      if (!html) html = `<div class="suggest-item muted">No matches for "${q}"</div>`;
      else html += `<div class="suggest-item" style="border-top:1px solid var(--line);justify-content:center;font-weight:600;color:var(--accent)" onclick="App.goSearch('${q.replace(/'/g, "\\'")}')">See all results →</div>`;

      box.innerHTML = html;
      box.classList.add("open");
    });

    input.addEventListener("blur", () => setTimeout(() => box.classList.remove("open"), 200));
    input.addEventListener("focus", () => { if (input.value) box.classList.add("open"); });
  }

  function downloadInvoice(orderId) {
    const o = Store.snapshot().orders.find(x => x.id === orderId);
    if (!o) return;
    const u = Store.snapshot().users.find(x => x.id === o.userId) || { name: "Guest", email: "" };
    const fmt = n => "Rs " + Number(n).toLocaleString("en-IN");
    const lines = [
      "RAWRENKS — TAX INVOICE",
      "=".repeat(50),
      "Invoice: " + o.id,
      "Date: " + new Date(o.createdAt).toLocaleString(),
      "",
      "Customer: " + u.name + (u.email ? " <" + u.email + ">" : ""),
      "Ship to: " + o.address.name,
      "         " + o.address.line1 + ", " + o.address.city,
      "         " + o.address.state + " - " + o.address.pincode,
      "         Phone: " + o.address.phone,
      "",
      "Payment: " + o.payment + "    Status: " + o.status,
      "-".repeat(50),
      "ITEMS",
      "-".repeat(50)
    ];
    o.items.forEach(i => {
      lines.push(i.name + "  (" + i.size + " / " + i.color + ")  x" + i.qty + "  " + fmt(i.price * i.qty));
    });
    lines.push("-".repeat(50));
    lines.push("Subtotal:".padEnd(40) + fmt(o.subtotal));
    if (o.discount) lines.push("Discount:".padEnd(40) + "-" + fmt(o.discount));
    lines.push("Shipping:".padEnd(40) + (o.shipping ? fmt(o.shipping) : "FREE"));
    lines.push("Tax (5%):".padEnd(40) + fmt(o.tax));
    lines.push("=".repeat(50));
    lines.push("TOTAL:".padEnd(40) + fmt(o.total));
    lines.push("");
    lines.push("Thank you for shopping with Rawrenks!");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${o.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Invoice downloaded");
  }

  /* ============ 3D + SCROLL FX ============ */
  function bindTilt() {
    document.querySelectorAll(".tilt-grid .product-card, .tilt-card").forEach(card => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "1";
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-6px)`;
        card.style.setProperty("--glare-x", (x * 100 + 50) + "%");
        card.style.setProperty("--glare-y", (y * 100 + 50) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  function bindReveal() {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => io.observe(el));
  }

  function bindParallax() {
    const tick = () => {
      document.querySelectorAll("[data-parallax]").forEach(w => {
        const img = w.querySelector("img");
        if (!img) return;
        const r = w.getBoundingClientRect();
        const vh = window.innerHeight;
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.transform = `scale(1.12) translateY(${progress * -80}px)`;
      });
    };
    if (!window.__parallaxBound) {
      window.__parallaxBound = true;
      window.addEventListener("scroll", tick, { passive: true });
      window.addEventListener("resize", tick, { passive: true });
    }
    tick();
  }

  function bindCursor() {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;
    if (matchMedia("(hover: none)").matches) {
      dot.style.display = "none"; ring.style.display = "none";
      return;
    }
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    const grow = () => ring.classList.add("grow");
    const shrink = () => ring.classList.remove("grow");
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .chip, .swatch, .insta-tile")) grow();
      else shrink();
    });
  }

  function bindCounters() {
    const els = document.querySelectorAll(".counter:not(.done)");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => { el.textContent = el.dataset.count; el.classList.add("done"); });
      return;
    }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        const target = Number(el.dataset.count);
        const decimal = Number(el.dataset.decimal || 0);
        const suffix = el.dataset.suffix || "";
        const dur = 1700;
        const start = performance.now();
        const step = (t) => {
          const p = Math.min((t - start) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const v = target * e;
          const out = decimal ? v.toFixed(decimal) : Math.floor(v).toLocaleString("en-IN");
          el.textContent = out + suffix;
          if (p < 1) requestAnimationFrame(step);
          else { el.textContent = (decimal ? target.toFixed(decimal) : target.toLocaleString("en-IN")) + suffix; el.classList.add("done"); }
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  }

  function bindCollage() {
    const stage = document.querySelector("[data-collage]");
    if (!stage || stage.dataset.bound) return;
    stage.dataset.bound = "1";
    const polaroids = stage.querySelectorAll(".polaroid");
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      polaroids.forEach(p => {
        const d = Number(p.dataset.depth || 0.02);
        const base = p.dataset.baseRotate || (p.style.getPropertyValue("--rot") || "0deg");
        p.style.setProperty("--mx", (x * d * 1000) + "px");
        p.style.setProperty("--my", (y * d * 1000) + "px");
        p.style.setProperty("--tilt", (x * 6) + "deg");
      });
    });
    stage.addEventListener("mouseleave", () => {
      polaroids.forEach(p => {
        p.style.setProperty("--mx", "0px");
        p.style.setProperty("--my", "0px");
        p.style.setProperty("--tilt", "0deg");
      });
    });
  }

  function bindMagnet() {
    document.querySelectorAll(".btn-magnet:not(.bound)").forEach(btn => {
      btn.classList.add("bound");
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  function dismissSplash() {
    const s = document.getElementById("splash");
    if (!s) return;
    if (sessionStorage.getItem("splashShown")) { s.remove(); return; }
    sessionStorage.setItem("splashShown", "1");
    document.body.classList.add("splash-on");
    setTimeout(() => {
      s.classList.add("done");
      document.body.classList.remove("splash-on");
      setTimeout(() => s.remove(), 900);
    }, 1700);
  }

  function afterRender() {
    bindTilt();
    bindReveal();
    bindParallax();
    bindCounters();
    bindCollage();
    bindMagnet();
  }

  function init() {
    dismissSplash();
    bindSearchSuggest();
    bindCursor();
    window.addEventListener("hashchange", () => { Router.render(); afterRender(); });
    Router.render();
    afterRender();
  }

  window.App = {
    init, updateHeader, toast, modal, closeModal, rerender,
    cartQty, cartSetQty, cartRemove, toggleWish, removeAddress,
    goSearch, downloadInvoice
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
