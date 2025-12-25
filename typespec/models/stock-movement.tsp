namespace DarkPearl.Models;

@doc("Type of stock movement")
enum MovementType {
  @doc("Incoming stock from purchase or return")
  receive,

  @doc("Outgoing transfer to another warehouse")
  transfer_out,

  @doc("Incoming transfer from another warehouse")
  transfer_in,

  @doc("Manual adjustment for count correction")
  adjust,

  @doc("Reserve stock for an order")
  reserve,

  @doc("Release previously reserved stock")
  release,

  @doc("Fulfill order and reduce stock")
  fulfill,
}

@doc("Record of stock movement for audit trail")
model StockMovement {
  @doc("Unique movement identifier")
  id: string;

  @doc("Correlation ID for idempotency and saga tracking")
  correlation_id: string;

  @doc("Product ID")
  product_id: string;

  @doc("Warehouse ID")
  warehouse_id: string;

  @doc("Type of movement")
  movement_type: MovementType;

  @doc("Quantity moved (positive for increase, context-dependent)")
  quantity: int32;

  @doc("Reference ID (e.g., order ID, transfer ID)")
  reference_id?: string;

  @doc("Reference type (e.g., 'order', 'transfer', 'adjustment')")
  reference_type?: string;

  @doc("Additional notes")
  notes?: string;

  @doc("User who created this movement")
  created_by?: string;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Stock movement with related product and warehouse info")
model StockMovementWithDetails extends StockMovement {
  @doc("Product details")
  product: {
    id: string;
    sku: string;
    name: string;
  };

  @doc("Warehouse details")
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
}

@doc("Request to create a stock movement")
model CreateStockMovementRequest {
  @doc("Correlation ID for idempotency (auto-generated if not provided)")
  correlation_id?: string;

  @doc("Product ID")
  product_id: string;

  @doc("Warehouse ID")
  warehouse_id: string;

  @doc("Type of movement")
  movement_type: MovementType;

  @doc("Quantity to move")
  quantity: int32;

  @doc("Reference ID (e.g., order ID)")
  reference_id?: string;

  @doc("Reference type")
  reference_type?: string;

  @doc("Additional notes")
  notes?: string;
}

@doc("Paginated list of stock movements")
model StockMovementListResponse {
  @doc("List of stock movements with details")
  data: StockMovementWithDetails[];

  ...PaginationMeta;
}
