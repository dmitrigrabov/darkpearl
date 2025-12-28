import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

// Common models
import "./models/common.tsp";
import "./models/enums.tsp";

// Existing stock management models
import "./models/product.tsp";
import "./models/warehouse.tsp";
import "./models/inventory.tsp";
import "./models/stock-movement.tsp";
import "./models/order.tsp";
import "./models/saga.tsp";

// Lawn care domain models
import "./models/customer.tsp";
import "./models/property.tsp";
import "./models/lawn.tsp";
import "./models/treatment.tsp";
import "./models/treatment-plan.tsp";
import "./models/operator.tsp";
import "./models/vehicle.tsp";
import "./models/route.tsp";
import "./models/job.tsp";
import "./models/invoice.tsp";
import "./models/payment.tsp";

// Existing stock management operations
import "./operations/products.tsp";
import "./operations/warehouses.tsp";
import "./operations/inventory.tsp";
import "./operations/stock-movements.tsp";
import "./operations/orders.tsp";

// Lawn care domain operations
import "./operations/customers.tsp";
import "./operations/properties.tsp";
import "./operations/lawns.tsp";
import "./operations/treatments.tsp";
import "./operations/treatment-plans.tsp";
import "./operations/operators.tsp";
import "./operations/vehicles.tsp";
import "./operations/routes.tsp";
import "./operations/jobs.tsp";
import "./operations/invoices.tsp";
import "./operations/payments.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Green Man Lawn Care ERP API",
})
@server("https://your-project.supabase.co/functions/v1", "Supabase Edge Functions")
@doc("Lawn care ERP backend with stock management and Saga pattern for order fulfillment")
namespace DarkPearl;
