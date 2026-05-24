/* Seed data + localStorage helpers */
(function () {
  const STORAGE_KEY = "rawrenks_db_v2";

  const BRANDS = ["Northwind", "Marlow", "Kairo", "Velura", "Pacecraft", "Sundown", "Linenly", "Stoneside"];
  const CATEGORIES = ["Men", "Women", "Kids", "Accessories"];
  const COLORS = [
    { name: "Black", hex: "#111111" },
    { name: "White", hex: "#f5f5f5" },
    { name: "Navy", hex: "#1e3a8a" },
    { name: "Olive", hex: "#556b2f" },
    { name: "Beige", hex: "#d2b48c" },
    { name: "Red", hex: "#dc2626" },
    { name: "Pink", hex: "#f472b6" },
    { name: "Grey", hex: "#9ca3af" },
    { name: "Brown", hex: "#7b4b2a" }
  ];
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
  const KID_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"];
  const ACC_SIZES = ["One Size"];

  const productSeeds = [
    { name: "Relaxed Linen Shirt", cat: "Men", brand: "Linenly", img: 1011, base: 2499, off: 30, tag: "Summer Collection" },
    { name: "Heritage Denim Jacket", cat: "Men", brand: "Marlow", img: 1027, base: 4499, off: 20, tag: "Best Sellers" },
    { name: "Tailored Cotton Chinos", cat: "Men", brand: "Stoneside", img: 1059, base: 1999, off: 25, tag: "New Arrivals" },
    { name: "Oversized Crewneck Tee", cat: "Men", brand: "Northwind", img: 1062, base: 999, off: 0, tag: "Trending" },
    { name: "Wool Blend Overcoat", cat: "Men", brand: "Velura", img: 1074, base: 7999, off: 35, tag: "Limited Edition" },
    { name: "Performance Track Pants", cat: "Men", brand: "Pacecraft", img: 1080, base: 1799, off: 15, tag: "Trending" },
    { name: "Striped Polo Shirt", cat: "Men", brand: "Northwind", img: 1084, base: 1499, off: 10, tag: "" },
    { name: "Slim Fit Cargo Pants", cat: "Men", brand: "Kairo", img: 1078, base: 2299, off: 20, tag: "New Arrivals" },

    { name: "Floral Wrap Midi Dress", cat: "Women", brand: "Sundown", img: 1005, base: 3299, off: 40, tag: "Summer Collection" },
    { name: "High-Waist Mom Jeans", cat: "Women", brand: "Marlow", img: 1014, base: 2499, off: 25, tag: "Best Sellers" },
    { name: "Knit Cardigan Sweater", cat: "Women", brand: "Velura", img: 1015, base: 1999, off: 0, tag: "New Arrivals" },
    { name: "Pleated Mini Skirt", cat: "Women", brand: "Linenly", img: 1025, base: 1499, off: 15, tag: "Trending" },
    { name: "Off-Shoulder Top", cat: "Women", brand: "Sundown", img: 1040, base: 1299, off: 30, tag: "Summer Collection" },
    { name: "Silk Camisole", cat: "Women", brand: "Velura", img: 1041, base: 1899, off: 20, tag: "Limited Edition" },
    { name: "Wide-Leg Trousers", cat: "Women", brand: "Stoneside", img: 1042, base: 2499, off: 10, tag: "" },
    { name: "Cropped Denim Jacket", cat: "Women", brand: "Marlow", img: 1066, base: 2999, off: 25, tag: "Best Sellers" },

    { name: "Kids Hooded Sweatshirt", cat: "Kids", brand: "Northwind", img: 1043, base: 999, off: 15, tag: "New Arrivals" },
    { name: "Cartoon Print Tee Pack", cat: "Kids", brand: "Sundown", img: 1044, base: 799, off: 30, tag: "Best Sellers" },
    { name: "Denim Dungarees", cat: "Kids", brand: "Marlow", img: 1050, base: 1499, off: 20, tag: "Trending" },
    { name: "Pastel Tutu Dress", cat: "Kids", brand: "Sundown", img: 1052, base: 1299, off: 25, tag: "Summer Collection" },

    { name: "Leather Crossbody Bag", cat: "Accessories", brand: "Velura", img: 1060, base: 3499, off: 30, tag: "Best Sellers" },
    { name: "Aviator Sunglasses", cat: "Accessories", brand: "Kairo", img: 1067, base: 1499, off: 20, tag: "Trending" },
    { name: "Woven Straw Hat", cat: "Accessories", brand: "Sundown", img: 1068, base: 899, off: 0, tag: "Summer Collection" },
    { name: "Minimalist Watch", cat: "Accessories", brand: "Stoneside", img: 1069, base: 4999, off: 15, tag: "Limited Edition" },
    { name: "Knit Beanie", cat: "Accessories", brand: "Northwind", img: 1070, base: 599, off: 10, tag: "" },
    { name: "Leather Belt", cat: "Accessories", brand: "Marlow", img: 1071, base: 1299, off: 20, tag: "" }
  ];

  function randomReviews(productName, count) {
    const samples = [
      { name: "Aarav S.", text: "Fits perfectly and the fabric feels premium.", rating: 5 },
      { name: "Priya M.", text: "Color was slightly different from photos but still nice.", rating: 4 },
      { name: "Rahul D.", text: "Excellent quality, fast delivery!", rating: 5 },
      { name: "Sneha K.", text: "Good, but the sizing runs a bit small.", rating: 3 },
      { name: "Vikram P.", text: "Definitely buying again. Loved it.", rating: 5 },
      { name: "Maya R.", text: "Affordable and stylish.", rating: 4 },
      { name: "Ishaan T.", text: "Comfortable for all-day wear.", rating: 4 },
      { name: "Neha J.", text: "Stitching could be better.", rating: 3 }
    ];
    const out = [];
    for (let i = 0; i < count; i++) {
      const s = samples[i % samples.length];
      out.push({
        id: "rv_" + productName.replace(/\s+/g, "") + "_" + i,
        author: s.name,
        rating: s.rating,
        text: s.text,
        date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
        approved: i < count - 1
      });
    }
    return out;
  }

  function buildProducts() {
    return productSeeds.map((p, idx) => {
      const id = "p_" + (idx + 1).toString().padStart(3, "0");
      const sizes = p.cat === "Kids" ? KID_SIZES.slice(0, 4) : p.cat === "Accessories" ? ACC_SIZES : SIZES.slice(1, 5);
      const colorPool = COLORS.slice((idx * 2) % COLORS.length, ((idx * 2) % COLORS.length) + 3).map(c => c.name);
      const price = p.base;
      const discountPrice = p.off ? Math.round(price * (1 - p.off / 100)) : 0;
      const images = [
        `https://picsum.photos/id/${p.img}/600/600`,
        `https://picsum.photos/id/${p.img + 1}/600/600`,
        `https://picsum.photos/id/${p.img + 2}/600/600`,
        `https://picsum.photos/id/${p.img + 3}/600/600`
      ];
      const stock = {};
      sizes.forEach(s => colorPool.forEach(c => { stock[s + "|" + c] = Math.floor(Math.random() * 18) + 2; }));
      return {
        id,
        name: p.name,
        brand: p.brand,
        category: p.cat,
        description: `${p.name} from ${p.brand}. Crafted from premium materials for everyday comfort and modern style. Easy to pair with the rest of your wardrobe — built to last.`,
        price,
        discountPrice,
        sizes,
        colors: colorPool,
        stock,
        images,
        tag: p.tag,
        rating: 3.8 + (idx % 12) / 10,
        reviews: randomReviews(p.name, 3 + (idx % 4)),
        views: 100 + Math.floor(Math.random() * 900),
        sold: Math.floor(Math.random() * 250),
        createdAt: new Date(Date.now() - idx * 86400000 * 2).toISOString()
      };
    });
  }

  function buildBanners() {
    return [
      {
        id: "b1",
        title: "summer, served warm",
        sub: "Linen, soft tones, sundown vibes. Built for the season — wear it once, keep it forever.",
        cta: "shop the drop",
        link: "#/shop?tag=Summer%20Collection",
        image: "https://picsum.photos/id/1015/1600/700",
        active: true
      },
      {
        id: "b2",
        title: "limited edition, no restocks",
        sub: "Once it's gone, it's gone. Premium picks that won't come back.",
        cta: "see what's left",
        link: "#/shop?tag=Limited%20Edition",
        image: "https://picsum.photos/id/1074/1600/700",
        active: false
      }
    ];
  }

  function buildCoupons() {
    return [
      { code: "SUMMER20", percent: 20, expires: "2026-09-30", active: true, used: 142 },
      { code: "FESTIVE50", percent: 50, expires: "2026-12-31", active: true, used: 38 },
      { code: "FIRST10", percent: 10, expires: "2027-01-01", active: true, used: 521 }
    ];
  }

  function buildOrders(userId) {
    const now = Date.now();
    return [
      {
        id: "ORD" + (1000 + 0),
        userId,
        items: [{ productId: "p_001", name: "Relaxed Linen Shirt", price: 1749, qty: 1, size: "M", color: "Beige", image: "https://picsum.photos/id/1011/200/200" }],
        subtotal: 1749, shipping: 0, tax: 87, discount: 0, total: 1836,
        address: { name: "Demo User", phone: "9999999999", line1: "123 Demo Street", city: "Mumbai", state: "MH", pincode: "400001" },
        payment: "UPI",
        status: "Delivered",
        createdAt: new Date(now - 86400000 * 20).toISOString(),
        history: [
          { status: "Order Placed", date: new Date(now - 86400000 * 20).toISOString() },
          { status: "Packed", date: new Date(now - 86400000 * 19).toISOString() },
          { status: "Shipped", date: new Date(now - 86400000 * 18).toISOString() },
          { status: "Out for Delivery", date: new Date(now - 86400000 * 17).toISOString() },
          { status: "Delivered", date: new Date(now - 86400000 * 17 + 3600000).toISOString() }
        ]
      },
      {
        id: "ORD" + 1001,
        userId,
        items: [{ productId: "p_009", name: "Floral Wrap Midi Dress", price: 1979, qty: 1, size: "S", color: "Pink", image: "https://picsum.photos/id/1005/200/200" }],
        subtotal: 1979, shipping: 0, tax: 99, discount: 198, total: 1880,
        address: { name: "Demo User", phone: "9999999999", line1: "123 Demo Street", city: "Mumbai", state: "MH", pincode: "400001" },
        payment: "Card",
        status: "Shipped",
        createdAt: new Date(now - 86400000 * 3).toISOString(),
        history: [
          { status: "Order Placed", date: new Date(now - 86400000 * 3).toISOString() },
          { status: "Packed", date: new Date(now - 86400000 * 2).toISOString() },
          { status: "Shipped", date: new Date(now - 86400000 * 1).toISOString() }
        ]
      }
    ];
  }

  function seedDB() {
    const demoUserId = "u_demo";
    return {
      products: buildProducts(),
      banners: buildBanners(),
      coupons: buildCoupons(),
      users: [
        {
          id: "u_admin",
          name: "Store Admin",
          email: "admin@rawrenks.com",
          password: "admin123",
          role: "admin",
          addresses: [],
          blocked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: demoUserId,
          name: "Demo User",
          email: "demo@rawrenks.com",
          password: "demo123",
          role: "customer",
          addresses: [
            { id: "a1", name: "Demo User", phone: "9999999999", line1: "123 Demo Street", city: "Mumbai", state: "MH", pincode: "400001", isDefault: true }
          ],
          blocked: false,
          createdAt: new Date().toISOString()
        }
      ],
      orders: buildOrders(demoUserId),
      session: { userId: null },
      meta: { brands: BRANDS, categories: CATEGORIES, colors: COLORS }
    };
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = seedDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch {
      const seed = seedDB();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
  }

  function save(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return load();
  }

  window.RawDB = {
    load, save, reset,
    COLORS, BRANDS, CATEGORIES, SIZES, KID_SIZES
  };
})();
