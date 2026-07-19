-- ============================================================
-- FULL REPLACEMENT: drop old, create new admin-priority rotation
-- ============================================================

-- Drop old tables (CASCADE handles FKs, triggers, policies)
DROP TABLE IF EXISTS public.organic_run_schedule CASCADE;
DROP TABLE IF EXISTS public.engagement_order_items CASCADE;
DROP TABLE IF EXISTS public.engagement_orders CASCADE;
DROP TABLE IF EXISTS public.engagement_bundles CASCADE;
DROP TABLE IF EXISTS public.bundle_items CASCADE;
DROP TABLE IF EXISTS public.user_bundle_item_providers CASCADE;
DROP TABLE IF EXISTS public.user_bundle_items CASCADE;
DROP TABLE IF EXISTS public.user_bundles CASCADE;
DROP TABLE IF EXISTS public.user_services CASCADE;
DROP TABLE IF EXISTS public.user_provider_accounts CASCADE;
DROP TABLE IF EXISTS public.provider_accounts CASCADE;
DROP TABLE IF EXISTS public.service_provider_mapping CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.deposits CASCADE;
DROP TABLE IF EXISTS public.oxapay_deposits CASCADE;
DROP TABLE IF EXISTS public.oxapay_webhook_events CASCADE;
DROP TABLE IF EXISTS public.zapupi_deposits CASCADE;
DROP TABLE IF EXISTS public.zapupi_webhook_events CASCADE;
DROP TABLE IF EXISTS public.razorpay_webhook_events CASCADE;
DROP TABLE IF EXISTS public.subscription_payments CASCADE;
DROP TABLE IF EXISTS public.subscription_requests CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.subscription_plans CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;
DROP TABLE IF EXISTS public.rotation_alert_state CASCADE;
DROP TABLE IF EXISTS public.admin_audit_log CASCADE;
DROP TABLE IF EXISTS public.popup_ads CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS public.debit_wallet_for_order CASCADE;
DROP FUNCTION IF EXISTS public.cancel_order_with_refund CASCADE;
DROP FUNCTION IF EXISTS public.credit_wallet_oxapay CASCADE;
DROP FUNCTION IF EXISTS public.credit_wallet_zapupi CASCADE;
DROP FUNCTION IF EXISTS public.activate_subscription_from_payment CASCADE;
DROP FUNCTION IF EXISTS public.enforce_active_subscription CASCADE;
DROP FUNCTION IF EXISTS public.enforce_deposit_provenance CASCADE;
DROP FUNCTION IF EXISTS public.enforce_wallet_credit_trail CASCADE;
DROP FUNCTION IF EXISTS public.guard_subscription_write CASCADE;
DROP FUNCTION IF EXISTS public.guard_oxapay_deposit_change CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_completed_orders CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_completed_engagement_orders CASCADE;
DROP FUNCTION IF EXISTS public.reschedule_organic_run CASCADE;
DROP FUNCTION IF EXISTS public.get_provider_topup_breakdown CASCADE;
DROP FUNCTION IF EXISTS public.get_top_pending_users CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_users_summary CASCADE;
DROP FUNCTION IF EXISTS public.admin_ban_user_and_cancel CASCADE;
DROP FUNCTION IF EXISTS public.admin_unban_user CASCADE;
DROP FUNCTION IF EXISTS public.is_maintenance_mode CASCADE;
DROP FUNCTION IF EXISTS public.get_public_markup CASCADE;
DROP FUNCTION IF EXISTS public.compute_rotation_lock_key CASCADE;
DROP FUNCTION IF EXISTS public.organic_run_schedule_lock_user_columns CASCADE;
DROP FUNCTION IF EXISTS public.engagement_order_items_lock_user_columns CASCADE;
DROP FUNCTION IF EXISTS public.engagement_orders_lock_user_columns CASCADE;
DROP FUNCTION IF EXISTS public.engagement_order_items_tracking_recompute CASCADE;
DROP FUNCTION IF EXISTS public.orders_tracking_recompute CASCADE;
DROP FUNCTION IF EXISTS public.cancel_pending_runs_on_item_cancel CASCADE;
DROP FUNCTION IF EXISTS public.cancel_pending_runs_on_eo_cancel CASCADE;
DROP FUNCTION IF EXISTS public.set_engagement_order_completed_at CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message CASCADE;
DROP FUNCTION IF EXISTS public.create_user_subscription CASCADE;
DROP FUNCTION IF EXISTS public.is_user_banned CASCADE;
DROP FUNCTION IF EXISTS public.has_active_subscription CASCADE;
DROP FUNCTION IF EXISTS public.pg_advisory_xact_lock(bigint) CASCADE;

-- Keep: profiles, user_roles, app_role enum, handle_new_user, has_role, update_updated_at_column, get_user_role
-- Wipe all roles (fresh admin setup)
DELETE FROM public.user_roles;

-- ============================================================
-- PROVIDERS
-- ============================================================
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  last_balance_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_admin_all" ON public.providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  min_quantity INT NOT NULL DEFAULT 1,
  max_quantity INT NOT NULL DEFAULT 100000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  provider_id UUID, -- legacy, ignored by rotation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_read_active" ON public.services FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "services_admin_write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SERVICE_PROVIDER_MAPPING
-- ============================================================
CREATE TABLE public.service_provider_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  provider_service_id TEXT NOT NULL,
  priority INT NOT NULL DEFAULT 1,
  min_quantity INT NOT NULL DEFAULT 1,
  max_quantity INT NOT NULL DEFAULT 100000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_id, provider_id)
);
CREATE INDEX idx_spm_service_priority ON public.service_provider_mapping(service_id, priority) WHERE is_active;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_provider_mapping TO authenticated;
GRANT ALL ON public.service_provider_mapping TO service_role;
ALTER TABLE public.service_provider_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spm_read_authenticated" ON public.service_provider_mapping FOR SELECT TO authenticated USING (true);
CREATE POLICY "spm_admin_write" ON public.service_provider_mapping FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER spm_updated_at BEFORE UPDATE ON public.service_provider_mapping
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SUBSCRIPTION PLANS + SUBSCRIPTIONS
-- ============================================================
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration_days INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO authenticated, anon;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "plans_admin_write" ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.subscription_plans (plan_type, name, price, duration_days) VALUES
  ('monthly',  'Monthly',  39,  30),
  ('yearly',   'Yearly',   99,  365),
  ('lifetime', 'Lifetime', 199, NULL);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'none',
  status TEXT NOT NULL DEFAULT 'inactive',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_own_read" ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "subs_admin_write" ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER subs_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create inactive subscription row on new user
CREATE OR REPLACE FUNCTION public.create_user_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'none', 'inactive') ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created_sub ON auth.users;
CREATE TRIGGER on_auth_user_created_sub AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_subscription();

-- Has-active-subscription helper
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND plan_type IN ('monthly','yearly','lifetime')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq START 1000;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number BIGINT NOT NULL UNIQUE DEFAULT nextval('public.orders_order_number_seq'),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  link TEXT NOT NULL,
  quantity INT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  -- Rotation state
  provider_order_id TEXT,
  provider_used UUID REFERENCES public.providers(id),
  tried_providers UUID[] NOT NULL DEFAULT '{}',
  -- Progress
  start_count INT DEFAULT 0,
  remains INT,
  error_message TEXT,
  retry_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  last_status_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_status_retry ON public.orders(status, next_retry_at) WHERE status IN ('pending','queued');
CREATE INDEX idx_orders_processing ON public.orders(status, last_status_check) WHERE status = 'processing';
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
GRANT SELECT ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_own_read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "orders_own_insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_admin_write" ON public.orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Subscription gate: block order INSERT for users without active subscription (admins bypass)
CREATE OR REPLACE FUNCTION public.enforce_order_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF current_user IN ('postgres','supabase_admin','service_role')
     OR current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF public.has_role(v_uid, 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NOT public.has_active_subscription(v_uid) THEN
    RAISE EXCEPTION 'Active subscription required to place orders'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER orders_subscription_gate BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_subscription();

-- ============================================================
-- Admin dashboard helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_queue_health()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT json_build_object(
    'queued_count', (SELECT COUNT(*) FROM orders WHERE status = 'queued'),
    'pending_count', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'processing_count', (SELECT COUNT(*) FROM orders WHERE status = 'processing'),
    'oldest_queued_age_seconds', COALESCE(
      (SELECT EXTRACT(EPOCH FROM (now() - MIN(created_at)))::INT
       FROM orders WHERE status = 'queued'), 0),
    'provider_stats', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT p.id, p.name,
          COUNT(o.id) FILTER (WHERE o.created_at > now() - interval '24 hours') AS orders_24h,
          COUNT(o.id) FILTER (WHERE o.status IN ('completed','partial') AND o.created_at > now() - interval '24 hours') AS success_24h
        FROM providers p LEFT JOIN orders o ON o.provider_used = p.id
        WHERE p.is_active GROUP BY p.id, p.name ORDER BY p.name
      ) t
    )
  ) INTO v_result;
  RETURN v_result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_queue_health TO authenticated;

-- Enable extensions for cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;