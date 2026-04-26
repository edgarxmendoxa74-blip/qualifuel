
-- Add sample products for QualiFuel
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('QualiFuel High Protein Salad', 'Fresh greens topped with grilled chicken, avocado, hard-boiled eggs, and our signature balsamic dressing.', 250, 'food', true, true, '/images/protein-salad.png'),
  ('Signature Beef Tapa', 'Tender marinated beef served with garlic fried rice and a sunny-side-up egg. A Filipino classic.', 180, 'food', true, true, '/images/beef-tapa.png'),
  ('Iced Americano', 'Double shot of our premium espresso over ice and water for a clean, bold finish.', 120, 'coffee', false, true, 'https://images.unsplash.com/photo-1551046775-32521941656b?auto=format&fit=crop&q=80&w=1000')
ON CONFLICT DO NOTHING;
