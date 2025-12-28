-- Role-Based Access Control (RBAC)

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'admin',    -- Full access to all resources
  'manager',  -- Can create/update resources, see all resources
  'viewer'    -- Read-only access to own resources
);

-- User profiles with role
-- Links to auth.users and stores the role
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add created_by to domain tables that don't have it
ALTER TABLE products ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE warehouses ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE inventory ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN created_by UUID REFERENCES auth.users(id);
ALTER TABLE order_items ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Indexes for ownership queries
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_warehouses_created_by ON warehouses(created_by);
CREATE INDEX idx_inventory_created_by ON inventory(created_by);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_stock_movements_created_by ON stock_movements(created_by);

-- Helper function to get current user's role
-- Must use fully qualified names for RLS policy evaluation
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS public.user_role AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_user_role() IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check ownership or admin
CREATE OR REPLACE FUNCTION owns_or_is_admin(resource_created_by UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin() OR resource_created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Custom access token hook for adding role to JWT claims
-- Must use fully qualified names (public.user_role, public.user_profiles)
-- because supabase_auth_admin has a different search_path
CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB AS $$
DECLARE
  claims JSONB;
  v_role public.user_role;
BEGIN
  -- Get user's role
  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::UUID;

  -- Get existing claims
  claims := event->'claims';

  -- Add role to claims (default to 'viewer' if no profile)
  claims := jsonb_set(claims, '{user_role}', to_jsonb(COALESCE(v_role::TEXT, 'viewer')));

  -- Return modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to supabase_auth_admin for the hook
GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION custom_access_token_hook FROM authenticated, anon, public;

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
