/*
  # Complete Restaurant Revolution Schema

  This migration creates all tables needed for the Restaurant Revolution platform.

  Tables created:
  - users, restaurants, categories, menu_items, modifiers
  - reservations, orders, order_items, loyalty_rewards, promotions
  - queue_entries, reviews, ai_conversations
  - user_preferences, user_item_interactions, guest_visits
  - qr_redemptions, subscription_plans, tenant_settings
  - tenant_staff, usage_tracking, billing_history
  - promotional_codes, domain_verifications
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  annual_price DECIMAL(10, 2),
  stripe_price_id TEXT,
  stripe_annual_price_id TEXT,
  max_orders INTEGER,
  max_locations INTEGER DEFAULT 1,
  max_menu_items INTEGER,
  max_staff_members INTEGER,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  transaction_fee_percent DECIMAL(5, 2) DEFAULT 0,
  transaction_fee_fixed DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  opening_hours JSONB,
  latitude REAL,
  longitude REAL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_token TEXT,
  subscription_plan_id INTEGER REFERENCES subscription_plans(id),
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  subscription_started_at TIMESTAMP,
  billing_cycle_anchor TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  currency TEXT DEFAULT 'USD' NOT NULL,
  locale TEXT DEFAULT 'en-US' NOT NULL,
  timezone TEXT DEFAULT 'America/New_York' NOT NULL,
  country_code TEXT DEFAULT 'US',
  business_type TEXT,
  cuisine_type TEXT,
  business_registration_number TEXT,
  tax_id TEXT,
  is_active BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  primary_color TEXT DEFAULT '#FF6B35',
  secondary_color TEXT DEFAULT '#FFD23F',
  theme_settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_restaurants_subdomain ON restaurants(subdomain);
CREATE INDEX IF NOT EXISTS idx_restaurants_custom_domain ON restaurants(custom_domain);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' NOT NULL,
  restaurant_id INTEGER REFERENCES restaurants(id),
  loyalty_points INTEGER DEFAULT 0 NOT NULL,
  dietary_preferences JSONB,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id)
);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  is_seafood BOOLEAN DEFAULT false,
  nutrition_info JSONB,
  allergens JSONB,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);

-- Modifiers
CREATE TABLE IF NOT EXISTS modifiers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id)
);

CREATE INDEX IF NOT EXISTS idx_modifiers_menu_item ON modifiers(menu_item_id);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  special_occasion TEXT,
  seating_preference TEXT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending',
  total_price REAL NOT NULL,
  pickup_time TIMESTAMP,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  quantity INTEGER DEFAULT 1 NOT NULL,
  price REAL NOT NULL,
  notes TEXT,
  modifiers JSONB
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Loyalty Rewards
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_restaurant ON loyalty_rewards(restaurant_id);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  code TEXT,
  is_active BOOLEAN DEFAULT true,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id)
);

CREATE INDEX IF NOT EXISTS idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);

-- Queue Entries
CREATE TABLE IF NOT EXISTS queue_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  party_size INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' NOT NULL,
  position INTEGER NOT NULL,
  estimated_wait_time INTEGER NOT NULL,
  actual_wait_time INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  notification_sent BOOLEAN DEFAULT false,
  seated_at TIMESTAMP,
  phone TEXT,
  note TEXT,
  seating_preference TEXT,
  special_requests TEXT,
  sms_notifications BOOLEAN DEFAULT true,
  last_notification_sent TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_entries_user ON queue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_restaurant ON queue_entries(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_status ON queue_entries(status);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  order_id INTEGER REFERENCES orders(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);

-- AI Conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  messages JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  context JSONB,
  resolved BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_restaurant ON ai_conversations(restaurant_id);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  dietary_preferences JSONB,
  favorite_categories JSONB,
  disliked_items JSONB,
  allergens JSONB,
  taste_preferences JSONB,
  seating_preferences JSONB,
  special_occasions JSONB,
  visit_history JSONB,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- User Item Interactions
CREATE TABLE IF NOT EXISTS user_item_interactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  interaction TEXT NOT NULL,
  rating INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_item_interactions_user ON user_item_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_item_interactions_item ON user_item_interactions(menu_item_id);

-- Guest Visits
CREATE TABLE IF NOT EXISTS guest_visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  party_size INTEGER NOT NULL,
  total_spent REAL,
  table_section TEXT,
  special_occasion TEXT,
  satisfaction_rating INTEGER,
  wait_time INTEGER,
  notes TEXT,
  order_id INTEGER REFERENCES orders(id)
);

CREATE INDEX IF NOT EXISTS idx_guest_visits_user ON guest_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_visits_restaurant ON guest_visits(restaurant_id);

-- QR Redemptions
CREATE TABLE IF NOT EXISTS qr_redemptions (
  id SERIAL PRIMARY KEY,
  qr_code_value TEXT NOT NULL UNIQUE,
  qr_type TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  reward_id INTEGER REFERENCES loyalty_rewards(id),
  promotion_id INTEGER REFERENCES promotions(id),
  discount_amount REAL,
  discount_type TEXT,
  expires_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active',
  redeemed_at TIMESTAMP,
  redeemed_by INTEGER REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qr_redemptions_user ON qr_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_redemptions_code ON qr_redemptions(qr_code_value);
CREATE INDEX IF NOT EXISTS idx_qr_redemptions_status ON qr_redemptions(status);

-- Tenant Settings
CREATE TABLE IF NOT EXISTS tenant_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT true,
  order_notification_email TEXT,
  auto_accept_orders BOOLEAN DEFAULT false,
  require_order_confirmation BOOLEAN DEFAULT true,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  estimated_prep_time INTEGER DEFAULT 30,
  accept_cash BOOLEAN DEFAULT true,
  accept_cards BOOLEAN DEFAULT true,
  accept_digital_wallets BOOLEAN DEFAULT false,
  loyalty_enabled BOOLEAN DEFAULT true,
  points_per_dollar DECIMAL(5, 2) DEFAULT 1.0,
  custom_css TEXT,
  custom_js TEXT,
  analytics_code TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Staff
CREATE TABLE IF NOT EXISTS tenant_staff (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_staff_restaurant ON tenant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_staff_user ON tenant_staff(user_id);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  order_count INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  transaction_fees DECIMAL(10, 2) DEFAULT 0,
  sms_messages_sent INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_mb DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, month)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_restaurant ON usage_tracking(restaurant_id);

-- Billing History
CREATE TABLE IF NOT EXISTS billing_history (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT NOT NULL,
  billing_period_start TIMESTAMP NOT NULL,
  billing_period_end TIMESTAMP NOT NULL,
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_history_restaurant ON billing_history(restaurant_id);

-- Promotional Codes
CREATE TABLE IF NOT EXISTS promotional_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  duration_months INTEGER,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  applicable_plans JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON promotional_codes(code);

-- Domain Verifications
CREATE TABLE IF NOT EXISTS domain_verifications (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verification_method TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_restaurant ON domain_verifications(restaurant_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, annual_price, features, max_orders, max_locations, max_menu_items, max_staff_members, transaction_fee_percent, transaction_fee_fixed, is_popular, display_order)
VALUES
  ('Starter', 'starter', 'Perfect for food trucks and small cafes', 0.00, 0.00, '["basic_menu", "online_ordering", "email_support"]'::jsonb, 50, 1, 50, 3, 2.9, 0.30, false, 1),
  ('Professional', 'professional', 'Perfect for single-location restaurants', 99.00, 948.00, '["unlimited_orders", "reservations", "waitlist", "loyalty_program", "ai_recommendations", "analytics", "priority_support", "custom_domain"]'::jsonb, NULL, 1, NULL, 10, 1.9, 0.30, true, 2),
  ('Growth', 'growth', 'Perfect for multi-location restaurants', 249.00, 2388.00, '["everything_in_professional", "multi_location", "staff_management", "inventory", "kds", "marketing_automation", "sms_marketing", "api_access", "white_label", "phone_support"]'::jsonb, NULL, 5, NULL, NULL, 1.5, 0.30, false, 3),
  ('Enterprise', 'enterprise', 'Custom solutions for chains', 599.00, NULL, '["everything_in_growth", "unlimited_locations", "dedicated_manager", "custom_integrations", "advanced_security", "sla", "24_7_support", "multi_currency"]'::jsonb, NULL, NULL, NULL, NULL, 0.9, 0.30, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_settings_updated_at ON tenant_settings;
CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
