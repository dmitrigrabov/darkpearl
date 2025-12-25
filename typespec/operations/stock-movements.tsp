using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/stock-movements")
@tag("Stock Movements")
interface StockMovements {
  @doc("List stock movements with optional filters")
  @get
  list(
    @query product_id?: string,
    @query warehouse_id?: string,
    @query movement_type?: string,
    @query reference_id?: string,
    @query correlation_id?: string,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.StockMovementListResponse;

  @doc("Get stock movement by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.StockMovementWithDetails | Models.ErrorResponse;

  @doc("Create a stock movement (receive, transfer, adjust, reserve, release, fulfill)")
  @post
  create(@body request: Models.CreateStockMovementRequest): {
    @statusCode statusCode: 201;
    @body body: Models.StockMovement;
  } | Models.ErrorResponse;
}
