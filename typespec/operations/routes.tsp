using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/routes")
@tag("Routes")
interface Routes {
  @doc("List all routes with optional filters")
  @get
  list(
    @query operator_id?: string,
    @query depot_id?: string,
    @query route_date?: plainDate,
    @query date_from?: plainDate,
    @query date_to?: plainDate,
    @query status?: Models.RouteStatus,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.RouteListResponse;

  @doc("Get a route by ID with stops")
  @get
  @route("{id}")
  get(@path id: string): Models.RouteWithDetails | Models.ErrorResponse;

  @doc("Create a new route")
  @post
  create(@body request: Models.CreateRouteRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Route;
  } | Models.ErrorResponse;

  @doc("Update an existing route")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateRouteRequest,
  ): Models.Route | Models.ErrorResponse;

  @doc("Delete a route")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Add stop to route")
  @post
  @route("{id}/stops")
  addStop(
    @path id: string,
    @body request: Models.CreateRouteStopRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.RouteStop;
  } | Models.ErrorResponse;

  @doc("Update a route stop")
  @put
  @route("{id}/stops/{stopId}")
  updateStop(
    @path id: string,
    @path stopId: string,
    @body request: Models.UpdateRouteStopRequest,
  ): Models.RouteStop | Models.ErrorResponse;

  @doc("Remove stop from route")
  @delete
  @route("{id}/stops/{stopId}")
  removeStop(
    @path id: string,
    @path stopId: string,
  ): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Start route execution")
  @post
  @route("{id}/start")
  start(@path id: string): Models.Route | Models.ErrorResponse;

  @doc("Complete route execution")
  @post
  @route("{id}/complete")
  complete(@path id: string): Models.Route | Models.ErrorResponse;
}
