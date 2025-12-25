namespace DarkPearl.Models;

@doc("Inventory level for a product in a warehouse")
model InventoryLevel {
  @doc("Unique inventory record identifier")
  id: string;

  @doc("Product ID")
  product_id: string;

  @doc("Warehouse ID")
  warehouse_id: string;

  @doc("Quantity available in stock")
  quantity_available: int32;

  @doc("Quantity reserved for orders")
  quantity_reserved: int32;

  @doc("Stock level that triggers reorder")
  reorder_point: int32;

  @doc("Quantity to order when reorder point is reached")
  reorder_quantity: int32;

  ...Timestamps;
}

@doc("Inventory with related product and warehouse info")
model InventoryWithDetails extends InventoryLevel {
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

@doc("Request to create inventory record")
model CreateInventoryRequest {
  @doc("Product ID")
  product_id: string;

  @doc("Warehouse ID")
  warehouse_id: string;

  @doc("Initial quantity available (defaults to 0)")
  quantity_available?: int32;

  @doc("Reorder point (defaults to 10)")
  reorder_point?: int32;

  @doc("Reorder quantity (defaults to 50)")
  reorder_quantity?: int32;
}

@doc("Request to update inventory record")
model UpdateInventoryRequest {
  @doc("Quantity available")
  quantity_available?: int32;

  @doc("Quantity reserved")
  quantity_reserved?: int32;

  @doc("Reorder point")
  reorder_point?: int32;

  @doc("Reorder quantity")
  reorder_quantity?: int32;
}

@doc("Paginated list of inventory records")
model InventoryListResponse {
  @doc("List of inventory records with details")
  data: InventoryWithDetails[];

  ...PaginationMeta;
}
