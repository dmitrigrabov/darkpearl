using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/warehouses")
@tag("Warehouses")
interface Warehouses {
  @doc("List all warehouses with optional filters")
  @get
  list(
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.WarehouseListResponse;

  @doc("Get a warehouse by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.Warehouse | Models.ErrorResponse;

  @doc("Create a new warehouse")
  @post
  create(@body request: Models.CreateWarehouseRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Warehouse;
  } | Models.ErrorResponse;

  @doc("Update an existing warehouse")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateWarehouseRequest,
  ): Models.Warehouse | Models.ErrorResponse;

  @doc("Delete a warehouse (fails if inventory exists)")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
