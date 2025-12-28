using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/customers")
@tag("Customers")
interface Customers {
  @doc("List all customers with optional filters")
  @get
  list(
    @query is_active?: boolean,
    @query search?: string,
    @query postcode?: string,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.CustomerListResponse;

  @doc("Get a customer by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.Customer | Models.ErrorResponse;

  @doc("Create a new customer")
  @post
  create(@body request: Models.CreateCustomerRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Customer;
  } | Models.ErrorResponse;

  @doc("Update an existing customer")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateCustomerRequest,
  ): Models.Customer | Models.ErrorResponse;

  @doc("Delete a customer")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
