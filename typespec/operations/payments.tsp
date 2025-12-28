using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/payments")
@tag("Payments")
interface Payments {
  @doc("List all payments with optional filters")
  @get
  list(
    @query customer_id?: string,
    @query invoice_id?: string,
    @query payment_method?: Models.PaymentMethod,
    @query is_confirmed?: boolean,
    @query date_from?: plainDate,
    @query date_to?: plainDate,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.PaymentListResponse;

  @doc("Get a payment by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.PaymentWithDetails | Models.ErrorResponse;

  @doc("Create a new payment")
  @post
  create(@body request: Models.CreatePaymentRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Payment;
  } | Models.ErrorResponse;

  @doc("Update an existing payment")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdatePaymentRequest,
  ): Models.Payment | Models.ErrorResponse;

  @doc("Delete a payment")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Confirm payment (bank confirmation received)")
  @post
  @route("{id}/confirm")
  confirm(@path id: string): Models.Payment | Models.ErrorResponse;
}
