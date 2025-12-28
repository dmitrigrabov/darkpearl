alter table "public"."lawns" drop constraint "lawns_customer_id_fkey";

drop index if exists "public"."idx_lawns_customer";

drop index if exists "public"."idx_lawns_location";

drop index if exists "public"."idx_lawns_postcode";


  create table "public"."properties" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "customer_id" uuid not null,
    "address_line1" character varying(255) not null,
    "address_line2" character varying(255),
    "city" character varying(100) not null,
    "postcode" character varying(10) not null,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "access_notes" text,
    "is_active" boolean not null default true,
    "created_by" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."properties" enable row level security;

alter table "public"."lawns" drop column "address_line1";

alter table "public"."lawns" drop column "address_line2";

alter table "public"."lawns" drop column "city";

alter table "public"."lawns" drop column "customer_id";

alter table "public"."lawns" drop column "latitude";

alter table "public"."lawns" drop column "longitude";

alter table "public"."lawns" drop column "postcode";

alter table "public"."lawns" add column "boundary" jsonb;

alter table "public"."lawns" add column "name" character varying(100) not null;

alter table "public"."lawns" add column "property_id" uuid not null;

CREATE INDEX idx_lawns_property ON public.lawns USING btree (property_id);

CREATE INDEX idx_properties_active ON public.properties USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_properties_created_by ON public.properties USING btree (created_by);

CREATE INDEX idx_properties_customer ON public.properties USING btree (customer_id);

CREATE INDEX idx_properties_location ON public.properties USING btree (latitude, longitude);

CREATE INDEX idx_properties_postcode ON public.properties USING btree (postcode);

CREATE UNIQUE INDEX properties_pkey ON public.properties USING btree (id);

alter table "public"."properties" add constraint "properties_pkey" PRIMARY KEY using index "properties_pkey";

alter table "public"."lawns" add constraint "lawns_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE not valid;

alter table "public"."lawns" validate constraint "lawns_property_id_fkey";

alter table "public"."properties" add constraint "properties_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."properties" validate constraint "properties_created_by_fkey";

alter table "public"."properties" add constraint "properties_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_customer_id_fkey";

grant delete on table "public"."properties" to "anon";

grant insert on table "public"."properties" to "anon";

grant references on table "public"."properties" to "anon";

grant select on table "public"."properties" to "anon";

grant trigger on table "public"."properties" to "anon";

grant truncate on table "public"."properties" to "anon";

grant update on table "public"."properties" to "anon";

grant delete on table "public"."properties" to "authenticated";

grant insert on table "public"."properties" to "authenticated";

grant references on table "public"."properties" to "authenticated";

grant select on table "public"."properties" to "authenticated";

grant trigger on table "public"."properties" to "authenticated";

grant truncate on table "public"."properties" to "authenticated";

grant update on table "public"."properties" to "authenticated";

grant delete on table "public"."properties" to "service_role";

grant insert on table "public"."properties" to "service_role";

grant references on table "public"."properties" to "service_role";

grant select on table "public"."properties" to "service_role";

grant trigger on table "public"."properties" to "service_role";

grant truncate on table "public"."properties" to "service_role";

grant update on table "public"."properties" to "service_role";


  create policy "properties_delete"
  on "public"."properties"
  as permissive
  for delete
  to authenticated
using (public.is_admin());



  create policy "properties_insert"
  on "public"."properties"
  as permissive
  for insert
  to authenticated
with check ((public.is_admin_or_manager() AND ((created_by IS NULL) OR (created_by = auth.uid()))));



  create policy "properties_select"
  on "public"."properties"
  as permissive
  for select
  to authenticated
using ((public.is_admin() OR (created_by = auth.uid()) OR (created_by IS NULL)));



  create policy "properties_update"
  on "public"."properties"
  as permissive
  for update
  to authenticated
using (public.owns_or_is_admin(created_by))
with check (public.owns_or_is_admin(created_by));


CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


