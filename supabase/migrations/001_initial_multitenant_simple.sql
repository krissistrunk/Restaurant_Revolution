/*
  # The Bite Bond - Multi-Tenant SaaS Initial Schema (Simplified)

  1. Core Tables
    - subscription_plans: Pricing tiers
    - restaurants: Multi-tenant restaurant data with subdomain
    - users: User accounts
    - tenant_settings: Per-restaurant settings
    - tenant_staff: Staff management
    - usage_tracking: Billing metrics
    - billing_history: Invoices
    - promotional_codes: Discount codes
    - domain_verifications: Custom domains
*/

-- Enable extensions
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

-- Restaurants (Multi-Tenant Core)
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

CREATE INDEX idx_restaurants_subdomain ON restaurants(subdomain);
CREATE INDEX idx_restaurants_custom_domain ON restaurants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_restaurants_subscription_status ON restaurants(subscription_status);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
  loyalty_points INTEGER DEFAULT 0,
  dietary_preferences JSONB,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_restaurant_id ON users(restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);

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

CREATE INDEX idx_tenant_staff_restaurant ON tenant_staff(restaurant_id);
CREATE INDEX idx_tenant_staff_user ON tenant_staff(user_id);

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

CREATE INDEX idx_usage_tracking_restaurant ON usage_tracking(restaurant_id);
CREATE INDEX idx_usage_tracking_month ON usage_tracking(month);

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

CREATE INDEX idx_billing_history_restaurant ON billing_history(restaurant_id);
CREATE INDEX idx_billing_history_status ON billing_history(status);

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

CREATE INDEX idx_promotional_codes_code ON promotional_codes(code);

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

CREATE INDEX idx_domain_verifications_restaurant ON domain_verifications(restaurant_id);
CREATE INDEX idx_domain_verifications_domain ON domain_verifications(domain);

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