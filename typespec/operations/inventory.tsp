using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/inventory")
@tag("Inventory")
interface Inventory {
  @doc("List inventory levels with optional filters")
  @get
  list(
    @query product_id?: string,
    @query warehouse_id?: string,
    @query low_stock?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.InventoryListResponse;

  @doc("Get inventory record by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.InventoryWithDetails | Models.ErrorResponse;

  @doc("Create inventory record for product-warehouse combination")
  @post
  create(@body request: Models.CreateInventoryRequest): {
    @statusCode statusCode: 201;
    @body body: Models.InventoryLevel;
  } | Models.ErrorResponse;

  @doc("Update inventory record")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateInventoryRequest,
  ): Models.InventoryLevel | Models.ErrorResponse;

  @doc("Delete inventory record")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
