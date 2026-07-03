export interface ProductVariant {
  id: string;
  name: string; // e.g. "Single", "Double", "Triple"
  price: number;
  calories: number;
  ingredients?: string[];
  availability: "in-stock" | "out-of-stock";
}

export interface DiscountConfig {
  id: string;
  type: "percentage" | "fixed";
  value: number; // e.g., 15 for 15% or 25 for 25 EGP
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  badgeType: "Hot Deal" | "Limited Time" | "Sale" | "New Offer";
}

export interface MenuItem {
  id: string;
  name: string; // Arabic main display name
  nameAr: string;
  nameEn: string;
  description: string; // Arabic main description
  descriptionAr: string;
  descriptionEn: string;
  price: number; // active price
  originalPrice?: number; // for showing discount strikeout
  type: "beef" | "chicken"; // backward compatibility
  category: string; // references Category.id (e.g. "beef", "chicken", "sides", "drinks", etc.)
  image: string; // primary image URL or base64
  images?: string[]; // gallery images
  spicyLevel?: 0 | 1 | 2 | 3;
  availability: "in-stock" | "out-of-stock" | "low-stock";
  prepTime: number; // in minutes
  calories: number;
  ingredients: string[];
  allergens: string[];
  popularBadge?: boolean;
  bestSellerBadge?: boolean;
  newBadge?: boolean;
  featuredItem?: boolean;
  displayOrder: number;
  isArchived?: boolean;
  variants?: ProductVariant[];
  discount?: DiscountConfig;
}

export interface Category {
  id: string;
  name: string; // display name
  nameAr: string;
  nameEn: string;
  icon: string; // e.g. "Beef", "Flame", "GlassWater", etc.
  displayOrder: number;
  isHidden: boolean;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  category: "cheese" | "fries" | "sauce" | "drink"; // backward compatibility
  description: string;
  isEnabled: boolean;
  maxQuantity: number;
  availability: "in-stock" | "out-of-stock";
}

export interface CartItem {
  id: string; // unique for this customization
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  type: "beef" | "chicken";
  bunType: "obsidian" | "bone" | "brioche";
  temperature?: "medium" | "well-done";
  comments?: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  selectedExtras?: { name: string; price: number; quantity: number }[];
}

export interface Order {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  extras: string[]; // List of names/IDs of extras ordered
  totalPrice: number;
  timestamp: string;
  status: "New" | "Preparing" | "Delivered";
}

export interface AppSettings {
  googleAppsScriptUrl: string;
}

export interface MediaItem {
  id: string;
  url: string; // base64 or URL
  name: string;
  size?: string;
  type?: string;
}

export interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  isActive: boolean;
  description: string;
}

