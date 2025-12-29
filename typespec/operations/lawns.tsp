using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/lawns")
@tag("Lawns")
interface Lawns {
  @doc("List all lawns with optional filters")
  @get
  list(
    @query property_id?: string,
    @query customer_id?: string,
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.LawnListResponse;

  @doc("Get a lawn by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.LawnWithDetails | Models.ErrorResponse;

  @doc("Create a new lawn")
  @post
  create(@body request: Models.CreateLawnRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Lawn;
  } | Models.ErrorResponse;

  @doc("Update an existing lawn")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateLawnRequest,
  ): Models.Lawn | Models.ErrorResponse;

  @doc("Delete a lawn")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Analyze satellite image for lawn boundaries using AI")
  @post
  @route("detect")
  detect(@body request: Models.LawnDetectionRequest): {
    @statusCode statusCode: 200;
    @body body: Models.LawnDetectionResponse;
  } | Models.ErrorResponse;
}
