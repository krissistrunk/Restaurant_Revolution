/*
  # The Bite Bond - Multi-Tenant SaaS Initial Schema

  1. New Tables
    - subscription_plans: Pricing tiers and features
    - tenant_settings: Per-restaurant configuration
    - tenant_staff: Staff management per restaurant
    - usage_tracking: Track usage for billing
    - billing_history: Invoice and payment tracking
    - promotional_codes: Discount codes for subscriptions
    - domain_verifications: Custom domain setup tracking

  2. Extended Tables
    - restaurants: Added multi-tenant fields (subdomain, custom_domain, subscription, international)
    - All existing tables updated with proper constraints

  3. Security
    - Enable RLS on all tables
    - Add policies for tenant data isolation
    - Ensure owners can only access their restaurant data
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========== SUBSCRIPTION PLANS TABLE ==========
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  annual_price DECIMAL(10, 2),
  stripe_price_id TEXT,
  stripe_annual_price_id TEXT,

  -- Features & Limits
  max_orders INTEGER,
  max_locations INTEGER DEFAULT 1,
  max_menu_items INTEGER,
  max_staff_members INTEGER,

  -- Feature Flags
  features JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Commission Rates
  transaction_fee_percent DECIMAL(5, 2) DEFAULT 0,
  transaction_fee_fixed DECIMAL(5, 2) DEFAULT 0,

  -- Plan Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== RESTAURANTS TABLE (Extended) ==========
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  logo_url TEXT,
  opening_hours JSONB,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Multi-Tenant Fields
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_token TEXT,

  -- Subscription & Billing
  subscription_plan_id INTEGER REFERENCES subscription_plans(id),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP,
  subscription_started_at TIMESTAMP,
  billing_cycle_anchor TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- International Support
  currency TEXT DEFAULT 'USD' NOT NULL,
  locale TEXT DEFAULT 'en-US' NOT NULL,
  timezone TEXT DEFAULT 'America/New_York' NOT NULL,
  country_code TEXT DEFAULT 'US',

  -- Business Information
  business_type TEXT,
  cuisine_type TEXT,
  business_registration_number TEXT,
  tax_id TEXT,

  -- Platform Settings
  is_active BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,

  -- Branding & Theme
  primary_color TEXT DEFAULT '#FF6B35',
  secondary_color TEXT DEFAULT '#FFD23F',
  theme_settings JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_subdomain ON restaurants(subdomain);
CREATE INDEX IF NOT EXISTS idx_restaurants_custom_domain ON restaurants(custom_domain);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription_status ON restaurants(subscription_status);

-- ========== USERS TABLE ==========
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin', 'staff')),
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
  loyalty_points INTEGER DEFAULT 0,
  dietary_preferences JSONB,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);

-- ========== TENANT SETTINGS TABLE ==========
CREATE TABLE IF NOT EXISTS tenant_settings (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL UNIQUE REFERENCES restaurants(id) ON DELETE CASCADE,

  -- Notification Settings
  email_notifications_enabled BOOLEAN DEFAULT true,
  sms_notifications_enabled BOOLEAN DEFAULT true,
  order_notification_email TEXT,

  -- Operational Settings
  auto_accept_orders BOOLEAN DEFAULT false,
  require_order_confirmation BOOLEAN DEFAULT true,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  estimated_prep_time INTEGER DEFAULT 30,

  -- Payment Settings
  accept_cash BOOLEAN DEFAULT true,
  accept_cards BOOLEAN DEFAULT true,
  accept_digital_wallets BOOLEAN DEFAULT false,

  -- Loyalty Settings
  loyalty_enabled BOOLEAN DEFAULT true,
  points_per_dollar DECIMAL(5, 2) DEFAULT 1.0,

  -- Advanced Settings
  custom_css TEXT,
  custom_js TEXT,
  analytics_code TEXT,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TENANT STAFF TABLE ==========
CREATE TABLE IF NOT EXISTS tenant_staff (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'server', 'kitchen', 'host')),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_staff_restaurant ON tenant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_staff_user ON tenant_staff(user_id);

-- ========== USAGE TRACKING TABLE ==========
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
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking(month);

-- ========== BILLING HISTORY TABLE ==========
CREATE TABLE IF NOT EXISTS billing_history (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,

  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),

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
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);

-- ========== PROMOTIONAL CODES TABLE ==========
CREATE TABLE IF NOT EXISTS promotional_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,

  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'trial_extension')),
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

-- ========== DOMAIN VERIFICATIONS TABLE ==========
CREATE TABLE IF NOT EXISTS domain_verifications (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  verification_token TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('dns_txt', 'dns_cname', 'file')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  last_checked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_restaurant ON domain_verifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain ON domain_verifications(domain);

-- ========== INSERT DEFAULT SUBSCRIPTION PLANS ==========
INSERT INTO subscription_plans (name, slug, description, price, annual_price, features, max_orders, max_locations, max_menu_items, max_staff_members, transaction_fee_percent, transaction_fee_fixed, is_popular, display_order)
VALUES
  ('Starter', 'starter', 'Perfect for food trucks and small cafes testing the platform', 0.00, 0.00, '["basic_menu", "online_ordering", "email_support"]'::jsonb, 50, 1, 50, 3, 2.9, 0.30, false, 1),
  ('Professional', 'professional', 'Perfect for single-location restaurants', 99.00, 948.00, '["unlimited_orders", "reservations", "waitlist", "loyalty_program", "ai_recommendations", "analytics", "priority_support", "custom_domain"]'::jsonb, NULL, 1, NULL, 10, 1.9, 0.30, true, 2),
  ('Growth', 'growth', 'Perfect for multi-location restaurants and growing chains', 249.00, 2388.00, '["everything_in_professional", "multi_location", "staff_management", "inventory", "kds", "marketing_automation", "sms_marketing", "api_access", "white_label", "phone_support"]'::jsonb, NULL, 5, NULL, NULL, 1.5, 0.30, false, 3),
  ('Enterprise', 'enterprise', 'Custom solutions for restaurant chains and franchises', 599.00, NULL, '["everything_in_growth", "unlimited_locations", "dedicated_manager", "custom_integrations", "advanced_security", "sla", "24_7_support", "multi_currency"]'::jsonb, NULL, NULL, NULL, NULL, 0.9, 0.30, false, 4)
ON CONFLICT (slug) DO NOTHING;

-- ========== ROW LEVEL SECURITY (RLS) ==========

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public read access for pricing page
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Restaurants: Owners can view their own restaurant
CREATE POLICY "Owners can view their restaurant"
  ON restaurants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = restaurants.id
      AND users.role = 'owner'
    )
  );

-- Restaurants: Owners can update their restaurant
CREATE POLICY "Owners can update their restaurant"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = restaurants.id
      AND users.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = restaurants.id
      AND users.role = 'owner'
    )
  );

-- Users: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Tenant Settings: Owners can view and update their settings
CREATE POLICY "Owners can manage tenant settings"
  ON tenant_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = tenant_settings.restaurant_id
      AND users.role = 'owner'
    )
  );

-- Tenant Staff: Owners and managers can view staff
CREATE POLICY "Restaurant team can view staff"
  ON tenant_staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = tenant_staff.restaurant_id
      AND users.role IN ('owner', 'staff')
    )
  );

-- Usage Tracking: Owners can view their usage
CREATE POLICY "Owners can view usage tracking"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = usage_tracking.restaurant_id
      AND users.role = 'owner'
    )
  );

-- Billing History: Owners can view their billing
CREATE POLICY "Owners can view billing history"
  ON billing_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = billing_history.restaurant_id
      AND users.role = 'owner'
    )
  );

-- Promotional Codes: Anyone can view valid codes (for public signup)
CREATE POLICY "Anyone can view valid promotional codes"
  ON promotional_codes FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP));

-- Domain Verifications: Owners can manage their domains
CREATE POLICY "Owners can manage domain verifications"
  ON domain_verifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.restaurant_id = domain_verifications.restaurant_id
      AND users.role = 'owner'
    )
  );

-- ========== FUNCTIONS FOR AUTOMATION ==========

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
