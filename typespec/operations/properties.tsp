using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/properties")
@tag("Properties")
interface Properties {
  @doc("List all properties with optional filters")
  @get
  list(
    @query customer_id?: string,
    @query postcode?: string,
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.PropertyListResponse;

  @doc("Get a property by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.PropertyWithDetails | Models.ErrorResponse;

  @doc("Create a new property")
  @post
  create(@body request: Models.CreatePropertyRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Property;
  } | Models.ErrorResponse;

  @doc("Update an existing property")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdatePropertyRequest,
  ): Models.Property | Models.ErrorResponse;

  @doc("Delete a property")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
