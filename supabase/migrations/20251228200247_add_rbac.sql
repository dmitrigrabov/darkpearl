create type "public"."user_role" as enum ('admin', 'manager', 'viewer');

drop policy "Inventory is manageable by authenticated users" on "public"."inventory";

drop policy "Inventory is viewable by anyone" on "public"."inventory";

drop policy "Order items are manageable by authenticated users" on "public"."order_items";

drop policy "Order items are viewable by anyone" on "public"."order_items";

drop policy "Orders are manageable by authenticated users" on "public"."orders";

drop policy "Orders are viewable by anyone" on "public"."orders";

drop policy "Products are manageable by authenticated users" on "public"."products";

drop policy "Products are viewable by anyone" on "public"."products";

drop policy "Movements are manageable by authenticated users" on "public"."stock_movements";

drop policy "Movements are viewable by anyone" on "public"."stock_movements";

drop policy "Warehouses are manageable by authenticated users" on "public"."warehouses";

drop policy "Warehouses are viewable by anyone" on "public"."warehouses";


  create table "public"."user_profiles" (
    "id" uuid not null,
    "role" public.user_role not null default 'viewer'::public.user_role,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."user_profiles" enable row level security;

alter table "public"."inventory" add column "created_by" uuid;

alter table "public"."order_items" add column "created_by" uuid;

alter table "public"."orders" add column "created_by" uuid;

alter table "public"."products" add column "created_by" uuid;

alter table "public"."sagas" add column "trigger_run_id" text;

alter table "public"."warehouses" add column "created_by" uuid;

CREATE INDEX idx_inventory_created_by ON public.inventory USING btree (created_by);

CREATE INDEX idx_orders_created_by ON public.orders USING btree (created_by);

CREATE INDEX idx_products_created_by ON public.products USING btree (created_by);

CREATE INDEX idx_sagas_trigger_run ON public.sagas USING btree (trigger_run_id);

CREATE INDEX idx_stock_movements_created_by ON public.stock_movements USING btree (created_by);

CREATE INDEX idx_user_profiles_role ON public.user_profiles USING btree (role);

CREATE INDEX idx_warehouses_created_by ON public.warehouses USING btree (created_by);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."inventory" add constraint "inventory_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."inventory" validate constraint "inventory_created_by_fkey";

alter table "public"."order_items" add constraint "order_items_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."order_items" validate constraint "order_items_created_by_fkey";

alter table "public"."orders" add constraint "orders_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."orders" validate constraint "orders_created_by_fkey";

alter table "public"."products" add constraint "products_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."products" validate constraint "products_created_by_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_id_fkey";

alter table "public"."warehouses" add constraint "warehouses_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."warehouses" validate constraint "warehouses_created_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS public.user_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  RETURN COALESCE(v_role, 'viewer');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN public.get_user_role() = 'admin';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN public.get_user_role() IN ('admin', 'manager');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.owns_or_is_admin(resource_created_by uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN public.is_admin() OR resource_created_by = auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_order_saga()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  supabase_url TEXT;
  request_id BIGINT;
BEGIN
  -- Try standard Supabase setting first (available in hosted Supabase)
  supabase_url := current_setting('supabase.url', true);

  -- Fallback for local development (pg_net runs in Docker, needs host.docker.internal)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    supabase_url := 'http://host.docker.internal:54321';
  END IF;

  -- Call the saga-webhook Edge Function via pg_net
  -- Using x-trigger-source header to identify request origin
  SELECT net.http_post(
    supabase_url || '/functions/v1/saga-webhook',
    jsonb_build_object(
      'type', 'INSERT',
      'table', 'orders',
      'record', jsonb_build_object(
        'id', NEW.id,
        'warehouse_id', NEW.warehouse_id,
        'customer_id', NEW.customer_id,
        'status', NEW.status,
        'total_amount', NEW.total_amount,
        'notes', NEW.notes,
        'payment_reference', NEW.payment_reference,
        'created_at', NEW.created_at,
        'updated_at', NEW.updated_at
      )
    ),
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type', 'application/json',
      'x-trigger-source', 'pg_net'
    )
  ) INTO request_id;

  RAISE LOG 'Saga trigger fired for order %, pg_net request_id: %', NEW.id, request_id;

  RETURN NEW;
END;
$function$
;

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";


  create policy "inventory_delete"
  on "public"."inventory"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "inventory_insert"
  on "public"."inventory"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "inventory_select"
  on "public"."inventory"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "inventory_update"
  on "public"."inventory"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "order_items_delete"
  on "public"."order_items"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "order_items_insert"
  on "public"."order_items"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "order_items_select"
  on "public"."order_items"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL) OR (EXISTS ( SELECT 1
   FROM public.orders
  WHERE ((orders.id = order_items.order_id) AND ((orders.created_by = auth.uid()) OR public.is_admin()))))));



  create policy "order_items_update"
  on "public"."order_items"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "orders_delete"
  on "public"."orders"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "orders_insert"
  on "public"."orders"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "orders_select"
  on "public"."orders"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "orders_update"
  on "public"."orders"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "products_delete"
  on "public"."products"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "products_insert"
  on "public"."products"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "products_select"
  on "public"."products"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "products_update"
  on "public"."products"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "stock_movements_delete"
  on "public"."stock_movements"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "stock_movements_insert"
  on "public"."stock_movements"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "stock_movements_select"
  on "public"."stock_movements"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "Admins can manage profiles"
  on "public"."user_profiles"
  as permissive
  for all
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "Admins can view all profiles"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using (public.is_admin());



  create policy "Users can view own profile"
  on "public"."user_profiles"
  as permissive
  for select
  to authenticated
using ((id = auth.uid()));



  create policy "warehouses_delete"
  on "public"."warehouses"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "warehouses_insert"
  on "public"."warehouses"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "warehouses_select"
  on "public"."warehouses"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "warehouses_update"
  on "public"."warehouses"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));


CREATE TRIGGER on_order_created_saga AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.trigger_order_saga();

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant execute permission to supabase_auth_admin for the custom access token hook
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


