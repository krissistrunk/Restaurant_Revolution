/*
  # Enable Row Level Security and Create Policies
  
  1. Security Changes
    - Enable RLS on all tables
    - Create restrictive policies by default
    - Allow public read access to appropriate tables
    - Ensure users can only access their own data
    
  2. Policies Created
    - Public can read active restaurants
    - Public can read available menu items
    - Users can read their own data
    - Users can manage their own orders
    - Users can manage their own reservations
    - Restaurant owners can manage their restaurant data
*/

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_item_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_staff ENABLE ROW LEVEL SECURITY;

-- Public read access to restaurants (active only)
CREATE POLICY "Public can read active restaurants"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Public read access to menu items (available only)
CREATE POLICY "Public can read available menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (is_available = true);

-- Public read access to categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access to modifiers
CREATE POLICY "Public can read modifiers"
  ON modifiers FOR SELECT
  TO anon, authenticated
  USING (true);

-- Public read access to loyalty rewards
CREATE POLICY "Public can read active loyalty rewards"
  ON loyalty_rewards FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Public read access to promotions
CREATE POLICY "Public can read active promotions"
  ON promotions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their order items
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Users can create order items for their orders
CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Users can read their own reservations
CREATE POLICY "Users can read own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can create reservations
CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own reservations
CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can delete their own reservations
CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can read their own queue entries
CREATE POLICY "Users can read own queue entries"
  ON queue_entries FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can create queue entries
CREATE POLICY "Users can create queue entries"
  ON queue_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their own interactions
CREATE POLICY "Users can read own interactions"
  ON user_item_interactions FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can create interactions
CREATE POLICY "Users can create interactions"
  ON user_item_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Public can read reviews
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their own AI conversations
CREATE POLICY "Users can read own AI conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can create AI conversations
CREATE POLICY "Users can create AI conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own AI conversations
CREATE POLICY "Users can update own AI conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can read their own guest visits
CREATE POLICY "Users can read own guest visits"
  ON guest_visits FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Users can read their own QR redemptions
CREATE POLICY "Users can read own QR redemptions"
  ON qr_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Owner policies will be added in a separate migration when auth is fully integrated
-- For now, these basic policies ensure data security at the row level
