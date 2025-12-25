import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/product.tsp";
import "./models/warehouse.tsp";
import "./models/inventory.tsp";
import "./models/stock-movement.tsp";
import "./models/order.tsp";
import "./models/saga.tsp";

import "./operations/products.tsp";
import "./operations/warehouses.tsp";
import "./operations/inventory.tsp";
import "./operations/stock-movements.tsp";
import "./operations/orders.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "DarkPearl Stock Management API",
  version: "1.0.0",
})
@server("https://your-project.supabase.co/functions/v1", "Supabase Edge Functions")
@doc("Stock management backend with Saga pattern for order fulfillment")
namespace DarkPearl;
