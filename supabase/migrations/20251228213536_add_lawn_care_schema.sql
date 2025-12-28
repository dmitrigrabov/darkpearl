create type "public"."invoice_status" as enum ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded');

create type "public"."job_status" as enum ('scheduled', 'in_progress', 'completed', 'cancelled', 'skipped', 'rescheduled');

create type "public"."lawn_condition" as enum ('excellent', 'good', 'fair', 'poor', 'new');

create type "public"."payment_method" as enum ('card', 'bank_transfer', 'direct_debit', 'cash', 'cheque');

create type "public"."route_status" as enum ('draft', 'confirmed', 'in_progress', 'completed', 'cancelled');

create type "public"."treatment_plan_status" as enum ('active', 'paused', 'completed', 'cancelled');

create type "public"."treatment_season" as enum ('spring_early', 'spring_late', 'summer', 'autumn_early', 'autumn_late');

alter type "public"."movement_type" rename to "movement_type__old_version_to_be_dropped";

create type "public"."movement_type" as enum ('receive', 'transfer_out', 'transfer_in', 'adjust', 'reserve', 'release', 'fulfill', 'consume');


  create table "public"."customers" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "customer_number" character varying(20) not null,
    "first_name" character varying(100) not null,
    "last_name" character varying(100) not null,
    "email" character varying(255),
    "phone" character varying(20),
    "phone_secondary" character varying(20),
    "billing_address_line1" character varying(255),
    "billing_address_line2" character varying(255),
    "billing_city" character varying(100),
    "billing_postcode" character varying(10),
    "is_active" boolean not null default true,
    "preferred_contact_method" character varying(20) default 'email'::character varying,
    "marketing_consent" boolean not null default false,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."customers" enable row level security;


  create table "public"."invoice_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invoice_id" uuid not null,
    "job_id" uuid,
    "description" text not null,
    "quantity" numeric(10,2) not null default 1,
    "unit_price" numeric(10,2) not null,
    "line_total" numeric(12,2) not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."invoice_items" enable row level security;


  create table "public"."invoices" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "customer_id" uuid not null,
    "invoice_number" character varying(20) not null,
    "status" public.invoice_status not null default 'draft'::public.invoice_status,
    "issue_date" date not null default CURRENT_DATE,
    "due_date" date not null,
    "subtotal" numeric(12,2) not null default 0,
    "vat_rate" numeric(4,2) default 20.00,
    "vat_amount" numeric(12,2) not null default 0,
    "total_amount" numeric(12,2) not null default 0,
    "amount_paid" numeric(12,2) not null default 0,
    "payment_terms_days" integer default 30,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."invoices" enable row level security;


  create table "public"."job_consumptions" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "job_id" uuid not null,
    "job_treatment_id" uuid not null,
    "product_id" uuid not null,
    "warehouse_id" uuid not null,
    "quantity_consumed" numeric(10,4) not null,
    "stock_movement_id" uuid,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."job_consumptions" enable row level security;


  create table "public"."job_treatments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "job_id" uuid not null,
    "treatment_id" uuid not null,
    "price_charged" numeric(10,2) not null,
    "duration_minutes" integer,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."job_treatments" enable row level security;


  create table "public"."jobs" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "lawn_id" uuid not null,
    "route_stop_id" uuid,
    "treatment_plan_item_id" uuid,
    "job_number" character varying(20) not null,
    "status" public.job_status not null default 'scheduled'::public.job_status,
    "scheduled_date" date not null,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "performed_by" uuid,
    "lawn_area_sqm" numeric(10,2) not null,
    "lawn_condition_at_job" public.lawn_condition,
    "before_notes" text,
    "after_notes" text,
    "customer_signature_url" text,
    "before_photos" jsonb default '[]'::jsonb,
    "after_photos" jsonb default '[]'::jsonb,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."jobs" enable row level security;


  create table "public"."lawns" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "customer_id" uuid not null,
    "address_line1" character varying(255) not null,
    "address_line2" character varying(255),
    "city" character varying(100) not null,
    "postcode" character varying(10) not null,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "area_sqm" numeric(10,2) not null,
    "lawn_condition" public.lawn_condition not null default 'new'::public.lawn_condition,
    "access_notes" text,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."lawns" enable row level security;


  create table "public"."operators" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "depot_id" uuid not null,
    "employee_number" character varying(20) not null,
    "first_name" character varying(100) not null,
    "last_name" character varying(100) not null,
    "email" character varying(255),
    "phone" character varying(20) not null,
    "hourly_cost" numeric(8,2) not null,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."operators" enable row level security;


  create table "public"."payments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "invoice_id" uuid not null,
    "customer_id" uuid not null,
    "payment_reference" character varying(100),
    "payment_method" public.payment_method not null,
    "amount" numeric(12,2) not null,
    "payment_date" date not null default CURRENT_DATE,
    "is_confirmed" boolean not null default false,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."payments" enable row level security;


  create table "public"."route_stops" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "route_id" uuid not null,
    "lawn_id" uuid not null,
    "job_id" uuid,
    "stop_order" integer not null,
    "estimated_arrival" timestamp with time zone,
    "estimated_departure" timestamp with time zone,
    "actual_arrival" timestamp with time zone,
    "actual_departure" timestamp with time zone,
    "distance_from_previous_miles" numeric(6,2),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."route_stops" enable row level security;


  create table "public"."routes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "operator_id" uuid not null,
    "vehicle_id" uuid,
    "depot_id" uuid not null,
    "route_date" date not null,
    "status" public.route_status not null default 'draft'::public.route_status,
    "estimated_distance_miles" numeric(8,2),
    "actual_distance_miles" numeric(8,2),
    "estimated_duration_minutes" integer,
    "actual_duration_minutes" integer,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."routes" enable row level security;


  create table "public"."treatment_plan_items" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "treatment_plan_id" uuid not null,
    "treatment_id" uuid not null,
    "scheduled_week" date,
    "window_start" date,
    "window_end" date,
    "price_snapshot" numeric(10,2) not null,
    "is_completed" boolean not null default false,
    "completed_job_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."treatment_plan_items" enable row level security;


  create table "public"."treatment_plans" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "lawn_id" uuid not null,
    "year" integer not null,
    "status" public.treatment_plan_status not null default 'active'::public.treatment_plan_status,
    "total_estimated_price" numeric(12,2),
    "notes" text,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."treatment_plans" enable row level security;


  create table "public"."treatment_products" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "treatment_id" uuid not null,
    "product_id" uuid not null,
    "quantity_per_100sqm" numeric(10,4) not null,
    "quantity_multiplier_poor" numeric(4,2) default 1.2,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."treatment_products" enable row level security;


  create table "public"."treatments" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "code" character varying(20) not null,
    "name" character varying(100) not null,
    "description" text,
    "season" public.treatment_season,
    "sequence_in_year" integer,
    "price_per_sqm" numeric(10,4) not null,
    "min_price" numeric(10,2) default 0,
    "minutes_per_100sqm" numeric(6,2) not null,
    "setup_minutes" integer default 5,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."treatments" enable row level security;


  create table "public"."vehicles" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "depot_id" uuid not null,
    "registration" character varying(15) not null,
    "make" character varying(50),
    "vehicle_model" character varying(50),
    "cost_per_mile" numeric(6,4),
    "load_capacity_kg" numeric(8,2),
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."vehicles" enable row level security;

alter table "public"."stock_movements" alter column movement_type type "public"."movement_type" using movement_type::text::"public"."movement_type";

drop type "public"."movement_type__old_version_to_be_dropped";

alter table "public"."warehouses" add column "is_depot" boolean not null default false;

alter table "public"."warehouses" add column "latitude" numeric(10,8);

alter table "public"."warehouses" add column "longitude" numeric(11,8);

alter table "public"."warehouses" add column "postcode" character varying(10);

alter table "public"."warehouses" add column "service_radius_miles" numeric(6,2);

CREATE UNIQUE INDEX customers_customer_number_key ON public.customers USING btree (customer_number);

CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

CREATE INDEX idx_customers_active ON public.customers USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_customers_created_by ON public.customers USING btree (created_by);

CREATE INDEX idx_customers_email ON public.customers USING btree (email);

CREATE INDEX idx_customers_name ON public.customers USING btree (last_name, first_name);

CREATE INDEX idx_customers_number ON public.customers USING btree (customer_number);

CREATE INDEX idx_customers_postcode ON public.customers USING btree (billing_postcode);

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items USING btree (invoice_id);

CREATE INDEX idx_invoice_items_job ON public.invoice_items USING btree (job_id);

CREATE INDEX idx_invoices_created_by ON public.invoices USING btree (created_by);

CREATE INDEX idx_invoices_customer ON public.invoices USING btree (customer_id);

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);

CREATE INDEX idx_invoices_number ON public.invoices USING btree (invoice_number);

CREATE INDEX idx_invoices_overdue ON public.invoices USING btree (due_date, status) WHERE (status <> ALL (ARRAY['paid'::public.invoice_status, 'cancelled'::public.invoice_status, 'refunded'::public.invoice_status]));

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE INDEX idx_job_consumptions_job ON public.job_consumptions USING btree (job_id);

CREATE INDEX idx_job_consumptions_movement ON public.job_consumptions USING btree (stock_movement_id);

CREATE INDEX idx_job_consumptions_product ON public.job_consumptions USING btree (product_id);

CREATE INDEX idx_job_consumptions_treatment ON public.job_consumptions USING btree (job_treatment_id);

CREATE INDEX idx_job_treatments_job ON public.job_treatments USING btree (job_id);

CREATE INDEX idx_job_treatments_treatment ON public.job_treatments USING btree (treatment_id);

CREATE INDEX idx_jobs_created_by ON public.jobs USING btree (created_by);

CREATE INDEX idx_jobs_date ON public.jobs USING btree (scheduled_date);

CREATE INDEX idx_jobs_lawn ON public.jobs USING btree (lawn_id);

CREATE INDEX idx_jobs_number ON public.jobs USING btree (job_number);

CREATE INDEX idx_jobs_performer ON public.jobs USING btree (performed_by);

CREATE INDEX idx_jobs_route_stop ON public.jobs USING btree (route_stop_id);

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);

CREATE INDEX idx_jobs_treatment_plan_item ON public.jobs USING btree (treatment_plan_item_id);

CREATE INDEX idx_lawns_active ON public.lawns USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_lawns_created_by ON public.lawns USING btree (created_by);

CREATE INDEX idx_lawns_customer ON public.lawns USING btree (customer_id);

CREATE INDEX idx_lawns_location ON public.lawns USING btree (latitude, longitude);

CREATE INDEX idx_lawns_postcode ON public.lawns USING btree (postcode);

CREATE INDEX idx_operators_active ON public.operators USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_operators_created_by ON public.operators USING btree (created_by);

CREATE INDEX idx_operators_depot ON public.operators USING btree (depot_id);

CREATE INDEX idx_operators_employee_number ON public.operators USING btree (employee_number);

CREATE INDEX idx_operators_user ON public.operators USING btree (user_id);

CREATE INDEX idx_payments_created_by ON public.payments USING btree (created_by);

CREATE INDEX idx_payments_customer ON public.payments USING btree (customer_id);

CREATE INDEX idx_payments_date ON public.payments USING btree (payment_date);

CREATE INDEX idx_payments_invoice ON public.payments USING btree (invoice_id);

CREATE INDEX idx_payments_reference ON public.payments USING btree (payment_reference);

CREATE INDEX idx_route_stops_job ON public.route_stops USING btree (job_id);

CREATE INDEX idx_route_stops_lawn ON public.route_stops USING btree (lawn_id);

CREATE INDEX idx_route_stops_order ON public.route_stops USING btree (route_id, stop_order);

CREATE INDEX idx_route_stops_route ON public.route_stops USING btree (route_id);

CREATE INDEX idx_routes_created_by ON public.routes USING btree (created_by);

CREATE INDEX idx_routes_date ON public.routes USING btree (route_date);

CREATE INDEX idx_routes_depot ON public.routes USING btree (depot_id);

CREATE INDEX idx_routes_operator ON public.routes USING btree (operator_id);

CREATE INDEX idx_routes_operator_date ON public.routes USING btree (operator_id, route_date);

CREATE INDEX idx_routes_status ON public.routes USING btree (status);

CREATE INDEX idx_routes_vehicle ON public.routes USING btree (vehicle_id);

CREATE INDEX idx_treatment_plan_items_pending ON public.treatment_plan_items USING btree (is_completed) WHERE (is_completed = false);

CREATE INDEX idx_treatment_plan_items_plan ON public.treatment_plan_items USING btree (treatment_plan_id);

CREATE INDEX idx_treatment_plan_items_scheduled ON public.treatment_plan_items USING btree (scheduled_week);

CREATE INDEX idx_treatment_plan_items_treatment ON public.treatment_plan_items USING btree (treatment_id);

CREATE INDEX idx_treatment_plans_created_by ON public.treatment_plans USING btree (created_by);

CREATE INDEX idx_treatment_plans_lawn ON public.treatment_plans USING btree (lawn_id);

CREATE INDEX idx_treatment_plans_status ON public.treatment_plans USING btree (status);

CREATE INDEX idx_treatment_plans_year ON public.treatment_plans USING btree (year);

CREATE INDEX idx_treatment_products_product ON public.treatment_products USING btree (product_id);

CREATE INDEX idx_treatment_products_treatment ON public.treatment_products USING btree (treatment_id);

CREATE INDEX idx_treatments_active ON public.treatments USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_treatments_code ON public.treatments USING btree (code);

CREATE INDEX idx_treatments_created_by ON public.treatments USING btree (created_by);

CREATE INDEX idx_treatments_season ON public.treatments USING btree (season);

CREATE INDEX idx_vehicles_active ON public.vehicles USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_vehicles_created_by ON public.vehicles USING btree (created_by);

CREATE INDEX idx_vehicles_depot ON public.vehicles USING btree (depot_id);

CREATE INDEX idx_vehicles_registration ON public.vehicles USING btree (registration);

CREATE INDEX idx_warehouses_depot ON public.warehouses USING btree (is_depot) WHERE (is_depot = true);

CREATE INDEX idx_warehouses_location ON public.warehouses USING btree (latitude, longitude);

CREATE UNIQUE INDEX invoice_items_pkey ON public.invoice_items USING btree (id);

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

CREATE UNIQUE INDEX job_consumptions_pkey ON public.job_consumptions USING btree (id);

CREATE UNIQUE INDEX job_treatments_pkey ON public.job_treatments USING btree (id);

CREATE UNIQUE INDEX jobs_job_number_key ON public.jobs USING btree (job_number);

CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);

CREATE UNIQUE INDEX lawns_pkey ON public.lawns USING btree (id);

CREATE UNIQUE INDEX operators_employee_number_key ON public.operators USING btree (employee_number);

CREATE UNIQUE INDEX operators_pkey ON public.operators USING btree (id);

CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id);

CREATE UNIQUE INDEX route_stops_pkey ON public.route_stops USING btree (id);

CREATE UNIQUE INDEX route_stops_route_id_stop_order_key ON public.route_stops USING btree (route_id, stop_order);

CREATE UNIQUE INDEX routes_pkey ON public.routes USING btree (id);

CREATE UNIQUE INDEX treatment_plan_items_pkey ON public.treatment_plan_items USING btree (id);

CREATE UNIQUE INDEX treatment_plans_lawn_id_year_key ON public.treatment_plans USING btree (lawn_id, year);

CREATE UNIQUE INDEX treatment_plans_pkey ON public.treatment_plans USING btree (id);

CREATE UNIQUE INDEX treatment_products_pkey ON public.treatment_products USING btree (id);

CREATE UNIQUE INDEX treatment_products_treatment_id_product_id_key ON public.treatment_products USING btree (treatment_id, product_id);

CREATE UNIQUE INDEX treatments_code_key ON public.treatments USING btree (code);

CREATE UNIQUE INDEX treatments_pkey ON public.treatments USING btree (id);

CREATE UNIQUE INDEX vehicles_pkey ON public.vehicles USING btree (id);

CREATE UNIQUE INDEX vehicles_registration_key ON public.vehicles USING btree (registration);

alter table "public"."customers" add constraint "customers_pkey" PRIMARY KEY using index "customers_pkey";

alter table "public"."invoice_items" add constraint "invoice_items_pkey" PRIMARY KEY using index "invoice_items_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."job_consumptions" add constraint "job_consumptions_pkey" PRIMARY KEY using index "job_consumptions_pkey";

alter table "public"."job_treatments" add constraint "job_treatments_pkey" PRIMARY KEY using index "job_treatments_pkey";

alter table "public"."jobs" add constraint "jobs_pkey" PRIMARY KEY using index "jobs_pkey";

alter table "public"."lawns" add constraint "lawns_pkey" PRIMARY KEY using index "lawns_pkey";

alter table "public"."operators" add constraint "operators_pkey" PRIMARY KEY using index "operators_pkey";

alter table "public"."payments" add constraint "payments_pkey" PRIMARY KEY using index "payments_pkey";

alter table "public"."route_stops" add constraint "route_stops_pkey" PRIMARY KEY using index "route_stops_pkey";

alter table "public"."routes" add constraint "routes_pkey" PRIMARY KEY using index "routes_pkey";

alter table "public"."treatment_plan_items" add constraint "treatment_plan_items_pkey" PRIMARY KEY using index "treatment_plan_items_pkey";

alter table "public"."treatment_plans" add constraint "treatment_plans_pkey" PRIMARY KEY using index "treatment_plans_pkey";

alter table "public"."treatment_products" add constraint "treatment_products_pkey" PRIMARY KEY using index "treatment_products_pkey";

alter table "public"."treatments" add constraint "treatments_pkey" PRIMARY KEY using index "treatments_pkey";

alter table "public"."vehicles" add constraint "vehicles_pkey" PRIMARY KEY using index "vehicles_pkey";

alter table "public"."customers" add constraint "customers_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."customers" validate constraint "customers_created_by_fkey";

alter table "public"."customers" add constraint "customers_customer_number_key" UNIQUE using index "customers_customer_number_key";

alter table "public"."invoice_items" add constraint "invoice_items_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_invoice_id_fkey";

alter table "public"."invoice_items" add constraint "invoice_items_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_job_id_fkey";

alter table "public"."invoices" add constraint "invoices_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."invoices" validate constraint "invoices_created_by_fkey";

alter table "public"."invoices" add constraint "invoices_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."invoices" validate constraint "invoices_customer_id_fkey";

alter table "public"."invoices" add constraint "invoices_invoice_number_key" UNIQUE using index "invoices_invoice_number_key";

alter table "public"."job_consumptions" add constraint "job_consumptions_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."job_consumptions" validate constraint "job_consumptions_job_id_fkey";

alter table "public"."job_consumptions" add constraint "job_consumptions_job_treatment_id_fkey" FOREIGN KEY (job_treatment_id) REFERENCES public.job_treatments(id) ON DELETE CASCADE not valid;

alter table "public"."job_consumptions" validate constraint "job_consumptions_job_treatment_id_fkey";

alter table "public"."job_consumptions" add constraint "job_consumptions_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."job_consumptions" validate constraint "job_consumptions_product_id_fkey";

alter table "public"."job_consumptions" add constraint "job_consumptions_stock_movement_id_fkey" FOREIGN KEY (stock_movement_id) REFERENCES public.stock_movements(id) not valid;

alter table "public"."job_consumptions" validate constraint "job_consumptions_stock_movement_id_fkey";

alter table "public"."job_consumptions" add constraint "job_consumptions_warehouse_id_fkey" FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id) not valid;

alter table "public"."job_consumptions" validate constraint "job_consumptions_warehouse_id_fkey";

alter table "public"."job_treatments" add constraint "job_treatments_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE not valid;

alter table "public"."job_treatments" validate constraint "job_treatments_job_id_fkey";

alter table "public"."job_treatments" add constraint "job_treatments_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) not valid;

alter table "public"."job_treatments" validate constraint "job_treatments_treatment_id_fkey";

alter table "public"."jobs" add constraint "jobs_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."jobs" validate constraint "jobs_created_by_fkey";

alter table "public"."jobs" add constraint "jobs_job_number_key" UNIQUE using index "jobs_job_number_key";

alter table "public"."jobs" add constraint "jobs_lawn_id_fkey" FOREIGN KEY (lawn_id) REFERENCES public.lawns(id) not valid;

alter table "public"."jobs" validate constraint "jobs_lawn_id_fkey";

alter table "public"."jobs" add constraint "jobs_performed_by_fkey" FOREIGN KEY (performed_by) REFERENCES public.operators(id) not valid;

alter table "public"."jobs" validate constraint "jobs_performed_by_fkey";

alter table "public"."jobs" add constraint "jobs_route_stop_id_fkey" FOREIGN KEY (route_stop_id) REFERENCES public.route_stops(id) not valid;

alter table "public"."jobs" validate constraint "jobs_route_stop_id_fkey";

alter table "public"."jobs" add constraint "jobs_treatment_plan_item_id_fkey" FOREIGN KEY (treatment_plan_item_id) REFERENCES public.treatment_plan_items(id) not valid;

alter table "public"."jobs" validate constraint "jobs_treatment_plan_item_id_fkey";

alter table "public"."lawns" add constraint "lawns_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."lawns" validate constraint "lawns_created_by_fkey";

alter table "public"."lawns" add constraint "lawns_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."lawns" validate constraint "lawns_customer_id_fkey";

alter table "public"."operators" add constraint "operators_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."operators" validate constraint "operators_created_by_fkey";

alter table "public"."operators" add constraint "operators_depot_id_fkey" FOREIGN KEY (depot_id) REFERENCES public.warehouses(id) not valid;

alter table "public"."operators" validate constraint "operators_depot_id_fkey";

alter table "public"."operators" add constraint "operators_employee_number_key" UNIQUE using index "operators_employee_number_key";

alter table "public"."operators" add constraint "operators_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."operators" validate constraint "operators_user_id_fkey";

alter table "public"."payments" add constraint "payments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."payments" validate constraint "payments_created_by_fkey";

alter table "public"."payments" add constraint "payments_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."payments" validate constraint "payments_customer_id_fkey";

alter table "public"."payments" add constraint "payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) not valid;

alter table "public"."payments" validate constraint "payments_invoice_id_fkey";

alter table "public"."route_stops" add constraint "fk_route_stops_job" FOREIGN KEY (job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."route_stops" validate constraint "fk_route_stops_job";

alter table "public"."route_stops" add constraint "route_stops_lawn_id_fkey" FOREIGN KEY (lawn_id) REFERENCES public.lawns(id) not valid;

alter table "public"."route_stops" validate constraint "route_stops_lawn_id_fkey";

alter table "public"."route_stops" add constraint "route_stops_route_id_fkey" FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE not valid;

alter table "public"."route_stops" validate constraint "route_stops_route_id_fkey";

alter table "public"."route_stops" add constraint "route_stops_route_id_stop_order_key" UNIQUE using index "route_stops_route_id_stop_order_key";

alter table "public"."routes" add constraint "routes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."routes" validate constraint "routes_created_by_fkey";

alter table "public"."routes" add constraint "routes_depot_id_fkey" FOREIGN KEY (depot_id) REFERENCES public.warehouses(id) not valid;

alter table "public"."routes" validate constraint "routes_depot_id_fkey";

alter table "public"."routes" add constraint "routes_operator_id_fkey" FOREIGN KEY (operator_id) REFERENCES public.operators(id) not valid;

alter table "public"."routes" validate constraint "routes_operator_id_fkey";

alter table "public"."routes" add constraint "routes_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) not valid;

alter table "public"."routes" validate constraint "routes_vehicle_id_fkey";

alter table "public"."treatment_plan_items" add constraint "fk_treatment_plan_items_job" FOREIGN KEY (completed_job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."treatment_plan_items" validate constraint "fk_treatment_plan_items_job";

alter table "public"."treatment_plan_items" add constraint "treatment_plan_items_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) not valid;

alter table "public"."treatment_plan_items" validate constraint "treatment_plan_items_treatment_id_fkey";

alter table "public"."treatment_plan_items" add constraint "treatment_plan_items_treatment_plan_id_fkey" FOREIGN KEY (treatment_plan_id) REFERENCES public.treatment_plans(id) ON DELETE CASCADE not valid;

alter table "public"."treatment_plan_items" validate constraint "treatment_plan_items_treatment_plan_id_fkey";

alter table "public"."treatment_plans" add constraint "treatment_plans_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."treatment_plans" validate constraint "treatment_plans_created_by_fkey";

alter table "public"."treatment_plans" add constraint "treatment_plans_lawn_id_fkey" FOREIGN KEY (lawn_id) REFERENCES public.lawns(id) ON DELETE CASCADE not valid;

alter table "public"."treatment_plans" validate constraint "treatment_plans_lawn_id_fkey";

alter table "public"."treatment_plans" add constraint "treatment_plans_lawn_id_year_key" UNIQUE using index "treatment_plans_lawn_id_year_key";

alter table "public"."treatment_products" add constraint "treatment_products_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."treatment_products" validate constraint "treatment_products_product_id_fkey";

alter table "public"."treatment_products" add constraint "treatment_products_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES public.treatments(id) ON DELETE CASCADE not valid;

alter table "public"."treatment_products" validate constraint "treatment_products_treatment_id_fkey";

alter table "public"."treatment_products" add constraint "treatment_products_treatment_id_product_id_key" UNIQUE using index "treatment_products_treatment_id_product_id_key";

alter table "public"."treatments" add constraint "treatments_code_key" UNIQUE using index "treatments_code_key";

alter table "public"."treatments" add constraint "treatments_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."treatments" validate constraint "treatments_created_by_fkey";

alter table "public"."vehicles" add constraint "vehicles_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."vehicles" validate constraint "vehicles_created_by_fkey";

alter table "public"."vehicles" add constraint "vehicles_depot_id_fkey" FOREIGN KEY (depot_id) REFERENCES public.warehouses(id) not valid;

alter table "public"."vehicles" validate constraint "vehicles_depot_id_fkey";

alter table "public"."vehicles" add constraint "vehicles_registration_key" UNIQUE using index "vehicles_registration_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_customer_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM 4) AS INTEGER)), 10000) + 1
  INTO next_num
  FROM customers
  WHERE customer_number LIKE 'GM-%';

  NEW.customer_number := 'GM-' || next_num::TEXT;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_employee_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM operators
  WHERE employee_number LIKE 'OP-%';

  NEW.employee_number := 'OP-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  seq_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num
  FROM invoices
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_job_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  seq_num INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO seq_num
  FROM jobs
  WHERE DATE(created_at) = DATE(NOW());

  NEW.job_number := 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_invoice_totals()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE invoices
  SET
    subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    vat_amount = (SELECT COALESCE(SUM(line_total), 0) FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) * (vat_rate / 100),
    total_amount = (SELECT COALESCE(SUM(line_total), 0) FROM invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)) * (1 + vat_rate / 100),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_invoice_payment_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  total_paid DECIMAL(12, 2);
  invoice_total DECIMAL(12, 2);
BEGIN
  -- Calculate total confirmed payments for invoice
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    AND is_confirmed = true;

  -- Get invoice total
  SELECT total_amount INTO invoice_total
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  -- Update invoice
  UPDATE invoices
  SET
    amount_paid = total_paid,
    status = CASE
      WHEN total_paid >= invoice_total THEN 'paid'::invoice_status
      WHEN total_paid > 0 THEN 'partial'::invoice_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

grant delete on table "public"."customers" to "anon";

grant insert on table "public"."customers" to "anon";

grant references on table "public"."customers" to "anon";

grant select on table "public"."customers" to "anon";

grant trigger on table "public"."customers" to "anon";

grant truncate on table "public"."customers" to "anon";

grant update on table "public"."customers" to "anon";

grant delete on table "public"."customers" to "authenticated";

grant insert on table "public"."customers" to "authenticated";

grant references on table "public"."customers" to "authenticated";

grant select on table "public"."customers" to "authenticated";

grant trigger on table "public"."customers" to "authenticated";

grant truncate on table "public"."customers" to "authenticated";

grant update on table "public"."customers" to "authenticated";

grant delete on table "public"."customers" to "service_role";

grant insert on table "public"."customers" to "service_role";

grant references on table "public"."customers" to "service_role";

grant select on table "public"."customers" to "service_role";

grant trigger on table "public"."customers" to "service_role";

grant truncate on table "public"."customers" to "service_role";

grant update on table "public"."customers" to "service_role";

grant delete on table "public"."invoice_items" to "anon";

grant insert on table "public"."invoice_items" to "anon";

grant references on table "public"."invoice_items" to "anon";

grant select on table "public"."invoice_items" to "anon";

grant trigger on table "public"."invoice_items" to "anon";

grant truncate on table "public"."invoice_items" to "anon";

grant update on table "public"."invoice_items" to "anon";

grant delete on table "public"."invoice_items" to "authenticated";

grant insert on table "public"."invoice_items" to "authenticated";

grant references on table "public"."invoice_items" to "authenticated";

grant select on table "public"."invoice_items" to "authenticated";

grant trigger on table "public"."invoice_items" to "authenticated";

grant truncate on table "public"."invoice_items" to "authenticated";

grant update on table "public"."invoice_items" to "authenticated";

grant delete on table "public"."invoice_items" to "service_role";

grant insert on table "public"."invoice_items" to "service_role";

grant references on table "public"."invoice_items" to "service_role";

grant select on table "public"."invoice_items" to "service_role";

grant trigger on table "public"."invoice_items" to "service_role";

grant truncate on table "public"."invoice_items" to "service_role";

grant update on table "public"."invoice_items" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

grant delete on table "public"."job_consumptions" to "anon";

grant insert on table "public"."job_consumptions" to "anon";

grant references on table "public"."job_consumptions" to "anon";

grant select on table "public"."job_consumptions" to "anon";

grant trigger on table "public"."job_consumptions" to "anon";

grant truncate on table "public"."job_consumptions" to "anon";

grant update on table "public"."job_consumptions" to "anon";

grant delete on table "public"."job_consumptions" to "authenticated";

grant insert on table "public"."job_consumptions" to "authenticated";

grant references on table "public"."job_consumptions" to "authenticated";

grant select on table "public"."job_consumptions" to "authenticated";

grant trigger on table "public"."job_consumptions" to "authenticated";

grant truncate on table "public"."job_consumptions" to "authenticated";

grant update on table "public"."job_consumptions" to "authenticated";

grant delete on table "public"."job_consumptions" to "service_role";

grant insert on table "public"."job_consumptions" to "service_role";

grant references on table "public"."job_consumptions" to "service_role";

grant select on table "public"."job_consumptions" to "service_role";

grant trigger on table "public"."job_consumptions" to "service_role";

grant truncate on table "public"."job_consumptions" to "service_role";

grant update on table "public"."job_consumptions" to "service_role";

grant delete on table "public"."job_treatments" to "anon";

grant insert on table "public"."job_treatments" to "anon";

grant references on table "public"."job_treatments" to "anon";

grant select on table "public"."job_treatments" to "anon";

grant trigger on table "public"."job_treatments" to "anon";

grant truncate on table "public"."job_treatments" to "anon";

grant update on table "public"."job_treatments" to "anon";

grant delete on table "public"."job_treatments" to "authenticated";

grant insert on table "public"."job_treatments" to "authenticated";

grant references on table "public"."job_treatments" to "authenticated";

grant select on table "public"."job_treatments" to "authenticated";

grant trigger on table "public"."job_treatments" to "authenticated";

grant truncate on table "public"."job_treatments" to "authenticated";

grant update on table "public"."job_treatments" to "authenticated";

grant delete on table "public"."job_treatments" to "service_role";

grant insert on table "public"."job_treatments" to "service_role";

grant references on table "public"."job_treatments" to "service_role";

grant select on table "public"."job_treatments" to "service_role";

grant trigger on table "public"."job_treatments" to "service_role";

grant truncate on table "public"."job_treatments" to "service_role";

grant update on table "public"."job_treatments" to "service_role";

grant delete on table "public"."jobs" to "anon";

grant insert on table "public"."jobs" to "anon";

grant references on table "public"."jobs" to "anon";

grant select on table "public"."jobs" to "anon";

grant trigger on table "public"."jobs" to "anon";

grant truncate on table "public"."jobs" to "anon";

grant update on table "public"."jobs" to "anon";

grant delete on table "public"."jobs" to "authenticated";

grant insert on table "public"."jobs" to "authenticated";

grant references on table "public"."jobs" to "authenticated";

grant select on table "public"."jobs" to "authenticated";

grant trigger on table "public"."jobs" to "authenticated";

grant truncate on table "public"."jobs" to "authenticated";

grant update on table "public"."jobs" to "authenticated";

grant delete on table "public"."jobs" to "service_role";

grant insert on table "public"."jobs" to "service_role";

grant references on table "public"."jobs" to "service_role";

grant select on table "public"."jobs" to "service_role";

grant trigger on table "public"."jobs" to "service_role";

grant truncate on table "public"."jobs" to "service_role";

grant update on table "public"."jobs" to "service_role";

grant delete on table "public"."lawns" to "anon";

grant insert on table "public"."lawns" to "anon";

grant references on table "public"."lawns" to "anon";

grant select on table "public"."lawns" to "anon";

grant trigger on table "public"."lawns" to "anon";

grant truncate on table "public"."lawns" to "anon";

grant update on table "public"."lawns" to "anon";

grant delete on table "public"."lawns" to "authenticated";

grant insert on table "public"."lawns" to "authenticated";

grant references on table "public"."lawns" to "authenticated";

grant select on table "public"."lawns" to "authenticated";

grant trigger on table "public"."lawns" to "authenticated";

grant truncate on table "public"."lawns" to "authenticated";

grant update on table "public"."lawns" to "authenticated";

grant delete on table "public"."lawns" to "service_role";

grant insert on table "public"."lawns" to "service_role";

grant references on table "public"."lawns" to "service_role";

grant select on table "public"."lawns" to "service_role";

grant trigger on table "public"."lawns" to "service_role";

grant truncate on table "public"."lawns" to "service_role";

grant update on table "public"."lawns" to "service_role";

grant delete on table "public"."operators" to "anon";

grant insert on table "public"."operators" to "anon";

grant references on table "public"."operators" to "anon";

grant select on table "public"."operators" to "anon";

grant trigger on table "public"."operators" to "anon";

grant truncate on table "public"."operators" to "anon";

grant update on table "public"."operators" to "anon";

grant delete on table "public"."operators" to "authenticated";

grant insert on table "public"."operators" to "authenticated";

grant references on table "public"."operators" to "authenticated";

grant select on table "public"."operators" to "authenticated";

grant trigger on table "public"."operators" to "authenticated";

grant truncate on table "public"."operators" to "authenticated";

grant update on table "public"."operators" to "authenticated";

grant delete on table "public"."operators" to "service_role";

grant insert on table "public"."operators" to "service_role";

grant references on table "public"."operators" to "service_role";

grant select on table "public"."operators" to "service_role";

grant trigger on table "public"."operators" to "service_role";

grant truncate on table "public"."operators" to "service_role";

grant update on table "public"."operators" to "service_role";

grant delete on table "public"."payments" to "anon";

grant insert on table "public"."payments" to "anon";

grant references on table "public"."payments" to "anon";

grant select on table "public"."payments" to "anon";

grant trigger on table "public"."payments" to "anon";

grant truncate on table "public"."payments" to "anon";

grant update on table "public"."payments" to "anon";

grant delete on table "public"."payments" to "authenticated";

grant insert on table "public"."payments" to "authenticated";

grant references on table "public"."payments" to "authenticated";

grant select on table "public"."payments" to "authenticated";

grant trigger on table "public"."payments" to "authenticated";

grant truncate on table "public"."payments" to "authenticated";

grant update on table "public"."payments" to "authenticated";

grant delete on table "public"."payments" to "service_role";

grant insert on table "public"."payments" to "service_role";

grant references on table "public"."payments" to "service_role";

grant select on table "public"."payments" to "service_role";

grant trigger on table "public"."payments" to "service_role";

grant truncate on table "public"."payments" to "service_role";

grant update on table "public"."payments" to "service_role";

grant delete on table "public"."route_stops" to "anon";

grant insert on table "public"."route_stops" to "anon";

grant references on table "public"."route_stops" to "anon";

grant select on table "public"."route_stops" to "anon";

grant trigger on table "public"."route_stops" to "anon";

grant truncate on table "public"."route_stops" to "anon";

grant update on table "public"."route_stops" to "anon";

grant delete on table "public"."route_stops" to "authenticated";

grant insert on table "public"."route_stops" to "authenticated";

grant references on table "public"."route_stops" to "authenticated";

grant select on table "public"."route_stops" to "authenticated";

grant trigger on table "public"."route_stops" to "authenticated";

grant truncate on table "public"."route_stops" to "authenticated";

grant update on table "public"."route_stops" to "authenticated";

grant delete on table "public"."route_stops" to "service_role";

grant insert on table "public"."route_stops" to "service_role";

grant references on table "public"."route_stops" to "service_role";

grant select on table "public"."route_stops" to "service_role";

grant trigger on table "public"."route_stops" to "service_role";

grant truncate on table "public"."route_stops" to "service_role";

grant update on table "public"."route_stops" to "service_role";

grant delete on table "public"."routes" to "anon";

grant insert on table "public"."routes" to "anon";

grant references on table "public"."routes" to "anon";

grant select on table "public"."routes" to "anon";

grant trigger on table "public"."routes" to "anon";

grant truncate on table "public"."routes" to "anon";

grant update on table "public"."routes" to "anon";

grant delete on table "public"."routes" to "authenticated";

grant insert on table "public"."routes" to "authenticated";

grant references on table "public"."routes" to "authenticated";

grant select on table "public"."routes" to "authenticated";

grant trigger on table "public"."routes" to "authenticated";

grant truncate on table "public"."routes" to "authenticated";

grant update on table "public"."routes" to "authenticated";

grant delete on table "public"."routes" to "service_role";

grant insert on table "public"."routes" to "service_role";

grant references on table "public"."routes" to "service_role";

grant select on table "public"."routes" to "service_role";

grant trigger on table "public"."routes" to "service_role";

grant truncate on table "public"."routes" to "service_role";

grant update on table "public"."routes" to "service_role";

grant delete on table "public"."treatment_plan_items" to "anon";

grant insert on table "public"."treatment_plan_items" to "anon";

grant references on table "public"."treatment_plan_items" to "anon";

grant select on table "public"."treatment_plan_items" to "anon";

grant trigger on table "public"."treatment_plan_items" to "anon";

grant truncate on table "public"."treatment_plan_items" to "anon";

grant update on table "public"."treatment_plan_items" to "anon";

grant delete on table "public"."treatment_plan_items" to "authenticated";

grant insert on table "public"."treatment_plan_items" to "authenticated";

grant references on table "public"."treatment_plan_items" to "authenticated";

grant select on table "public"."treatment_plan_items" to "authenticated";

grant trigger on table "public"."treatment_plan_items" to "authenticated";

grant truncate on table "public"."treatment_plan_items" to "authenticated";

grant update on table "public"."treatment_plan_items" to "authenticated";

grant delete on table "public"."treatment_plan_items" to "service_role";

grant insert on table "public"."treatment_plan_items" to "service_role";

grant references on table "public"."treatment_plan_items" to "service_role";

grant select on table "public"."treatment_plan_items" to "service_role";

grant trigger on table "public"."treatment_plan_items" to "service_role";

grant truncate on table "public"."treatment_plan_items" to "service_role";

grant update on table "public"."treatment_plan_items" to "service_role";

grant delete on table "public"."treatment_plans" to "anon";

grant insert on table "public"."treatment_plans" to "anon";

grant references on table "public"."treatment_plans" to "anon";

grant select on table "public"."treatment_plans" to "anon";

grant trigger on table "public"."treatment_plans" to "anon";

grant truncate on table "public"."treatment_plans" to "anon";

grant update on table "public"."treatment_plans" to "anon";

grant delete on table "public"."treatment_plans" to "authenticated";

grant insert on table "public"."treatment_plans" to "authenticated";

grant references on table "public"."treatment_plans" to "authenticated";

grant select on table "public"."treatment_plans" to "authenticated";

grant trigger on table "public"."treatment_plans" to "authenticated";

grant truncate on table "public"."treatment_plans" to "authenticated";

grant update on table "public"."treatment_plans" to "authenticated";

grant delete on table "public"."treatment_plans" to "service_role";

grant insert on table "public"."treatment_plans" to "service_role";

grant references on table "public"."treatment_plans" to "service_role";

grant select on table "public"."treatment_plans" to "service_role";

grant trigger on table "public"."treatment_plans" to "service_role";

grant truncate on table "public"."treatment_plans" to "service_role";

grant update on table "public"."treatment_plans" to "service_role";

grant delete on table "public"."treatment_products" to "anon";

grant insert on table "public"."treatment_products" to "anon";

grant references on table "public"."treatment_products" to "anon";

grant select on table "public"."treatment_products" to "anon";

grant trigger on table "public"."treatment_products" to "anon";

grant truncate on table "public"."treatment_products" to "anon";

grant update on table "public"."treatment_products" to "anon";

grant delete on table "public"."treatment_products" to "authenticated";

grant insert on table "public"."treatment_products" to "authenticated";

grant references on table "public"."treatment_products" to "authenticated";

grant select on table "public"."treatment_products" to "authenticated";

grant trigger on table "public"."treatment_products" to "authenticated";

grant truncate on table "public"."treatment_products" to "authenticated";

grant update on table "public"."treatment_products" to "authenticated";

grant delete on table "public"."treatment_products" to "service_role";

grant insert on table "public"."treatment_products" to "service_role";

grant references on table "public"."treatment_products" to "service_role";

grant select on table "public"."treatment_products" to "service_role";

grant trigger on table "public"."treatment_products" to "service_role";

grant truncate on table "public"."treatment_products" to "service_role";

grant update on table "public"."treatment_products" to "service_role";

grant delete on table "public"."treatments" to "anon";

grant insert on table "public"."treatments" to "anon";

grant references on table "public"."treatments" to "anon";

grant select on table "public"."treatments" to "anon";

grant trigger on table "public"."treatments" to "anon";

grant truncate on table "public"."treatments" to "anon";

grant update on table "public"."treatments" to "anon";

grant delete on table "public"."treatments" to "authenticated";

grant insert on table "public"."treatments" to "authenticated";

grant references on table "public"."treatments" to "authenticated";

grant select on table "public"."treatments" to "authenticated";

grant trigger on table "public"."treatments" to "authenticated";

grant truncate on table "public"."treatments" to "authenticated";

grant update on table "public"."treatments" to "authenticated";

grant delete on table "public"."treatments" to "service_role";

grant insert on table "public"."treatments" to "service_role";

grant references on table "public"."treatments" to "service_role";

grant select on table "public"."treatments" to "service_role";

grant trigger on table "public"."treatments" to "service_role";

grant truncate on table "public"."treatments" to "service_role";

grant update on table "public"."treatments" to "service_role";

grant delete on table "public"."vehicles" to "anon";

grant insert on table "public"."vehicles" to "anon";

grant references on table "public"."vehicles" to "anon";

grant select on table "public"."vehicles" to "anon";

grant trigger on table "public"."vehicles" to "anon";

grant truncate on table "public"."vehicles" to "anon";

grant update on table "public"."vehicles" to "anon";

grant delete on table "public"."vehicles" to "authenticated";

grant insert on table "public"."vehicles" to "authenticated";

grant references on table "public"."vehicles" to "authenticated";

grant select on table "public"."vehicles" to "authenticated";

grant trigger on table "public"."vehicles" to "authenticated";

grant truncate on table "public"."vehicles" to "authenticated";

grant update on table "public"."vehicles" to "authenticated";

grant delete on table "public"."vehicles" to "service_role";

grant insert on table "public"."vehicles" to "service_role";

grant references on table "public"."vehicles" to "service_role";

grant select on table "public"."vehicles" to "service_role";

grant trigger on table "public"."vehicles" to "service_role";

grant truncate on table "public"."vehicles" to "service_role";

grant update on table "public"."vehicles" to "service_role";


  create policy "customers_delete"
  on "public"."customers"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "customers_insert"
  on "public"."customers"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "customers_select"
  on "public"."customers"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "customers_update"
  on "public"."customers"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "invoice_items_delete"
  on "public"."invoice_items"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "invoice_items_insert"
  on "public"."invoice_items"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "invoice_items_select"
  on "public"."invoice_items"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.invoices
  WHERE ((invoices.id = invoice_items.invoice_id) AND ((invoices.created_by = auth.uid()) OR public.is_admin())))));



  create policy "invoice_items_update"
  on "public"."invoice_items"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "invoices_delete"
  on "public"."invoices"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "invoices_insert"
  on "public"."invoices"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "invoices_select"
  on "public"."invoices"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "invoices_update"
  on "public"."invoices"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "job_consumptions_delete"
  on "public"."job_consumptions"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "job_consumptions_insert"
  on "public"."job_consumptions"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "job_consumptions_select"
  on "public"."job_consumptions"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_consumptions.job_id) AND ((jobs.created_by = auth.uid()) OR public.is_admin())))));



  create policy "job_treatments_delete"
  on "public"."job_treatments"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "job_treatments_insert"
  on "public"."job_treatments"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "job_treatments_select"
  on "public"."job_treatments"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.jobs
  WHERE ((jobs.id = job_treatments.job_id) AND ((jobs.created_by = auth.uid()) OR public.is_admin())))));



  create policy "jobs_delete"
  on "public"."jobs"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "jobs_insert"
  on "public"."jobs"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "jobs_select"
  on "public"."jobs"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL) OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = jobs.performed_by) AND (operators.user_id = auth.uid()))))));



  create policy "jobs_update"
  on "public"."jobs"
  as permissive
  for update
  to authenticated
using ((public.is_admin_or_manager() OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = jobs.performed_by) AND (operators.user_id = auth.uid()))))))
with check ((public.is_admin_or_manager() OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = jobs.performed_by) AND (operators.user_id = auth.uid()))))));



  create policy "lawns_delete"
  on "public"."lawns"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "lawns_insert"
  on "public"."lawns"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "lawns_select"
  on "public"."lawns"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "lawns_update"
  on "public"."lawns"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "operators_delete"
  on "public"."operators"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "operators_insert"
  on "public"."operators"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "operators_select"
  on "public"."operators"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL) OR (user_id = auth.uid())));



  create policy "operators_update"
  on "public"."operators"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "payments_delete"
  on "public"."payments"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "payments_insert"
  on "public"."payments"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "payments_select"
  on "public"."payments"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "payments_update"
  on "public"."payments"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "route_stops_delete"
  on "public"."route_stops"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "route_stops_insert"
  on "public"."route_stops"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "route_stops_select"
  on "public"."route_stops"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.routes
  WHERE ((routes.id = route_stops.route_id) AND ((routes.created_by = auth.uid()) OR public.is_admin() OR (EXISTS ( SELECT 1
           FROM public.operators
          WHERE ((operators.id = routes.operator_id) AND (operators.user_id = auth.uid())))))))));



  create policy "route_stops_update"
  on "public"."route_stops"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "routes_delete"
  on "public"."routes"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "routes_insert"
  on "public"."routes"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "routes_select"
  on "public"."routes"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL) OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = routes.operator_id) AND (operators.user_id = auth.uid()))))));



  create policy "routes_update"
  on "public"."routes"
  as permissive
  for update
  to authenticated
using ((public.is_admin_or_manager() OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = routes.operator_id) AND (operators.user_id = auth.uid()))))))
with check ((public.is_admin_or_manager() OR (EXISTS ( SELECT 1
   FROM public.operators
  WHERE ((operators.id = routes.operator_id) AND (operators.user_id = auth.uid()))))));



  create policy "treatment_plan_items_delete"
  on "public"."treatment_plan_items"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "treatment_plan_items_insert"
  on "public"."treatment_plan_items"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "treatment_plan_items_select"
  on "public"."treatment_plan_items"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.treatment_plans
  WHERE ((treatment_plans.id = treatment_plan_items.treatment_plan_id) AND ((treatment_plans.created_by = auth.uid()) OR public.is_admin())))));



  create policy "treatment_plan_items_update"
  on "public"."treatment_plan_items"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "treatment_plans_delete"
  on "public"."treatment_plans"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "treatment_plans_insert"
  on "public"."treatment_plans"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "treatment_plans_select"
  on "public"."treatment_plans"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "treatment_plans_update"
  on "public"."treatment_plans"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));



  create policy "treatment_products_delete"
  on "public"."treatment_products"
  as permissive
  for delete
  to authenticated
using (public.is_admin_or_manager());



  create policy "treatment_products_insert"
  on "public"."treatment_products"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "treatment_products_select"
  on "public"."treatment_products"
  as permissive
  for select
  to authenticated
using (true);



  create policy "treatments_delete"
  on "public"."treatments"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "treatments_insert"
  on "public"."treatments"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "treatments_select"
  on "public"."treatments"
  as permissive
  for select
  to authenticated
using (true);



  create policy "treatments_update"
  on "public"."treatments"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());



  create policy "vehicles_delete"
  on "public"."vehicles"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "vehicles_insert"
  on "public"."vehicles"
  as permissive
  for insert
  to authenticated
with check (public.is_admin_or_manager());



  create policy "vehicles_select"
  on "public"."vehicles"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "vehicles_update"
  on "public"."vehicles"
  as permissive
  for update
  to authenticated
using (public.is_admin_or_manager())
with check (public.is_admin_or_manager());


CREATE TRIGGER customers_generate_number BEFORE INSERT ON public.customers FOR EACH ROW WHEN ((new.customer_number IS NULL)) EXECUTE FUNCTION public.generate_customer_number();

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER invoice_items_recalculate AFTER INSERT OR DELETE OR UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION public.recalculate_invoice_totals();

CREATE TRIGGER invoices_generate_number BEFORE INSERT ON public.invoices FOR EACH ROW WHEN ((new.invoice_number IS NULL)) EXECUTE FUNCTION public.generate_invoice_number();

CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER jobs_generate_number BEFORE INSERT ON public.jobs FOR EACH ROW WHEN ((new.job_number IS NULL)) EXECUTE FUNCTION public.generate_job_number();

CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER lawns_updated_at BEFORE UPDATE ON public.lawns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER operators_generate_number BEFORE INSERT ON public.operators FOR EACH ROW WHEN ((new.employee_number IS NULL)) EXECUTE FUNCTION public.generate_employee_number();

CREATE TRIGGER operators_updated_at BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER payments_update_invoice AFTER INSERT OR DELETE OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_invoice_payment_status();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER route_stops_updated_at BEFORE UPDATE ON public.route_stops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER treatment_plan_items_updated_at BEFORE UPDATE ON public.treatment_plan_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER treatment_plans_updated_at BEFORE UPDATE ON public.treatment_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


