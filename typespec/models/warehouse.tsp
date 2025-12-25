namespace DarkPearl.Models;

@doc("Warehouse or storage location")
model Warehouse {
  @doc("Unique warehouse identifier")
  id: string;

  @doc("Warehouse code - unique identifier")
  code: string;

  @doc("Warehouse name")
  name: string;

  @doc("Physical address")
  address?: string;

  @doc("Whether warehouse is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Request to create a new warehouse")
model CreateWarehouseRequest {
  @doc("Warehouse code - must be unique")
  code: string;

  @doc("Warehouse name")
  name: string;

  @doc("Physical address")
  address?: string;

  @doc("Whether warehouse is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing warehouse")
model UpdateWarehouseRequest {
  @doc("Warehouse code")
  code?: string;

  @doc("Warehouse name")
  name?: string;

  @doc("Physical address")
  address?: string;

  @doc("Whether warehouse is active")
  is_active?: boolean;
}

@doc("Paginated list of warehouses")
model WarehouseListResponse {
  @doc("List of warehouses")
  data: Warehouse[];

  ...PaginationMeta;
}
