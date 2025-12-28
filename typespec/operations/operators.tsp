using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/operators")
@tag("Operators")
interface Operators {
  @doc("List all operators with optional filters")
  @get
  list(
    @query depot_id?: string,
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.OperatorListResponse;

  @doc("Get an operator by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.OperatorWithDetails | Models.ErrorResponse;

  @doc("Create a new operator")
  @post
  create(@body request: Models.CreateOperatorRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Operator;
  } | Models.ErrorResponse;

  @doc("Update an existing operator")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateOperatorRequest,
  ): Models.Operator | Models.ErrorResponse;

  @doc("Delete an operator")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
