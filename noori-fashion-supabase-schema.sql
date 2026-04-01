-- =============================================
-- NOORI FASHION — Fresh Schema (April 2026)
-- All tables prefixed with nf_ to avoid conflicts
-- =============================================

-- Drop existing tables if any
DROP TABLE IF EXISTS public.nf_order_items CASCADE;
DROP TABLE IF EXISTS public.nf_orders CASCADE;
DROP TABLE IF EXISTS public.nf_wishlist CASCADE;
DROP TABLE IF EXISTS public.nf_cart CASCADE;
DROP TABLE IF EXISTS public.nf_product_images CASCADE;
DROP TABLE IF EXISTS public.nf_product_variants CASCADE;
DROP TABLE IF EXISTS public.nf_products CASCADE;
DROP TABLE IF EXISTS public.nf_categories CASCADE;
DROP TABLE IF EXISTS public.nf_banners CASCADE;
DROP TABLE IF EXISTS public.nf_profiles CASCADE;
DROP TABLE IF EXISTS public.nf_settings CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_nf_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.generate_nf_order_number() CASCADE;
DROP FUNCTION IF EXISTS public.nf_update_updated_at() CASCADE;

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE public.nf_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  area TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles read" ON public.nf_profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.nf_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access profiles" ON public.nf_profiles FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_nf_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nf_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'diptatv2@gmail.com' THEN 'admin' ELSE 'customer' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_nf_auth_user_created ON auth.users;
CREATE TRIGGER on_nf_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_nf_new_user();

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE public.nf_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_bn TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.nf_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.nf_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE public.nf_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_bn TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  category_id UUID REFERENCES public.nf_categories(id) ON DELETE SET NULL,
  fabric_type TEXT,
  sku TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  total_stock INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON public.nf_products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON public.nf_products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- PRODUCT IMAGES
-- =============================================
CREATE TABLE public.nf_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.nf_products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read images" ON public.nf_product_images FOR SELECT USING (true);
CREATE POLICY "Admin manage images" ON public.nf_product_images FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- PRODUCT VARIANTS (Size/Color combinations)
-- =============================================
CREATE TABLE public.nf_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.nf_products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  stock INT DEFAULT 0,
  price_override DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read variants" ON public.nf_product_variants FOR SELECT USING (true);
CREATE POLICY "Admin manage variants" ON public.nf_product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE public.nf_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_area TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.nf_orders FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can create orders" ON public.nf_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage orders" ON public.nf_orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE public.nf_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.nf_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.nf_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_size TEXT,
  variant_color TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON public.nf_order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.nf_orders o
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
CREATE POLICY "Anyone can create order items" ON public.nf_order_items FOR INSERT WITH CHECK (true);

-- =============================================
-- WISHLIST
-- =============================================
CREATE TABLE public.nf_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.nf_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.nf_wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON public.nf_wishlist FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- BANNERS
-- =============================================
CREATE TABLE public.nf_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image TEXT NOT NULL,
  link TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read banners" ON public.nf_banners FOR SELECT USING (true);
CREATE POLICY "Admin manage banners" ON public.nf_banners FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- SITE SETTINGS
-- =============================================
CREATE TABLE public.nf_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nf_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.nf_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage settings" ON public.nf_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.nf_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_nf_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'NF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_nf_order_number
  BEFORE INSERT ON public.nf_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_nf_order_number();

CREATE OR REPLACE FUNCTION public.nf_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nf_products_updated_at BEFORE UPDATE ON public.nf_products
  FOR EACH ROW EXECUTE FUNCTION public.nf_update_updated_at();
CREATE TRIGGER nf_orders_updated_at BEFORE UPDATE ON public.nf_orders
  FOR EACH ROW EXECUTE FUNCTION public.nf_update_updated_at();
CREATE TRIGGER nf_profiles_updated_at BEFORE UPDATE ON public.nf_profiles
  FOR EACH ROW EXECUTE FUNCTION public.nf_update_updated_at();

-- =============================================
-- STORAGE BUCKET
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('noori-fashion', 'noori-fashion', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public read noori-fashion" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload noori-fashion" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete noori-fashion" ON storage.objects;
DROP POLICY IF EXISTS "Auth update noori-fashion" ON storage.objects;

CREATE POLICY "Public read noori-fashion" ON storage.objects FOR SELECT USING (bucket_id = 'noori-fashion');
CREATE POLICY "Auth upload noori-fashion" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'noori-fashion' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete noori-fashion" ON storage.objects FOR DELETE USING (bucket_id = 'noori-fashion' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update noori-fashion" ON storage.objects FOR UPDATE USING (bucket_id = 'noori-fashion' AND auth.role() = 'authenticated');

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_nf_products_category ON public.nf_products(category_id);
CREATE INDEX idx_nf_products_slug ON public.nf_products(slug);
CREATE INDEX idx_nf_products_active ON public.nf_products(is_active);
CREATE INDEX idx_nf_products_featured ON public.nf_products(is_featured);
CREATE INDEX idx_nf_categories_slug ON public.nf_categories(slug);
CREATE INDEX idx_nf_orders_user ON public.nf_orders(user_id);
CREATE INDEX idx_nf_orders_number ON public.nf_orders(order_number);
CREATE INDEX idx_nf_orders_status ON public.nf_orders(order_status);
CREATE INDEX idx_nf_order_items_order ON public.nf_order_items(order_id);
CREATE INDEX idx_nf_product_images_product ON public.nf_product_images(product_id);
CREATE INDEX idx_nf_product_variants_product ON public.nf_product_variants(product_id);

-- =============================================
-- SEED DATA: Categories
-- =============================================
INSERT INTO public.nf_categories (name, name_bn, slug, description, sort_order) VALUES
  ('Exclusive', 'এক্সক্লুসিভ', 'exclusive', 'Premium exclusive collection', 1),
  ('Stitch', 'স্টিচ', 'stitch', 'Ready-made stitched collection', 2),
  ('Unstitch', 'আনস্টিচ', 'unstitch', 'Unstitched fabric collection', 3),
  ('Plazo Set', 'প্লাজো সেট', 'plazo-set', 'Trendy plazo set collection', 4),
  ('Co-ord Set', 'কো-অর্ড সেট', 'co-ord-set', 'Trendy co-ord set collection', 5);

-- =============================================
-- SEED DATA: Products (from client DOCX)
-- =============================================

-- Product 1: Palazzo (Exclusive)
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Exclusive Indian Palazzo', 'exclusive-indian-palazzo-1', 'Exclusive Indian Boutique Palazzo Set - Premium handcrafted design with intricate detailing. Perfect for special occasions and festive wear.', 16800, id, 'Premium Fabric', true, true, 5, ARRAY['exclusive','palazzo','indian','boutique','festive']
FROM public.nf_categories WHERE slug = 'plazo-set';

-- Product 3: Palazzo Premium (Exclusive)
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Premium Boutique Palazzo', 'premium-boutique-palazzo', 'Exclusive Indian Boutique Premium Palazzo Set - Luxury handcrafted collection with exquisite embroidery and premium fabric.', 19800, id, 'Premium Silk Blend', true, true, 5, ARRAY['exclusive','palazzo','premium','luxury','boutique']
FROM public.nf_categories WHERE slug = 'plazo-set';

-- Product 4: Coat Set
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Readymade Co-ord Set', 'readymade-co-ord-set', 'Stylish readymade co-ord set - Modern design with premium stitching. Comfortable and elegant for everyday and formal wear.', 1550, id, 'Cotton Blend', true, true, 5, ARRAY['co-ord','readymade','coord-set','formal','casual']
FROM public.nf_categories WHERE slug = 'co-ord-set';

-- Product 5: Three Pieces (Stitch)
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Readymade Three Pieces', 'readymade-three-pieces-1', 'Beautiful readymade three pieces set - Ready to wear with perfect fitting. Includes kameez, salwar, and dupatta.', 2950, id, 'Cotton', true, true, 5, ARRAY['three-pieces','readymade','stitch','salwar-kameez']
FROM public.nf_categories WHERE slug = 'stitch';

-- Product 6: Three Pieces Variant
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Designer Three Pieces', 'designer-three-pieces', 'Designer readymade three pieces - Elegant design with modern cuts. Premium stitching for a perfect fit.', 2950, id, 'Cotton Blend', false, true, 5, ARRAY['three-pieces','designer','stitch','elegant']
FROM public.nf_categories WHERE slug = 'stitch';

-- Product 7: Three Pieces Budget
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Classic Three Pieces', 'classic-three-pieces', 'Classic readymade three pieces set - Timeless design with quality fabric. Comfortable and stylish for everyday wear.', 2350, id, 'Cotton', false, true, 5, ARRAY['three-pieces','classic','stitch','everyday']
FROM public.nf_categories WHERE slug = 'stitch';

-- Product 8: Three Pieces
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Trendy Three Pieces', 'trendy-three-pieces', 'Trendy readymade three pieces - Modern fashion-forward design with beautiful color combinations.', 2750, id, 'Viscose', false, true, 5, ARRAY['three-pieces','trendy','stitch','modern']
FROM public.nf_categories WHERE slug = 'stitch';

-- Product 9: Three Pieces Value
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Elegant Three Pieces', 'elegant-three-pieces', 'Elegant readymade three pieces - Sophisticated design with fine detailing. Perfect for casual and semi-formal occasions.', 2150, id, 'Cotton', false, true, 5, ARRAY['three-pieces','elegant','stitch','semi-formal']
FROM public.nf_categories WHERE slug = 'stitch';

-- Product 10: Unstitched Three Pieces
INSERT INTO public.nf_products (name, slug, description, price, category_id, fabric_type, is_featured, is_new, total_stock, tags)
SELECT 'Unstitched Three Pieces', 'unstitched-three-pieces', 'Premium unstitched three pieces - High quality fabric for custom tailoring. Making charge ৳500 additional. Available in multiple designs.', 2150, id, 'Mixed Fabric', true, true, 10, ARRAY['unstitched','three-pieces','custom','premium']
FROM public.nf_categories WHERE slug = 'unstitch';

-- =============================================
-- SEED DATA: Product Variants
-- =============================================

-- For Palazzo products (sizes 38-46)
INSERT INTO public.nf_product_variants (product_id, size, stock)
SELECT p.id, s.size, 1
FROM public.nf_products p
CROSS JOIN (VALUES ('38'),('40'),('42'),('44'),('46')) AS s(size)
WHERE p.slug IN ('exclusive-indian-palazzo-1', 'premium-boutique-palazzo');

-- For Coat Set (sizes 38-46)
INSERT INTO public.nf_product_variants (product_id, size, stock)
SELECT p.id, s.size, 1
FROM public.nf_products p
CROSS JOIN (VALUES ('38'),('40'),('42'),('44'),('46')) AS s(size)
WHERE p.slug = 'readymade-co-ord-set';

-- For Stitch Three Pieces (sizes 38-46)
INSERT INTO public.nf_product_variants (product_id, size, stock)
SELECT p.id, s.size, 1
FROM public.nf_products p
CROSS JOIN (VALUES ('38'),('40'),('42'),('44'),('46')) AS s(size)
WHERE p.slug IN ('readymade-three-pieces-1','designer-three-pieces','classic-three-pieces','trendy-three-pieces','elegant-three-pieces');

-- For Unstitched (Free Size)
INSERT INTO public.nf_product_variants (product_id, size, stock)
SELECT p.id, 'Free Size', 10
FROM public.nf_products p
WHERE p.slug = 'unstitched-three-pieces';

-- =============================================
-- SEED DATA: Settings
-- =============================================
INSERT INTO public.nf_settings (key, value) VALUES
  ('site_name', 'নূরী ফ্যাশন'),
  ('site_name_en', 'Noori Fashion'),
  ('site_tagline', 'Premium Women''s Fashion'),
  ('shipping_dhaka', '80'),
  ('shipping_outside', '150'),
  ('free_shipping_min', '5000'),
  ('whatsapp', '+8801891656488'),
  ('facebook', 'https://www.facebook.com/share/17i7WMaMT1/'),
  ('instagram', ''),
  ('email', 'business@diptait.com.bd'),
  ('phone', '+8801891656488'),
  ('address', 'Dhaka, Bangladesh'),
  ('bkash_number', '01701019541'),
  ('nagad_number', '01515653291'),
  ('currency', '৳'),
  ('making_charge', '500');

-- =============================================
-- SEED DATA: Banners (from client poster images)
-- =============================================
INSERT INTO public.nf_banners (title, subtitle, image, link, sort_order, is_active) VALUES
  ('এক্সক্লুসিভ কালেকশন', 'প্রিমিয়াম ইন্ডিয়ান বুটিক ড্রেস', 'banners/banner-1.jpg', '/category/exclusive', 1, true),
  ('স্টিচ কালেকশন', 'রেডিমেড থ্রি-পিস ও প্লাজো সেট', 'banners/banner-2.jpg', '/category/stitch', 2, true),
  ('নতুন সংযোজন', 'সর্বশেষ ট্রেন্ডিং ডিজাইন', 'banners/banner-3.jpg', '/category/plazo-set', 3, true);
