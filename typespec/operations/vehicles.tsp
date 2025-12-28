using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/vehicles")
@tag("Vehicles")
interface Vehicles {
  @doc("List all vehicles with optional filters")
  @get
  list(
    @query depot_id?: string,
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.VehicleListResponse;

  @doc("Get a vehicle by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.VehicleWithDetails | Models.ErrorResponse;

  @doc("Create a new vehicle")
  @post
  create(@body request: Models.CreateVehicleRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Vehicle;
  } | Models.ErrorResponse;

  @doc("Update an existing vehicle")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateVehicleRequest,
  ): Models.Vehicle | Models.ErrorResponse;

  @doc("Delete a vehicle")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
