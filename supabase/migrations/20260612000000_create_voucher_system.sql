-- ==========================================
-- QUALIFUEL VOUCHER SYSTEM
-- ==========================================
-- Create vouchers table with comprehensive functionality
-- Supports percentage-based discounts with expiration and usage limits

-- 1. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent >= 1 AND discount_percent <= 100),
  status boolean DEFAULT true,
  expiration_date timestamptz,
  usage_limit integer DEFAULT NULL,
  used_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. VOUCHER USAGE LOG TABLE (Optional - for detailed tracking)
CREATE TABLE IF NOT EXISTS voucher_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid REFERENCES vouchers(id) ON DELETE CASCADE,
  customer_name text,
  customer_contact text,
  order_total decimal(10,2),
  discount_amount decimal(10,2),
  used_at timestamptz DEFAULT now()
);

-- 3. RLS POLICIES (Enable public access for admin operations)
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;

-- Allow public read access to vouchers (for validation)
CREATE POLICY "Public voucher read access" ON vouchers FOR SELECT USING (true);

-- Allow public insert/update access for admin operations
CREATE POLICY "Public voucher admin access" ON vouchers FOR ALL USING (true);

-- Allow public access to usage log
CREATE POLICY "Public voucher usage access" ON voucher_usage FOR ALL USING (true);

-- 4. INSERT SAMPLE VOUCHERS (Limited to 30 total vouchers system-wide)
-- Add constraint to limit total voucher count to 30
CREATE OR REPLACE FUNCTION check_voucher_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM vouchers) >= 30 THEN
    RAISE EXCEPTION 'Maximum voucher limit of 30 reached. Please delete existing vouchers to add new ones.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER voucher_count_limit
  BEFORE INSERT ON vouchers
  FOR EACH ROW
  EXECUTE FUNCTION check_voucher_limit();

-- Insert sample vouchers
INSERT INTO vouchers (code, discount_percent, status, expiration_date, usage_limit) 
VALUES 
  ('QUALI1', 1, true, '2024-12-31 23:59:59+00', 100),
  ('WELCOME3', 3, true, '2024-12-31 23:59:59+00', 50),
  ('SAVE10', 10, true, '2024-12-31 23:59:59+00', 200),
  ('NEWBIE15', 15, true, '2024-06-30 23:59:59+00', 25),
  ('VIP20', 20, true, NULL, 10)
ON CONFLICT (code) DO NOTHING;

-- 5. HELPER FUNCTIONS FOR VOUCHER VALIDATION
CREATE OR REPLACE FUNCTION validate_voucher_code(voucher_code text)
RETURNS TABLE(
  is_valid boolean,
  discount_percent integer,
  error_message text,
  voucher_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN v.id IS NULL THEN false
      WHEN v.status = false THEN false
      WHEN v.expiration_date IS NOT NULL AND v.expiration_date < now() THEN false
      WHEN v.usage_limit IS NOT NULL AND v.used_count >= v.usage_limit THEN false
      ELSE true
    END as is_valid,
    COALESCE(v.discount_percent, 0) as discount_percent,
    CASE 
      WHEN v.id IS NULL THEN 'Voucher code not found'
      WHEN v.status = false THEN 'Voucher is inactive'
      WHEN v.expiration_date IS NOT NULL AND v.expiration_date < now() THEN 'Voucher has expired'
      WHEN v.usage_limit IS NOT NULL AND v.used_count >= v.usage_limit THEN 'Voucher usage limit reached'
      ELSE 'Valid voucher'
    END as error_message,
    v.id as voucher_id
  FROM vouchers v
  WHERE UPPER(v.code) = UPPER(voucher_code);
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCTION TO USE VOUCHER (INCREMENT USED COUNT)
CREATE OR REPLACE FUNCTION use_voucher(
  voucher_code text,
  customer_name text DEFAULT NULL,
  customer_contact text DEFAULT NULL,
  order_total decimal DEFAULT NULL
)
RETURNS TABLE(
  success boolean,
  message text,
  discount_amount decimal
) AS $$
DECLARE
  voucher_record record;
  calculated_discount decimal;
BEGIN
  -- Validate voucher first
  SELECT * INTO voucher_record
  FROM validate_voucher_code(voucher_code);
  
  IF NOT voucher_record.is_valid THEN
    RETURN QUERY SELECT false, voucher_record.error_message, 0.00::decimal;
    RETURN;
  END IF;
  
  -- Calculate discount amount
  calculated_discount := COALESCE(order_total, 0) * (voucher_record.discount_percent::decimal / 100);
  
  -- Increment used count
  UPDATE vouchers 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = voucher_record.voucher_id;
  
  -- Log the usage
  INSERT INTO voucher_usage (voucher_id, customer_name, customer_contact, order_total, discount_amount)
  VALUES (voucher_record.voucher_id, customer_name, customer_contact, order_total, calculated_discount);
  
  RETURN QUERY SELECT true, 'Voucher applied successfully', calculated_discount;
END;
$$ LANGUAGE plpgsql;