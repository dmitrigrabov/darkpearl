drop policy "Inventory is manageable by service role" on "public"."inventory";

drop policy "Inventory is viewable by authenticated users" on "public"."inventory";

drop policy "Order items are insertable by authenticated" on "public"."order_items";

drop policy "Order items are manageable by service role" on "public"."order_items";

drop policy "Order items follow order access" on "public"."order_items";

drop policy "Orders are manageable by service role" on "public"."orders";

drop policy "Users can create orders" on "public"."orders";

drop policy "Users can view their own orders" on "public"."orders";

drop policy "Products are manageable by service role" on "public"."products";

drop policy "Products are viewable by authenticated users" on "public"."products";

drop policy "Movements are manageable by service role" on "public"."stock_movements";

drop policy "Movements are viewable by authenticated users" on "public"."stock_movements";

drop policy "Warehouses are manageable by service role" on "public"."warehouses";

drop policy "Warehouses are viewable by authenticated users" on "public"."warehouses";


  create policy "Inventory is manageable by authenticated users"
  on "public"."inventory"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Inventory is viewable by anyone"
  on "public"."inventory"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Order items are manageable by authenticated users"
  on "public"."order_items"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Order items are viewable by anyone"
  on "public"."order_items"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Orders are manageable by authenticated users"
  on "public"."orders"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Orders are viewable by anyone"
  on "public"."orders"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Products are manageable by authenticated users"
  on "public"."products"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Products are viewable by anyone"
  on "public"."products"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Movements are manageable by authenticated users"
  on "public"."stock_movements"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Movements are viewable by anyone"
  on "public"."stock_movements"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Warehouses are manageable by authenticated users"
  on "public"."warehouses"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Warehouses are viewable by anyone"
  on "public"."warehouses"
  as permissive
  for select
  to anon, authenticated
using (true);



