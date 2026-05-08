-- ==========================================
-- QUALIFUEL COMPLETE DATABASE SETUP
-- ==========================================
-- This file contains the complete database schema and sample data 
-- for the QualiFuel Admin Dashboard and Menu System.
-- Includes: Categories, Menu Items, Variations, Add-ons, 
-- Payment Methods, and Site Settings.

-- 1. UTILS: Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '☕',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  category text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  image_url text,
  discount_price decimal(10,2),
  discount_start_date timestamptz,
  discount_end_date timestamptz,
  discount_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. VARIATIONS TABLE
CREATE TABLE IF NOT EXISTS variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. ADD-ONS TABLE
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. PAYMENT METHODS TABLE
CREATE TABLE IF NOT EXISTS payment_methods (
  id text PRIMARY KEY,
  name text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  qr_code_url text NOT NULL,
  active boolean DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  value text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  description text,
  updated_at timestamptz DEFAULT now()
);

-- 8. TRIGGERS
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ENABLE RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES (Public Management for Frontend Admin)
-- Categories
DROP POLICY IF EXISTS "Public select categories" ON categories;
DROP POLICY IF EXISTS "Public manage categories" ON categories;
CREATE POLICY "Public select categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Public manage categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- Menu Items
DROP POLICY IF EXISTS "Public select menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public manage menu_items" ON menu_items;
CREATE POLICY "Public select menu_items" ON menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Public manage menu_items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);

-- Variations
DROP POLICY IF EXISTS "Public select variations" ON variations;
DROP POLICY IF EXISTS "Public manage variations" ON variations;
CREATE POLICY "Public select variations" ON variations FOR SELECT TO public USING (true);
CREATE POLICY "Public manage variations" ON variations FOR ALL TO public USING (true) WITH CHECK (true);

-- Add-ons
DROP POLICY IF EXISTS "Public select add_ons" ON add_ons;
DROP POLICY IF EXISTS "Public manage add_ons" ON add_ons;
CREATE POLICY "Public select add_ons" ON add_ons FOR SELECT TO public USING (true);
CREATE POLICY "Public manage add_ons" ON add_ons FOR ALL TO public USING (true) WITH CHECK (true);

-- Payment Methods
DROP POLICY IF EXISTS "Public select payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Public manage payment_methods" ON payment_methods;
CREATE POLICY "Public select payment_methods" ON payment_methods FOR SELECT TO public USING (true);
CREATE POLICY "Public manage payment_methods" ON payment_methods FOR ALL TO public USING (true) WITH CHECK (true);

-- Site Settings
DROP POLICY IF EXISTS "Public select site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public manage site_settings" ON site_settings;
CREATE POLICY "Public select site_settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Public manage site_settings" ON site_settings FOR ALL TO public USING (true) WITH CHECK (true);

-- 11. INITIAL DATA

-- Default Categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('coffee', 'Coffee', '☕', 1, true),
  ('iced-coffee', 'Iced Coffee', '🧊', 2, true),
  ('non-coffee', 'Non-Coffee', '🫖', 3, true),
  ('food', 'Food & Pastries', '🥐', 4, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Default Payment Methods
INSERT INTO payment_methods (id, name, account_number, account_name, qr_code_url, sort_order, active) VALUES
  ('gcash', 'GCash', '09XX XXX XXXX', 'QualiFuel Admin', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 1, true),
  ('maya', 'Maya', '09XX XXX XXXX', 'QualiFuel Admin', 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 2, true)
ON CONFLICT (id) DO NOTHING;

-- Default Site Settings
INSERT INTO site_settings (id, value, type, description) VALUES
  ('site_name', 'QualiFuel', 'text', 'The name of the cafe/restaurant'),
  ('site_logo', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop', 'image', 'The logo image URL for the site'),
  ('site_description', 'High Protein Meals and Premium Coffee', 'text', 'Short description of the cafe'),
  ('currency', '₱', 'text', 'Currency symbol for prices'),
  ('hero_title', 'QualiFuel', 'text', 'Main title in hero section'),
  ('hero_subtitle', 'High Protein Meals', 'text', 'Subtitle under the hero title'),
  ('hero_text', 'Fuel Your Potential.', 'text', 'Inspirational text on the banner'),
  ('hero_banner', '/images/qualifuel-banner.png', 'image', 'Main background banner image for hero section')
ON CONFLICT (id) DO NOTHING;

-- Sample Menu Items (QualiFuel)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('QualiFuel High Protein Salad', 'Fresh greens topped with seared salmon, avocado, hard-boiled eggs, and our signature balsamic dressing.', 250, 'food', true, true, '/images/protein-salad.png'),
  ('Signature Beef Tapa', 'Tender marinated beef served with garlic fried rice and a sunny-side-up egg. A Filipino classic.', 180, 'food', true, true, '/images/beef-tapa.png'),
  ('Iced Americano', 'Double shot of our premium espresso over ice and water for a clean, bold finish.', 120, 'coffee', false, true, 'https://images.unsplash.com/photo-1551046775-32521941656b?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT DO NOTHING;
