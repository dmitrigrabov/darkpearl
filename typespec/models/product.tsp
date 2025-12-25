namespace DarkPearl.Models;

@doc("Product in the catalog")
model Product {
  @doc("Unique product identifier")
  id: string;

  @doc("Stock Keeping Unit - unique product code")
  sku: string;

  @doc("Product name")
  name: string;

  @doc("Product description")
  description?: string;

  @doc("Unit price in base currency")
  unit_price: float64;

  @doc("Whether product is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Request to create a new product")
model CreateProductRequest {
  @doc("Stock Keeping Unit - must be unique")
  sku: string;

  @doc("Product name")
  name: string;

  @doc("Product description")
  description?: string;

  @doc("Unit price in base currency")
  unit_price: float64;

  @doc("Whether product is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing product")
model UpdateProductRequest {
  @doc("Stock Keeping Unit")
  sku?: string;

  @doc("Product name")
  name?: string;

  @doc("Product description")
  description?: string;

  @doc("Unit price in base currency")
  unit_price?: float64;

  @doc("Whether product is active")
  is_active?: boolean;
}

@doc("Paginated list of products")
model ProductListResponse {
  @doc("List of products")
  data: Product[];

  ...PaginationMeta;
}
