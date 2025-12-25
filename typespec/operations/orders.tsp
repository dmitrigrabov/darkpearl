using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/orders")
@tag("Orders")
interface Orders {
  @doc("List orders with optional filters")
  @get
  list(
    @query status?: string,
    @query customer_id?: string,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.OrderListResponse;

  @doc("Get order by ID with items and saga status")
  @get
  @route("{id}")
  get(@path id: string): Models.OrderWithDetails | Models.ErrorResponse;

  @doc("Create a new order and start fulfillment saga")
  @post
  create(@body request: Models.CreateOrderRequest): {
    @statusCode statusCode: 201;
    @body body: Models.CreateOrderResponse;
  } | Models.ErrorResponse;

  @doc("Cancel an order (triggers saga compensation if in progress)")
  @delete
  @route("{id}")
  cancel(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
