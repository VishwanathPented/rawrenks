/* Hash router */
(function () {
  const routes = [
    { re: /^#\/?$/,                                    render: () => Storefront.homeView() },
    { re: /^#\/shop$/,                                 render: () => Storefront.listingView({}) },
    { re: /^#\/shop\/([^?]+)$/,                        render: (m) => Storefront.listingView({ category: decodeURIComponent(m[1]) }) },
    { re: /^#\/search(\?.*)?$/,                        render: () => Storefront.listingView({}) },
    { re: /^#\/product\/([^?]+)$/,                     render: (m) => Storefront.detailView({ id: decodeURIComponent(m[1]) }), after: Storefront.bindDetail },
    { re: /^#\/cart$/,                                 render: () => Storefront.cartView(),         after: Storefront.bindCart },
    { re: /^#\/checkout$/,                             render: () => Storefront.checkoutView(),     after: Storefront.bindCheckout },
    { re: /^#\/orders$/,                               render: () => Storefront.ordersView() },
    { re: /^#\/order\/([^?]+)$/,                       render: (m) => Storefront.orderDetailView({ id: decodeURIComponent(m[1]) }) },
    { re: /^#\/wishlist$/,                             render: () => Storefront.wishlistView() },
    { re: /^#\/profile$/,                              render: () => Storefront.profileView({ tab: "info" }),       after: Storefront.bindProfile },
    { re: /^#\/profile\/orders$/,                      render: () => Storefront.profileView({ tab: "orders" }),     after: Storefront.bindProfile },
    { re: /^#\/profile\/addresses$/,                   render: () => Storefront.profileView({ tab: "addresses" }),  after: Storefront.bindProfile },
    { re: /^#\/login$/,                                render: () => Auth.loginView(),  after: Auth.bindLogin },
    { re: /^#\/signup$/,                               render: () => Auth.signupView(), after: Auth.bindSignup },
    { re: /^#\/forgot$/,                               render: () => Auth.forgotView(), after: Auth.bindForgot },
    { re: /^#\/admin$/,                                render: () => Admin.dashboardView() },
    { re: /^#\/admin\/products$/,                      render: () => Admin.productsView(),  after: Admin.bindProducts },
    { re: /^#\/admin\/inventory$/,                     render: () => Admin.inventoryView(), after: Admin.bindInventory },
    { re: /^#\/admin\/orders$/,                        render: () => Admin.ordersAdminView() },
    { re: /^#\/admin\/users$/,                         render: () => Admin.usersView() },
    { re: /^#\/admin\/coupons$/,                       render: () => Admin.couponsView() },
    { re: /^#\/admin\/banners$/,                       render: () => Admin.bannersView() },
    { re: /^#\/admin\/reviews$/,                       render: () => Admin.reviewsView() },
    { re: /^#\/admin\/analytics$/,                     render: () => Admin.analyticsView() }
  ];

  function bindListingIfNeeded(hash) {
    if (/^#\/shop/.test(hash) || /^#\/search/.test(hash)) Storefront.bindListing();
  }

  function render() {
    const hash = location.hash || "#/";
    const base = hash.split("?")[0];

    let matched = null, m = null;
    for (const r of routes) {
      const mm = base.match(r.re);
      if (mm) { matched = r; m = mm; break; }
    }

    const view = document.getElementById("view");
    if (matched) {
      view.innerHTML = matched.render(m);
      if (matched.after) matched.after(m);
      bindListingIfNeeded(hash);
    } else if (base.startsWith("#/search")) {
      view.innerHTML = Storefront.listingView({});
      Storefront.bindListing();
    } else {
      view.innerHTML = `<div class="empty-state"><h3>Page not found</h3><a class="btn-primary" href="#/">Go home</a></div>`;
    }

    window.scrollTo(0, 0);
    App.updateHeader();
  }

  window.Router = { render };
})();
