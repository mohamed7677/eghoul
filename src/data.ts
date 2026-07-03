import { MenuItem, ExtraOption, Category } from "./types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "all",
    name: "الكل",
    nameAr: "الكل",
    nameEn: "All",
    icon: "Flame",
    displayOrder: 0,
    isHidden: false
  },
  {
    id: "beef",
    name: "لحم بقري",
    nameAr: "لحم بقري",
    nameEn: "Beef Burgers",
    icon: "Beef",
    displayOrder: 1,
    isHidden: false
  },
  {
    id: "chicken",
    name: "دجاج مقرمش",
    nameAr: "دجاج مقرمش",
    nameEn: "Crispy Chicken",
    icon: "FlameKindling",
    displayOrder: 2,
    isHidden: false
  },
  {
    id: "sides",
    name: "المقبلات والبطاطس",
    nameAr: "المقبلات والبطاطس",
    nameEn: "Sides & Fries",
    icon: "ChefHat",
    displayOrder: 3,
    isHidden: false
  },
  {
    id: "drinks",
    name: "المشروبات والإنعاش",
    nameAr: "المشروبات والإنعاش",
    nameEn: "Drinks",
    icon: "GlassWater",
    displayOrder: 4,
    isHidden: false
  }
];

export const MENU_ITEMS: MenuItem[] = [
  // BEEF BURGERS
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
  // CHICKEN BURGERS
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

export const EXTRA_OPTIONS: ExtraOption[] = [
  // CHEESE
  {
    id: "extra-grave-cheddar",
    name: "شيدر المقبرة السايحة",
    price: 25.00,
    category: "cheese",
    description: "شريحة مزدوجة من جبن الشيدر المعتق المدخن",
    isEnabled: true,
    maxQuantity: 3,
    availability: "in-stock"
  },
  {
    id: "extra-asylum-mozzarella",
    name: "قرص موزاريلا المصحة الرائع",
    price: 30.00,
    category: "cheese",
    description: "حلقة موزاريلا سميكة ذائبة ومقرمشة",
    isEnabled: true,
    maxQuantity: 2,
    availability: "in-stock"
  },
  // FRIES
  {
    id: "extra-demon-fries",
    name: "بطاطس الشياطين الحارة",
    price: 45.00,
    category: "fries",
    description: "بطاطس مقرمشة متبلة بخلطة بهارات الغول الحارة السرية",
    isEnabled: true,
    maxQuantity: 4,
    availability: "in-stock"
  },
  {
    id: "extra-salted-skin",
    name: "بطاطس المقابر المملحة",
    price: 40.00,
    category: "fries",
    description: "بطاطس كلاسيكية ساخنة ومملحة بعناية",
    isEnabled: true,
    maxQuantity: 4,
    availability: "in-stock"
  },
  // SAUCES
  {
    id: "extra-sriracha-dip",
    name: "مايونيز السيراتشا الدموي",
    price: 15.00,
    category: "sauce",
    description: "غموس كريمي حار برونزي النكهة",
    isEnabled: true,
    maxQuantity: 5,
    availability: "in-stock"
  },
  {
    id: "extra-bone-marrow-aioli",
    name: "ثومية نخاع العظام الفاخرة",
    price: 15.00,
    category: "sauce",
    description: "توليفة غنية بنكهة الثوم المشوي والمدخن",
    isEnabled: true,
    maxQuantity: 5,
    availability: "in-stock"
  },
  // DRINKS
  {
    id: "extra-liquid-darkness",
    name: "الظلام السائل (كولا)",
    price: 30.00,
    category: "drink",
    description: "كولا كلاسيكية مثلجة ومنعشة",
    isEnabled: true,
    maxQuantity: 6,
    availability: "in-stock"
  },
  {
    id: "extra-crimson-elixir",
    name: "إكسير الكرز الأحمر الفوار",
    price: 30.00,
    category: "drink",
    description: "مشروب صودا الكرز الفوارة بلون الدم الأحمر",
    isEnabled: true,
    maxQuantity: 6,
    availability: "in-stock"
  },
  {
    id: "extra-sacred-water",
    name: "مياه الينابيع المقدسة",
    price: 25.00,
    category: "drink",
    description: "مياه ينابيع طبيعية نقية مثلجة وخالية من الشوائب",
    isEnabled: true,
    maxQuantity: 6,
    availability: "in-stock"
  }
];
