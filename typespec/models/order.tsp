namespace DarkPearl.Models;

@doc("Order status")
enum OrderStatus {
  @doc("Order created, awaiting processing")
  pending,

  @doc("Stock reserved for the order")
  reserved,

  @doc("Payment is being processed")
  payment_processing,

  @doc("Payment failed")
  payment_failed,

  @doc("Payment successful")
  paid,

  @doc("Order is being fulfilled")
  fulfilling,

  @doc("Order fulfilled and complete")
  fulfilled,

  @doc("Order cancelled")
  cancelled,
}

@doc("Order line item")
model OrderItem {
  @doc("Unique item identifier")
  id: string;

  @doc("Order ID this item belongs to")
  order_id: string;

  @doc("Product ID")
  product_id: string;

  @doc("Quantity ordered")
  quantity: int32;

  @doc("Unit price at time of order")
  unit_price: float64;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Order with items")
model Order {
  @doc("Unique order identifier")
  id: string;

  @doc("Human-readable order number")
  order_number: string;

  @doc("Current order status")
  status: OrderStatus;

  @doc("Customer ID (from auth)")
  customer_id?: string;

  @doc("Warehouse ID for fulfillment")
  warehouse_id: string;

  @doc("Total order amount")
  total_amount: float64;

  @doc("Payment reference from payment processor")
  payment_reference?: string;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Order with full details including items and saga status")
model OrderWithDetails extends Order {
  @doc("Order line items")
  items: OrderItem[];

  @doc("Warehouse details")
  warehouse: {
    id: string;
    code: string;
    name: string;
  };

  @doc("Saga status if order is being processed")
  saga?: {
    id: string;
    status: string;
    current_step?: string;
    error_message?: string;
    created_at: utcDateTime;
    completed_at?: utcDateTime;
  };
}

@doc("Request to create order item")
model CreateOrderItemRequest {
  @doc("Product ID")
  product_id: string;

  @doc("Quantity to order")
  quantity: int32;

  @doc("Unit price (uses product price if not specified)")
  unit_price: float64;
}

@doc("Request to create a new order")
model CreateOrderRequest {
  @doc("Customer ID")
  customer_id?: string;

  @doc("Warehouse ID for fulfillment")
  warehouse_id: string;

  @doc("Additional notes")
  notes?: string;

  @doc("Order items")
  items: CreateOrderItemRequest[];
}

@doc("Response after creating an order")
model CreateOrderResponse extends Order {
  @doc("Order items")
  items: OrderItem[];

  @doc("Status message")
  message: string;
}

@doc("Paginated list of orders")
model OrderListResponse {
  @doc("List of orders")
  data: Order[];

  ...PaginationMeta;
}
