/*
  # Fix RLS Policies for Admin Management
  
  1. Changes
    - Allow public users to manage categories (SELECT, INSERT, UPDATE, DELETE)
    - Allow public users to manage menu_items
    - Allow public users to manage variations
    - Allow public users to manage add_ons
    - Allow public users to manage payment_methods
    - Allow public users to manage site_settings
  
  2. Rationale
    - The current application uses a frontend-only admin password system.
    - Since users are not signing into Supabase Auth, they are treated as 'public'.
    - RLS was previously restricted to 'authenticated' users for management, preventing saves and deletes.
    - SELECT policies for categories was restricted to 'active = true', preventing management of inactive types.
    - Manual delete operations in frontend require explicit DELETE permissions on children or cascading permission.
*/

-- --- CATEGORIES ---
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Public select categories" ON categories;
DROP POLICY IF EXISTS "Public manage categories" ON categories;

CREATE POLICY "Public select categories" ON categories FOR SELECT TO public USING (true);
CREATE POLICY "Public manage categories" ON categories FOR ALL TO public USING (true) WITH CHECK (true);

-- --- MENU ITEMS ---
DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Public select menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public manage menu_items" ON menu_items;

CREATE POLICY "Public select menu_items" ON menu_items FOR SELECT TO public USING (true);
CREATE POLICY "Public manage menu_items" ON menu_items FOR ALL TO public USING (true) WITH CHECK (true);

-- --- VARIATIONS ---
DROP POLICY IF EXISTS "Anyone can read variations" ON variations;
DROP POLICY IF EXISTS "Authenticated users can manage variations" ON variations;
DROP POLICY IF EXISTS "Public select variations" ON variations;
DROP POLICY IF EXISTS "Public manage variations" ON variations;

CREATE POLICY "Public select variations" ON variations FOR SELECT TO public USING (true);
CREATE POLICY "Public manage variations" ON variations FOR ALL TO public USING (true) WITH CHECK (true);

-- --- ADD-ONS ---
DROP POLICY IF EXISTS "Anyone can read add-ons" ON add_ons;
DROP POLICY IF EXISTS "Authenticated users can manage add-ons" ON add_ons;
DROP POLICY IF EXISTS "Public select add_ons" ON add_ons;
DROP POLICY IF EXISTS "Public manage add_ons" ON add_ons;

CREATE POLICY "Public select add_ons" ON add_ons FOR SELECT TO public USING (true);
CREATE POLICY "Public manage add_ons" ON add_ons FOR ALL TO public USING (true) WITH CHECK (true);

-- --- PAYMENT METHODS ---
DROP POLICY IF EXISTS "Anyone can read active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Authenticated users can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Public select payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Public manage payment_methods" ON payment_methods;

CREATE POLICY "Public select payment_methods" ON payment_methods FOR SELECT TO public USING (true);
CREATE POLICY "Public manage payment_methods" ON payment_methods FOR ALL TO public USING (true) WITH CHECK (true);

-- --- SITE SETTINGS ---
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Public select site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public manage site_settings" ON site_settings;

CREATE POLICY "Public select site_settings" ON site_settings FOR SELECT TO public USING (true);
CREATE POLICY "Public manage site_settings" ON site_settings FOR ALL TO public USING (true) WITH CHECK (true);
