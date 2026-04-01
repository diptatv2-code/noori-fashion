export interface Category {
  id: string;
  name: string;
  name_bn: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_bn: string | null;
  price: number;
  compare_price: number | null;
  category_id: string | null;
  fabric_type: string | null;
  sku: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  total_stock: number;
  sold_count: number;
  view_count: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  nf_categories?: Category;
  nf_product_images?: ProductImage[];
  nf_product_variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock: number;
  price_override: number | null;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_area: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: 'cod' | 'bkash';
  payment_status: string;
  order_status: string;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  nf_order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  variant_size: string | null;
  variant_color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  link: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  nf_products?: Product;
}
