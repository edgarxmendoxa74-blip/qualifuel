
-- Add missing site settings for hero section
INSERT INTO site_settings (id, value, type, description) VALUES
  ('hero_title', 'QualiFuel', 'text', 'Main title in hero section'),
  ('hero_subtitle', 'High Protein Meals', 'text', 'Subtitle under the hero title'),
  ('hero_text', 'Fuel Your Potential.', 'text', 'Inspirational text on the banner'),
  ('hero_banner', '/images/qualifuel-banner.png', 'image', 'Main background banner image for hero section')
ON CONFLICT (id) DO NOTHING;
