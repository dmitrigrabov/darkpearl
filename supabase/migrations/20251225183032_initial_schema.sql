create type "public"."movement_type" as enum ('receive', 'transfer_out', 'transfer_in', 'adjust', 'reserve', 'release', 'fulfill');

create type "public"."order_status" as enum ('pending', 'reserved', 'payment_processing', 'payment_failed', 'paid', 'fulfilling', 'fulfilled', 'cancelled');

create type "public"."saga_status" as enum ('started', 'step_pending', 'step_executing', 'step_completed', 'step_failed', 'compensating', 'compensation_completed', 'completed', 'failed');

create type "public"."saga_step_type" as enum ('reserve_stock', 'process_payment', 'fulfill_order', 'release_stock', 'void_payment');

create table "public"."inventory" (
    "id" uuid not null default uuid_generate_v4(),
    "product_id" uuid not null,
    "warehouse_id" uuid not null,
    "quantity_available" integer not null default 0,
    "quantity_reserved" integer not null default 0,
    "reorder_point" integer not null default 10,
    "reorder_quantity" integer not null default 50,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."inventory" enable row level security;

create table "public"."order_items" (
    "id" uuid not null default uuid_generate_v4(),
    "order_id" uuid not null,
    "product_id" uuid not null,
    "quantity" integer not null,
    "unit_price" numeric(10,2) not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."order_items" enable row level security;

create table "public"."orders" (
    "id" uuid not null default uuid_generate_v4(),
    "order_number" character varying(50) not null,
    "status" order_status not null default 'pending'::order_status,
    "customer_id" uuid,
    "warehouse_id" uuid not null,
    "total_amount" numeric(12,2) not null default 0,
    "payment_reference" character varying(255),
    "notes" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."orders" enable row level security;

create table "public"."outbox" (
    "id" bigint generated always as identity not null,
    "event_type" character varying(100) not null,
    "aggregate_type" character varying(100) not null,
    "aggregate_id" uuid not null,
    "payload" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "processed_at" timestamp with time zone,
    "retry_count" integer not null default 0
);


alter table "public"."outbox" enable row level security;

create table "public"."products" (
    "id" uuid not null default uuid_generate_v4(),
    "sku" character varying(100) not null,
    "name" character varying(255) not null,
    "description" text,
    "unit_price" numeric(10,2) not null default 0,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."products" enable row level security;

create table "public"."saga_events" (
    "id" uuid not null default uuid_generate_v4(),
    "saga_id" uuid not null,
    "step_type" saga_step_type not null,
    "event_type" character varying(50) not null,
    "payload" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."saga_events" enable row level security;

create table "public"."sagas" (
    "id" uuid not null default uuid_generate_v4(),
    "saga_type" character varying(100) not null,
    "correlation_id" uuid not null,
    "status" saga_status not null default 'started'::saga_status,
    "current_step" saga_step_type,
    "payload" jsonb not null default '{}'::jsonb,
    "error_message" text,
    "retry_count" integer not null default 0,
    "max_retries" integer not null default 3,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "completed_at" timestamp with time zone
);


alter table "public"."sagas" enable row level security;

create table "public"."stock_movements" (
    "id" uuid not null default uuid_generate_v4(),
    "correlation_id" uuid not null,
    "product_id" uuid not null,
    "warehouse_id" uuid not null,
    "movement_type" movement_type not null,
    "quantity" integer not null,
    "reference_id" uuid,
    "reference_type" character varying(50),
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."stock_movements" enable row level security;

create table "public"."warehouses" (
    "id" uuid not null default uuid_generate_v4(),
    "code" character varying(50) not null,
    "name" character varying(255) not null,
    "address" text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."warehouses" enable row level security;

CREATE INDEX idx_inventory_low_stock ON public.inventory USING btree (product_id, warehouse_id) WHERE (quantity_available <= reorder_point);

CREATE INDEX idx_inventory_product ON public.inventory USING btree (product_id);

CREATE INDEX idx_inventory_warehouse ON public.inventory USING btree (warehouse_id);

CREATE INDEX idx_movements_correlation ON public.stock_movements USING btree (correlation_id);

CREATE INDEX idx_movements_created_at ON public.stock_movements USING btree (created_at DESC);

CREATE UNIQUE INDEX idx_movements_idempotent ON public.stock_movements USING btree (correlation_id, movement_type, product_id, warehouse_id);

CREATE INDEX idx_movements_product ON public.stock_movements USING btree (product_id);

CREATE INDEX idx_movements_reference ON public.stock_movements USING btree (reference_id, reference_type);

CREATE INDEX idx_movements_warehouse ON public.stock_movements USING btree (warehouse_id);

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);

CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);

CREATE INDEX idx_orders_status ON public.orders USING btree (status);

CREATE INDEX idx_outbox_aggregate ON public.outbox USING btree (aggregate_type, aggregate_id);

CREATE INDEX idx_outbox_unprocessed ON public.outbox USING btree (id) WHERE (processed_at IS NULL);

CREATE INDEX idx_products_active ON public.products USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_products_sku ON public.products USING btree (sku);

CREATE INDEX idx_saga_events_created ON public.saga_events USING btree (created_at DESC);

CREATE INDEX idx_saga_events_saga ON public.saga_events USING btree (saga_id);

CREATE INDEX idx_sagas_correlation ON public.sagas USING btree (correlation_id);

CREATE INDEX idx_sagas_status ON public.sagas USING btree (status);

CREATE INDEX idx_sagas_type ON public.sagas USING btree (saga_type);

CREATE INDEX idx_warehouses_active ON public.warehouses USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_warehouses_code ON public.warehouses USING btree (code);

CREATE UNIQUE INDEX inventory_pkey ON public.inventory USING btree (id);

CREATE UNIQUE INDEX inventory_product_id_warehouse_id_key ON public.inventory USING btree (product_id, warehouse_id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE UNIQUE INDEX outbox_pkey ON public.outbox USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);

CREATE UNIQUE INDEX saga_events_pkey ON public.saga_events USING btree (id);

CREATE UNIQUE INDEX sagas_correlation_id_key ON public.sagas USING btree (correlation_id);

CREATE UNIQUE INDEX sagas_pkey ON public.sagas USING btree (id);

CREATE UNIQUE INDEX stock_movements_pkey ON public.stock_movements USING btree (id);

CREATE UNIQUE INDEX warehouses_code_key ON public.warehouses USING btree (code);

CREATE UNIQUE INDEX warehouses_pkey ON public.warehouses USING btree (id);

alter table "public"."inventory" add constraint "inventory_pkey" PRIMARY KEY using index "inventory_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."outbox" add constraint "outbox_pkey" PRIMARY KEY using index "outbox_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."saga_events" add constraint "saga_events_pkey" PRIMARY KEY using index "saga_events_pkey";

alter table "public"."sagas" add constraint "sagas_pkey" PRIMARY KEY using index "sagas_pkey";

alter table "public"."stock_movements" add constraint "stock_movements_pkey" PRIMARY KEY using index "stock_movements_pkey";

alter table "public"."warehouses" add constraint "warehouses_pkey" PRIMARY KEY using index "warehouses_pkey";

alter table "public"."inventory" add constraint "inventory_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE not valid;

alter table "public"."inventory" validate constraint "inventory_product_id_fkey";

alter table "public"."inventory" add constraint "inventory_product_id_warehouse_id_key" UNIQUE using index "inventory_product_id_warehouse_id_key";

alter table "public"."inventory" add constraint "inventory_quantity_available_check" CHECK ((quantity_available >= 0)) not valid;

alter table "public"."inventory" validate constraint "inventory_quantity_available_check";

alter table "public"."inventory" add constraint "inventory_quantity_reserved_check" CHECK ((quantity_reserved >= 0)) not valid;

alter table "public"."inventory" validate constraint "inventory_quantity_reserved_check";

alter table "public"."inventory" add constraint "inventory_warehouse_id_fkey" FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE not valid;

alter table "public"."inventory" validate constraint "inventory_warehouse_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."order_items" add constraint "order_items_quantity_check" CHECK ((quantity > 0)) not valid;

alter table "public"."order_items" validate constraint "order_items_quantity_check";

alter table "public"."orders" add constraint "orders_order_number_key" UNIQUE using index "orders_order_number_key";

alter table "public"."orders" add constraint "orders_warehouse_id_fkey" FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) not valid;

alter table "public"."orders" validate constraint "orders_warehouse_id_fkey";

alter table "public"."products" add constraint "products_sku_key" UNIQUE using index "products_sku_key";

alter table "public"."saga_events" add constraint "saga_events_saga_id_fkey" FOREIGN KEY (saga_id) REFERENCES sagas(id) ON DELETE CASCADE not valid;

alter table "public"."saga_events" validate constraint "saga_events_saga_id_fkey";

alter table "public"."sagas" add constraint "sagas_correlation_id_key" UNIQUE using index "sagas_correlation_id_key";

alter table "public"."stock_movements" add constraint "stock_movements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_product_id_fkey";

alter table "public"."stock_movements" add constraint "stock_movements_warehouse_id_fkey" FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) not valid;

alter table "public"."stock_movements" validate constraint "stock_movements_warehouse_id_fkey";

alter table "public"."warehouses" add constraint "warehouses_code_key" UNIQUE using index "warehouses_code_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_outbox_event(p_event_type character varying, p_aggregate_type character varying, p_aggregate_id uuid, p_payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
  event_id BIGINT;
BEGIN
  INSERT INTO outbox (event_type, aggregate_type, aggregate_id, payload)
  VALUES (p_event_type, p_aggregate_type, p_aggregate_id, p_payload)
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_stock_availability(p_product_id uuid, p_warehouse_id uuid, p_quantity integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  available INTEGER;
BEGIN
  SELECT quantity_available - quantity_reserved INTO available
  FROM inventory
  WHERE product_id = p_product_id AND warehouse_id = p_warehouse_id;

  RETURN COALESCE(available, 0) >= p_quantity;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."inventory" to "anon";

grant insert on table "public"."inventory" to "anon";

grant references on table "public"."inventory" to "anon";

grant select on table "public"."inventory" to "anon";

grant trigger on table "public"."inventory" to "anon";

grant truncate on table "public"."inventory" to "anon";

grant update on table "public"."inventory" to "anon";

grant delete on table "public"."inventory" to "authenticated";

grant insert on table "public"."inventory" to "authenticated";

grant references on table "public"."inventory" to "authenticated";

grant select on table "public"."inventory" to "authenticated";

grant trigger on table "public"."inventory" to "authenticated";

grant truncate on table "public"."inventory" to "authenticated";

grant update on table "public"."inventory" to "authenticated";

grant delete on table "public"."inventory" to "service_role";

grant insert on table "public"."inventory" to "service_role";

grant references on table "public"."inventory" to "service_role";

grant select on table "public"."inventory" to "service_role";

grant trigger on table "public"."inventory" to "service_role";

grant truncate on table "public"."inventory" to "service_role";

grant update on table "public"."inventory" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."outbox" to "anon";

grant insert on table "public"."outbox" to "anon";

grant references on table "public"."outbox" to "anon";

grant select on table "public"."outbox" to "anon";

grant trigger on table "public"."outbox" to "anon";

grant truncate on table "public"."outbox" to "anon";

grant update on table "public"."outbox" to "anon";

grant delete on table "public"."outbox" to "authenticated";

grant insert on table "public"."outbox" to "authenticated";

grant references on table "public"."outbox" to "authenticated";

grant select on table "public"."outbox" to "authenticated";

grant trigger on table "public"."outbox" to "authenticated";

grant truncate on table "public"."outbox" to "authenticated";

grant update on table "public"."outbox" to "authenticated";

grant delete on table "public"."outbox" to "service_role";

grant insert on table "public"."outbox" to "service_role";

grant references on table "public"."outbox" to "service_role";

grant select on table "public"."outbox" to "service_role";

grant trigger on table "public"."outbox" to "service_role";

grant truncate on table "public"."outbox" to "service_role";

grant update on table "public"."outbox" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."saga_events" to "anon";

grant insert on table "public"."saga_events" to "anon";

grant references on table "public"."saga_events" to "anon";

grant select on table "public"."saga_events" to "anon";

grant trigger on table "public"."saga_events" to "anon";

grant truncate on table "public"."saga_events" to "anon";

grant update on table "public"."saga_events" to "anon";

grant delete on table "public"."saga_events" to "authenticated";

grant insert on table "public"."saga_events" to "authenticated";

grant references on table "public"."saga_events" to "authenticated";

grant select on table "public"."saga_events" to "authenticated";

grant trigger on table "public"."saga_events" to "authenticated";

grant truncate on table "public"."saga_events" to "authenticated";

grant update on table "public"."saga_events" to "authenticated";

grant delete on table "public"."saga_events" to "service_role";

grant insert on table "public"."saga_events" to "service_role";

grant references on table "public"."saga_events" to "service_role";

grant select on table "public"."saga_events" to "service_role";

grant trigger on table "public"."saga_events" to "service_role";

grant truncate on table "public"."saga_events" to "service_role";

grant update on table "public"."saga_events" to "service_role";

grant delete on table "public"."sagas" to "anon";

grant insert on table "public"."sagas" to "anon";

grant references on table "public"."sagas" to "anon";

grant select on table "public"."sagas" to "anon";

grant trigger on table "public"."sagas" to "anon";

grant truncate on table "public"."sagas" to "anon";

grant update on table "public"."sagas" to "anon";

grant delete on table "public"."sagas" to "authenticated";

grant insert on table "public"."sagas" to "authenticated";

grant references on table "public"."sagas" to "authenticated";

grant select on table "public"."sagas" to "authenticated";

grant trigger on table "public"."sagas" to "authenticated";

grant truncate on table "public"."sagas" to "authenticated";

grant update on table "public"."sagas" to "authenticated";

grant delete on table "public"."sagas" to "service_role";

grant insert on table "public"."sagas" to "service_role";

grant references on table "public"."sagas" to "service_role";

grant select on table "public"."sagas" to "service_role";

grant trigger on table "public"."sagas" to "service_role";

grant truncate on table "public"."sagas" to "service_role";

grant update on table "public"."sagas" to "service_role";

grant delete on table "public"."stock_movements" to "anon";

grant insert on table "public"."stock_movements" to "anon";

grant references on table "public"."stock_movements" to "anon";

grant select on table "public"."stock_movements" to "anon";

grant trigger on table "public"."stock_movements" to "anon";

grant truncate on table "public"."stock_movements" to "anon";

grant update on table "public"."stock_movements" to "anon";

grant delete on table "public"."stock_movements" to "authenticated";

grant insert on table "public"."stock_movements" to "authenticated";

grant references on table "public"."stock_movements" to "authenticated";

grant select on table "public"."stock_movements" to "authenticated";

grant trigger on table "public"."stock_movements" to "authenticated";

grant truncate on table "public"."stock_movements" to "authenticated";

grant update on table "public"."stock_movements" to "authenticated";

grant delete on table "public"."stock_movements" to "service_role";

grant insert on table "public"."stock_movements" to "service_role";

grant references on table "public"."stock_movements" to "service_role";

grant select on table "public"."stock_movements" to "service_role";

grant trigger on table "public"."stock_movements" to "service_role";

grant truncate on table "public"."stock_movements" to "service_role";

grant update on table "public"."stock_movements" to "service_role";

grant delete on table "public"."warehouses" to "anon";

grant insert on table "public"."warehouses" to "anon";

grant references on table "public"."warehouses" to "anon";

grant select on table "public"."warehouses" to "anon";

grant trigger on table "public"."warehouses" to "anon";

grant truncate on table "public"."warehouses" to "anon";

grant update on table "public"."warehouses" to "anon";

grant delete on table "public"."warehouses" to "authenticated";

grant insert on table "public"."warehouses" to "authenticated";

grant references on table "public"."warehouses" to "authenticated";

grant select on table "public"."warehouses" to "authenticated";

grant trigger on table "public"."warehouses" to "authenticated";

grant truncate on table "public"."warehouses" to "authenticated";

grant update on table "public"."warehouses" to "authenticated";

grant delete on table "public"."warehouses" to "service_role";

grant insert on table "public"."warehouses" to "service_role";

grant references on table "public"."warehouses" to "service_role";

grant select on table "public"."warehouses" to "service_role";

grant trigger on table "public"."warehouses" to "service_role";

grant truncate on table "public"."warehouses" to "service_role";

grant update on table "public"."warehouses" to "service_role";

create policy "Inventory is manageable by service role"
on "public"."inventory"
as permissive
for all
to service_role
using (true);


create policy "Inventory is viewable by authenticated users"
on "public"."inventory"
as permissive
for select
to authenticated
using (true);


create policy "Order items are insertable by authenticated"
on "public"."order_items"
as permissive
for insert
to authenticated
with check (true);


create policy "Order items are manageable by service role"
on "public"."order_items"
as permissive
for all
to service_role
using (true);


create policy "Order items follow order access"
on "public"."order_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND ((orders.customer_id = auth.uid()) OR (auth.role() = 'service_role'::text))))));


create policy "Orders are manageable by service role"
on "public"."orders"
as permissive
for all
to service_role
using (true);


create policy "Users can create orders"
on "public"."orders"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can view their own orders"
on "public"."orders"
as permissive
for select
to authenticated
using (((customer_id = auth.uid()) OR (auth.role() = 'service_role'::text)));


create policy "Outbox is manageable by service role"
on "public"."outbox"
as permissive
for all
to service_role
using (true);


create policy "Products are manageable by service role"
on "public"."products"
as permissive
for all
to service_role
using (true);


create policy "Products are viewable by authenticated users"
on "public"."products"
as permissive
for select
to authenticated
using (true);


create policy "Saga events are manageable by service role"
on "public"."saga_events"
as permissive
for all
to service_role
using (true);


create policy "Sagas are manageable by service role"
on "public"."sagas"
as permissive
for all
to service_role
using (true);


create policy "Movements are manageable by service role"
on "public"."stock_movements"
as permissive
for all
to service_role
using (true);


create policy "Movements are viewable by authenticated users"
on "public"."stock_movements"
as permissive
for select
to authenticated
using (true);


create policy "Warehouses are manageable by service role"
on "public"."warehouses"
as permissive
for all
to service_role
using (true);


create policy "Warehouses are viewable by authenticated users"
on "public"."warehouses"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_generate_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sagas_updated_at BEFORE UPDATE ON public.sagas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


