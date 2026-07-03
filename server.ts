import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Ensure local persistence data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const EXTRAS_FILE = path.join(DATA_DIR, "extras.json");
const DISCOUNTS_FILE = path.join(DATA_DIR, "discounts.json");
const MEDIA_FILE = path.join(DATA_DIR, "media.json");
const COUPONS_FILE = path.join(DATA_DIR, "coupons.json");

// Helper to read JSON files safely
function readJSONFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to write JSON files safely
function writeJSONFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}

// Express middlewares
app.use(express.json({ limit: "25mb" })); // Increase limit for media library base64 uploads

// =================================================================
// DATA STORAGE INITIALIZATION WITH DEFAULT AL-GHOUL THEMATIC DATA
// =================================================================

const INITIAL_CATEGORIES = [
  { id: "all", name: "الكل", nameAr: "الكل", nameEn: "All", icon: "Flame", displayOrder: 0, isHidden: false },
  { id: "beef", name: "لحم بقري", nameAr: "لحم بقري", nameEn: "Beef Burgers", icon: "Beef", displayOrder: 1, isHidden: false },
  { id: "chicken", name: "دجاج مقرمش", nameAr: "دجاج مقرمش", nameEn: "Crispy Chicken", icon: "FlameKindling", displayOrder: 2, isHidden: false },
  { id: "sides", name: "المقبلات والبطاطس", nameAr: "المقبلات والبطاطس", nameEn: "Sides & Fries", icon: "ChefHat", displayOrder: 3, isHidden: false },
  { id: "drinks", name: "المشروبات والإنعاش", nameAr: "المشروبات والإنعاش", nameEn: "Drinks", icon: "GlassWater", displayOrder: 4, isHidden: false }
];

const INITIAL_EXTRAS = [
  { id: "extra-grave-cheddar", name: "شيدر المقبرة السايحة", price: 25.00, category: "cheese", description: "شريحة مزدوجة من جبن الشيدر المعتق المدخن", isEnabled: true, maxQuantity: 3, availability: "in-stock" },
  { id: "extra-asylum-mozzarella", name: "قرص موزاريلا المصحة الرائع", price: 30.00, category: "cheese", description: "حلقة موزاريلا سميكة ذائبة ومقرمشة", isEnabled: true, maxQuantity: 2, availability: "in-stock" },
  { id: "extra-demon-fries", name: "بطاطس الشياطين الحارة", price: 45.00, category: "fries", description: "بطاطس مقرمشة متبلة بخلطة بهارات الغول الحارة السرية", isEnabled: true, maxQuantity: 4, availability: "in-stock" },
  { id: "extra-salted-skin", name: "بطاطس المقابر المملحة", price: 40.00, category: "fries", description: "بطاطس كلاسيكية ساخنة ومملحة بعناية", isEnabled: true, maxQuantity: 4, availability: "in-stock" },
  { id: "extra-sriracha-dip", name: "مايونيز السيراتشا الدموي", price: 15.00, category: "sauce", description: "غموس كريمي حار برونزي النكهة", isEnabled: true, maxQuantity: 5, availability: "in-stock" },
  { id: "extra-bone-marrow-aioli", name: "ثومية نخاع العظام الفاخرة", price: 15.00, category: "sauce", description: "توليفة غنية بنكهة الثوم المشوي والمدخن", isEnabled: true, maxQuantity: 5, availability: "in-stock" },
  { id: "extra-liquid-darkness", name: "الظلام السائل (كولا)", price: 30.00, category: "drink", description: "كولا كلاسيكية مثلجة ومنعشة", isEnabled: true, maxQuantity: 6, availability: "in-stock" },
  { id: "extra-crimson-elixir", name: "إكسير الكرز الأحمر الفوار", price: 30.00, category: "drink", description: "مشروب صودا الكرز الفوارة بلون الدم الأحمر", isEnabled: true, maxQuantity: 6, availability: "in-stock" },
  { id: "extra-sacred-water", name: "مياه الينابيع المقدسة", price: 25.00, category: "drink", description: "مياه ينابيع طبيعية نقية مثلجة وخالية من الشوائب", isEnabled: true, maxQuantity: 6, availability: "in-stock" }
];

const INITIAL_MENU = [
  {
    id: "beef-ghoul-prime",
    name: "برجر الغول الأصلي (GHOUL PRIME)",
    nameAr: "برجر الغول الأصلي (GHOUL PRIME)",
    nameEn: "Ghoul Prime Burger",
    description: "200 جرام من لحم البقر الفاخر المعتق، جبن شيدر مدخن، مربى الطماطم والبلوبيري حمراء كالدماء، صوص ثومية نخاع العظام الفريد، بصل مقرمش ذهبي، يقدم في خبز الفحم الأسود البركاني.",
    descriptionAr: "200 جرام من لحم البقر الفاخر المعتق، جبن شيدر مدخن، مربى الطماطم والبلوبيري حمراء كالدماء، صوص ثومية نخاع العظام الفريد، بصل مقرمش ذهبي، يقدم في خبز الفحم الأسود البركاني.",
    descriptionEn: "200g of aged premium beef, smoked cheddar cheese, blood-red tomato & blueberry jam, bone marrow aioli, crispy golden onions, served in volcano black charcoal bun.",
    price: 195.00,
    originalPrice: 220.00,
    type: "beef",
    category: "beef",
    image: "/src/assets/images/beef_ghoul_prime_1782719474235.jpg",
    images: [
      "/src/assets/images/beef_ghoul_prime_1782719474235.jpg"
    ],
    spicyLevel: 1,
    availability: "in-stock",
    prepTime: 15,
    calories: 820,
    ingredients: ["لحم بقري فاخر", "جبن شيدر مدخن", "مربى الطماطم والبلوبيري", "ثومية نخاع العظام", "بصل مقرمش", "خبز الفحم البركاني"],
    allergens: ["الجلوتين", "اللاكتوز"],
    popularBadge: true,
    bestSellerBadge: true,
    displayOrder: 1,
    variants: [
      { id: "v1", name: "فردي (Single)", price: 195.00, calories: 820, availability: "in-stock" },
      { id: "v2", name: "ثنائي (Double)", price: 260.00, calories: 1180, availability: "in-stock" },
      { id: "v3", name: "ثلاثي (Triple)", price: 320.00, calories: 1540, availability: "in-stock" }
    ],
    discount: {
      id: "disc-ghoul",
      type: "percentage",
      value: 10,
      isActive: true,
      badgeType: "Hot Deal"
    }
  },
  {
    id: "beef-cemetery-smoke",
    name: "دخان المقابر (CEMETERY SMOKE)",
    nameAr: "دخان المقابر (CEMETERY SMOKE)",
    nameEn: "Cemetery Smoke Burger",
    description: "200 جرام لحم بقري مشوي مدخن بخشب الهيكوري، بيكن بقري مقرمش بصلصة القيقب، باربكيو الشيبوتلي البرونزي الحارق، فلفل هالبينو مشتعل، وجبن شيدر سائل متفجر.",
    descriptionAr: "200 جرام لحم بقري مشوي مدخن بخشب الهيكوري، بيكن بقري مقرمش بصلصة القيقب، باربكيو الشيبوتلي البرونزي الحارق، فلفل هالبينو مشتعل، وجبن شيدر سائل متفجر.",
    descriptionEn: "200g wood-fired hickory-smoked beef patty, crispy maple beef bacon, sizzling chipotle BBQ sauce, fiery jalapeños, and explosive melted cheddar cheese.",
    price: 215.00,
    type: "beef",
    category: "beef",
    image: "/src/assets/images/beef_cemetery_1782719498845.jpg",
    images: [
      "/src/assets/images/beef_cemetery_1782719498845.jpg"
    ],
    spicyLevel: 2,
    availability: "in-stock",
    prepTime: 20,
    calories: 950,
    ingredients: ["لحم بقري مدخن هيدرولي", "بيكن بقري بالقيقب", "صلصة باربكيو الشيبوتلي", "هالبينو مشتعل", "جبن شيدر سائل"],
    allergens: ["اللاكتوز"],
    bestSellerBadge: true,
    displayOrder: 2,
    variants: [
      { id: "v1", name: "فردي (Single)", price: 215.00, calories: 950, availability: "in-stock" },
      { id: "v2", name: "ثنائي (Double)", price: 285.00, calories: 1350, availability: "in-stock" }
    ]
  },
  {
    id: "beef-vampire-slayer",
    name: "صائد الفامباير (VAMPIRE SLAYER)",
    nameAr: "صائد الفامباير (VAMPIRE SLAYER)",
    nameEn: "Vampire Slayer Burger",
    description: "شريحة لحم بقري مشوية على لهب حارق، طبقة مزدوجة من جبنة الجودا السايحة، صلصة الثوم والأعشاب القوية، طماطم مشوية طازجة، وجرجير بري منسق.",
    descriptionAr: "شريحة لحم بقري مشوية على لهب حارق، طبقة مزدوجة من جبنة الجودا السايحة، صلصة الثوم والأعشاب القوية، طماطم مشوية طازجة، وجرجير بري منسق.",
    descriptionEn: "Flame-grilled beef patty, double gouda cheese layer, powerful roasted garlic & herb sauce, grilled fresh tomatoes, and wild forest arugula.",
    price: 185.00,
    type: "beef",
    category: "beef",
    image: "/src/assets/images/beef_vampire_slayer_1782719516534.jpg",
    spicyLevel: 0,
    availability: "in-stock",
    prepTime: 12,
    calories: 780,
    ingredients: ["لحم بقري بلدي", "جبن جودا معتق", "ثوم مشوي فاخر", "أوراق جرجير بري", "طماطم مشوية"],
    allergens: ["اللاكتوز", "الجلوتين"],
    newBadge: true,
    displayOrder: 3
  },
  {
    id: "chicken-phantom-crunch",
    name: "قرمشة الفانتوم (PHANTOM CRUNCH)",
    nameAr: "قرمشة الفانتوم (PHANTOM CRUNCH)",
    nameEn: "Phantom Crunch Chicken",
    description: "صدر دجاج مقرمش للغاية بخلطة البترميلك مغموس في تتبيلة فلفل الشبح الحارة (Ghost Pepper)، خردل العسل البرونزي الحارق، وسلطة كولسلو الغول المقرمشة في خبز أبيض بلون العظام.",
    descriptionAr: "صدر دجاج مقرمش للغاية بخلطة البترميلك مغموس في تتبيلة فلفل الشبح الحارة (Ghost Pepper)، خردل العسل البرونزي الحارق، وسلطة كولسلو الغول المقرمشة في خبز أبيض بلون العظام.",
    descriptionEn: "Super-crispy buttermilk chicken breast dipped in Ghost Pepper dust, fiery honey mustard, and Ghoul's custom crunchy coleslaw on an bone-white bun.",
    price: 175.00,
    originalPrice: 190.00,
    type: "chicken",
    category: "chicken",
    image: "/src/assets/images/chicken_phantom_1782719488356.jpg",
    spicyLevel: 3,
    availability: "in-stock",
    prepTime: 15,
    calories: 710,
    ingredients: ["صدر دجاج مقرمش", "تتبيلة فلفل الشبح", "خردل العسل البرونزي", "كولسلو الغول", "خبز العظام الأبيض"],
    allergens: ["الجلوتين", "الخردل"],
    popularBadge: true,
    displayOrder: 4,
    discount: {
      id: "disc-phantom",
      type: "fixed",
      value: 15,
      isActive: true,
      badgeType: "Limited Time"
    }
  },
  {
    id: "chicken-asylum-hot",
    name: "دجاج المصحة الحار (ASYLUM HOT CHICKEN)",
    nameAr: "دجاج المصحة الحار (ASYLUM HOT CHICKEN)",
    nameEn: "Asylum Hot Chicken",
    description: "دجاج مقلي متبل بغبار شطة الجوست الحار، شيدر سايحة مرعبة، قطع خيار مخلل مقرمشة، مايونيز السيراتشا الدموي، وخس طازج مفروم.",
    descriptionAr: "دجاج مقلي متبل بغبار شطة الجوست الحار، شيدر سايحة مرعبة، قطع خيار مخلل مقرمشة، مايونيز السيراتشا الدموي، وخس طازج مفروم.",
    descriptionEn: "Crispy fried chicken seasoned with ghost pepper dust, terrifying melted cheddar, crunchy pickle chips, blood-red sriracha mayo, and fresh shredded lettuce.",
    price: 180.00,
    type: "chicken",
    category: "chicken",
    image: "/src/assets/images/chicken_asylum_hot_1782719529007.jpg",
    spicyLevel: 3,
    availability: "in-stock",
    prepTime: 14,
    calories: 730,
    ingredients: ["دجاج المصحة المقرمش", "شيدر سائلة", "قطع خيار مخلل", "مايونيز السيراتشا", "خس مفروم"],
    allergens: ["الجلوتين", "اللاكتوز"],
    displayOrder: 5
  },
  {
    id: "chicken-soul-snatcher",
    name: "خاطف الأرواح (SOUL SNATCHER)",
    nameAr: "خاطف الأرواح (SOUL SNATCHER)",
    nameEn: "Soul Snatcher Chicken",
    description: "صدر دجاج متبل بالأعشاب اللطيفة، موزاريلا بيضاء سايحة، مايونيز برائحة الترافل الفاخر، وأوراق ريحان طازجة، يقدم في خبز البريوش الفاخر.",
    descriptionAr: "صدر دجاج متبل بالأعشاب اللطيفة، موزاريلا بيضاء سايحة، مايونيز برائحة الترافل الفاخر، وأوراق ريحان طازجة، يقدم في خبز البريوش الفاخر.",
    descriptionEn: "Herbed tender chicken breast, melted white mozzarella, premium truffle-infused mayo, and fresh basil leaves, cradled in a buttery toasted brioche bun.",
    price: 165.00,
    type: "chicken",
    category: "chicken",
    image: "/src/assets/images/chicken_soul_snatcher_1782719542788.jpg",
    spicyLevel: 0,
    availability: "in-stock",
    prepTime: 10,
    calories: 640,
    ingredients: ["صدر دجاج مشوي بالأعشاب", "موزاريلا بيضاء سايحة", "مايونيز الترافل الأسود", "أوراق ريحان بري"],
    allergens: ["اللاكتوز", "الجلوتين"],
    displayOrder: 6
  }
];

const INITIAL_MEDIA = [
  { id: "m1", name: "برجر الغول الأصلي", url: "/src/assets/images/beef_ghoul_prime_1782719474235.jpg" },
  { id: "m2", name: "دخان المقابر", url: "/src/assets/images/beef_cemetery_1782719498845.jpg" },
  { id: "m3", name: "قرمشة الفانتوم", url: "/src/assets/images/chicken_phantom_1782719488356.jpg" },
  { id: "m4", name: "صائد الفامباير", url: "/src/assets/images/beef_vampire_slayer_1782719516534.jpg" },
  { id: "m5", name: "دجاج المصحة الحار", url: "/src/assets/images/chicken_asylum_hot_1782719529007.jpg" },
  { id: "m6", name: "خاطف الأرواح", url: "/src/assets/images/chicken_soul_snatcher_1782719542788.jpg" }
];

const INITIAL_COUPONS = [
  { code: "GHOUL20", type: "percentage", value: 20, minOrder: 150, isActive: true, description: "خصم الغول المئوي الممتاز ٢٠٪ للطلبات فوق ١٥٠ ج.م" },
  { code: "BLOOD50", type: "fixed", value: 50, minOrder: 200, isActive: true, description: "خصم دماء الغول بقيمة ٥٠ ج.م للطلبات فوق ٢٠٠ ج.م" },
  { code: "FANTOM15", type: "percentage", value: 15, minOrder: 100, isActive: true, description: "خصم شبح الفانتوم بقيمة ١٥٪ للطلبات فوق ١٠٠ ج.م" }
];

// Initialize local JSON collections on startup if they do not exist
if (!fs.existsSync(MENU_FILE)) writeJSONFile(MENU_FILE, INITIAL_MENU);
if (!fs.existsSync(CATEGORIES_FILE)) writeJSONFile(CATEGORIES_FILE, INITIAL_CATEGORIES);
if (!fs.existsSync(EXTRAS_FILE)) writeJSONFile(EXTRAS_FILE, INITIAL_EXTRAS);
if (!fs.existsSync(DISCOUNTS_FILE)) writeJSONFile(DISCOUNTS_FILE, []);
if (!fs.existsSync(MEDIA_FILE)) writeJSONFile(MEDIA_FILE, INITIAL_MEDIA);
if (!fs.existsSync(COUPONS_FILE)) writeJSONFile(COUPONS_FILE, INITIAL_COUPONS);

// Helper to check and expire discounts automatically
function checkAndExpireDiscounts(items: any[]): any[] {
  const now = new Date();
  let modified = false;
  
  const updatedItems = items.map(item => {
    if (item.discount && item.discount.isActive) {
      // Check date constraints if defined
      if (item.discount.endDate) {
        const end = new Date(item.discount.endDate);
        if (now > end) {
          modified = true;
          return {
            ...item,
            discount: {
              ...item.discount,
              isActive: false
            }
          };
        }
      }
      if (item.discount.startDate) {
        const start = new Date(item.discount.startDate);
        if (now < start) {
          modified = true;
          return {
            ...item,
            discount: {
              ...item.discount,
              isActive: false // not yet active
            }
          };
        }
      }
    }
    return item;
  });

  if (modified) {
    writeJSONFile(MENU_FILE, updatedItems);
  }
  return updatedItems;
}

// =================================================================
// API ROUTES
// =================================================================

// 1. Get Settings
app.get("/api/settings", (req, res) => {
  const settings = readJSONFile(SETTINGS_FILE, { googleAppsScriptUrl: "" });
  res.json(settings);
});

// 2. Save Settings
app.post("/api/settings", (req, res) => {
  const { googleAppsScriptUrl } = req.body;
  const settings = { googleAppsScriptUrl: googleAppsScriptUrl || "" };
  writeJSONFile(SETTINGS_FILE, settings);
  res.json({ status: "success", settings });
});

// 3. Get all orders
app.get("/api/orders", (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, []);
  const sortedOrders = [...orders].sort(
    (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json(sortedOrders);
});

// 4. Get order by ID
app.get("/api/orders/:id", (req, res) => {
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const order = orders.find((o) => o.orderId === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});

// 5. Update order status
app.post("/api/orders/update-status", (req, res) => {
  const { orderId, status } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ error: "orderId and status are required" });
  }
  
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  const index = orders.findIndex((o) => o.orderId === orderId);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  
  orders[index].status = status;
  writeJSONFile(ORDERS_FILE, orders);
  
  // Forward to Google Sheets if configured
  const settings = readJSONFile(SETTINGS_FILE, { googleAppsScriptUrl: "" });
  if (settings.googleAppsScriptUrl) {
    const order = orders[index];
    const itemsStr = order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
    const extrasStr = order.extras.join(", ");
    
    fetch(settings.googleAppsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        orderId: order.orderId,
        name: order.name,
        phone: order.phone,
        items: itemsStr,
        extras: extrasStr,
        totalPrice: order.totalPrice,
        timestamp: order.timestamp,
        status: order.status,
        action: "updateStatus"
      })
    }).catch(err => console.error("Error forwarding status update to Apps Script:", err));
  }
  
  res.json({ status: "success", order: orders[index] });
});

// 6. Submit a new order
app.post("/api/orders", async (req, res) => {
  const { name, phone, address, items, extras, totalPrice } = req.body;
  
  if (!name || !phone || !items || items.length === 0) {
    return res.status(400).json({ error: "Name, phone, and items are required" });
  }
  
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const randomChars = "XYZKMR".charAt(Math.floor(Math.random() * 6));
  const orderId = `GHL-${randomDigits}-${randomChars}`;
  
  const newOrder = {
    orderId,
    name,
    phone,
    address: address || "Dine In / Pick Up",
    items,
    extras: extras || [],
    totalPrice: parseFloat(totalPrice) || 0,
    timestamp: new Date().toISOString(),
    status: "New"
  };
  
  const orders = readJSONFile<any[]>(ORDERS_FILE, []);
  orders.push(newOrder);
  writeJSONFile(ORDERS_FILE, orders);
  
  const settings = readJSONFile(SETTINGS_FILE, { googleAppsScriptUrl: "" });
  if (settings.googleAppsScriptUrl) {
    const itemsStr = items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ");
    const extrasStr = (extras || []).join(", ");
    
    fetch(settings.googleAppsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        orderId: newOrder.orderId,
        name: newOrder.name,
        phone: newOrder.phone,
        items: itemsStr,
        extras: extrasStr,
        totalPrice: newOrder.totalPrice,
        timestamp: newOrder.timestamp,
        status: newOrder.status
      })
    })
    .then((response) => console.log(`Forwarded order. Status: ${response.status}`))
    .catch((err) => console.error("Failed to forward order to Google Sheets:", err.message));
  }
  
  res.status(201).json(newOrder);
});


// ── DYNAMIC MENU API (CRUD & DUPLICATION) ──

app.get("/api/menu", (req, res) => {
  let menu = readJSONFile<any[]>(MENU_FILE, INITIAL_MENU);
  menu = checkAndExpireDiscounts(menu);
  // Sort by displayOrder ascending
  const sortedMenu = [...menu].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(sortedMenu);
});

app.post("/api/menu", (req, res) => {
  const item = req.body;
  if (!item.id) {
    return res.status(400).json({ error: "Item id is required" });
  }
  
  const menu = readJSONFile<any[]>(MENU_FILE, INITIAL_MENU);
  const index = menu.findIndex((m) => m.id === item.id);
  
  if (index === -1) {
    // New item
    menu.push(item);
  } else {
    // Update existing item
    menu[index] = { ...menu[index], ...item };
  }
  
  writeJSONFile(MENU_FILE, menu);
  res.json({ status: "success", item });
});

app.post("/api/menu/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  
  const menu = readJSONFile<any[]>(MENU_FILE, INITIAL_MENU);
  const updatedMenu = menu.filter((m) => m.id !== id);
  writeJSONFile(MENU_FILE, updatedMenu);
  res.json({ status: "success", id });
});

app.post("/api/menu/duplicate", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  
  const menu = readJSONFile<any[]>(MENU_FILE, INITIAL_MENU);
  const original = menu.find((m) => m.id === id);
  if (!original) {
    return res.status(404).json({ error: "Original item not found" });
  }
  
  const duplicate = {
    ...original,
    id: `${original.id}-copy-${Date.now()}`,
    name: `${original.name} (نسخة)`,
    nameAr: `${original.nameAr || original.name} (نسخة)`,
    nameEn: `${original.nameEn || original.name} (Copy)`,
    displayOrder: (original.displayOrder || 0) + 1
  };
  
  menu.push(duplicate);
  writeJSONFile(MENU_FILE, menu);
  res.json({ status: "success", item: duplicate });
});


// ── DYNAMIC CATEGORIES API ──

app.get("/api/categories", (req, res) => {
  const categories = readJSONFile<any[]>(CATEGORIES_FILE, INITIAL_CATEGORIES);
  const sorted = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  res.json(sorted);
});

app.post("/api/categories", (req, res) => {
  const category = req.body;
  if (!category.id) {
    return res.status(400).json({ error: "Category id is required" });
  }
  
  const categories = readJSONFile<any[]>(CATEGORIES_FILE, INITIAL_CATEGORIES);
  const index = categories.findIndex((c) => c.id === category.id);
  
  if (index === -1) {
    categories.push(category);
  } else {
    categories[index] = { ...categories[index], ...category };
  }
  
  writeJSONFile(CATEGORIES_FILE, categories);
  res.json({ status: "success", category });
});

app.post("/api/categories/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  
  const categories = readJSONFile<any[]>(CATEGORIES_FILE, INITIAL_CATEGORIES);
  const updated = categories.filter((c) => c.id !== id);
  writeJSONFile(CATEGORIES_FILE, updated);
  res.json({ status: "success", id });
});


// ── DYNAMIC EXTRAS / ADD-ONS API ──

app.get("/api/extras", (req, res) => {
  const extras = readJSONFile<any[]>(EXTRAS_FILE, INITIAL_EXTRAS);
  res.json(extras);
});

app.post("/api/extras", (req, res) => {
  const extra = req.body;
  if (!extra.id) {
    return res.status(400).json({ error: "Extra id is required" });
  }
  
  const extras = readJSONFile<any[]>(EXTRAS_FILE, INITIAL_EXTRAS);
  const index = extras.findIndex((e) => e.id === extra.id);
  
  if (index === -1) {
    extras.push(extra);
  } else {
    extras[index] = { ...extras[index], ...extra };
  }
  
  writeJSONFile(EXTRAS_FILE, extras);
  res.json({ status: "success", extra });
});

app.post("/api/extras/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  
  const extras = readJSONFile<any[]>(EXTRAS_FILE, INITIAL_EXTRAS);
  const updated = extras.filter((e) => e.id !== id);
  writeJSONFile(EXTRAS_FILE, updated);
  res.json({ status: "success", id });
});


// ── MEDIA LIBRARY API ──

app.get("/api/media", (req, res) => {
  const media = readJSONFile<any[]>(MEDIA_FILE, INITIAL_MEDIA);
  res.json(media);
});

app.post("/api/media/upload", (req, res) => {
  const { name, url, size, type } = req.body;
  if (!url || !name) {
    return res.status(400).json({ error: "url and name are required" });
  }
  
  const media = readJSONFile<any[]>(MEDIA_FILE, INITIAL_MEDIA);
  const newItem = {
    id: `media-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    url,
    size: size || "N/A",
    type: type || "image/jpeg"
  };
  
  media.unshift(newItem); // put at start
  writeJSONFile(MEDIA_FILE, media);
  res.json({ status: "success", item: newItem });
});

app.post("/api/media/delete", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Id is required" });
  }
  
  const media = readJSONFile<any[]>(MEDIA_FILE, INITIAL_MEDIA);
  const updated = media.filter((m) => m.id !== id);
  writeJSONFile(MEDIA_FILE, updated);
  res.json({ status: "success", id });
});


// ── DYNAMIC COUPONS API ──

app.get("/api/coupons", (req, res) => {
  const coupons = readJSONFile<any[]>(COUPONS_FILE, INITIAL_COUPONS);
  res.json(coupons);
});

app.post("/api/coupons", (req, res) => {
  const coupon = req.body;
  if (!coupon.code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }
  
  const coupons = readJSONFile<any[]>(COUPONS_FILE, INITIAL_COUPONS);
  const index = coupons.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
  
  const processedCoupon = {
    code: coupon.code.toUpperCase(),
    type: coupon.type || "percentage",
    value: parseFloat(coupon.value) || 0,
    minOrder: parseFloat(coupon.minOrder) || 0,
    isActive: coupon.isActive !== false,
    description: coupon.description || ""
  };

  if (index === -1) {
    coupons.push(processedCoupon);
  } else {
    coupons[index] = processedCoupon;
  }
  
  writeJSONFile(COUPONS_FILE, coupons);
  res.json({ status: "success", coupon: processedCoupon });
});

app.post("/api/coupons/delete", (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  const coupons = readJSONFile<any[]>(COUPONS_FILE, INITIAL_COUPONS);
  const updated = coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  writeJSONFile(COUPONS_FILE, updated);
  res.json({ status: "success", code });
});

app.post("/api/coupons/validate", (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  const coupons = readJSONFile<any[]>(COUPONS_FILE, INITIAL_COUPONS);
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  
  if (!coupon) {
    return res.status(404).json({ error: "كود الخصم غير موجود أو انتهت صلاحيته 💀" });
  }
  
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ 
      error: `الحد الأدنى لاستخدام هذا الميثاق هو ${coupon.minOrder} ج.م. قيمة وليمتك الحالية ${subtotal} ج.م.` 
    });
  }
  
  res.json({ status: "success", coupon });
});


// Vite Middleware Integration & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AL-GHOUL Burger Kitchen server running on http://localhost:${PORT}`);
  });
}

startServer();
