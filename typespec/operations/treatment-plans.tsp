using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/treatment-plans")
@tag("Treatment Plans")
interface TreatmentPlans {
  @doc("List all treatment plans with optional filters")
  @get
  list(
    @query lawn_id?: string,
    @query customer_id?: string,
    @query year?: int32,
    @query status?: Models.TreatmentPlanStatus,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.TreatmentPlanListResponse;

  @doc("Get a treatment plan by ID with items")
  @get
  @route("{id}")
  get(@path id: string): Models.TreatmentPlanWithDetails | Models.ErrorResponse;

  @doc("Create a new treatment plan")
  @post
  create(@body request: Models.CreateTreatmentPlanRequest): {
    @statusCode statusCode: 201;
    @body body: Models.TreatmentPlan;
  } | Models.ErrorResponse;

  @doc("Update an existing treatment plan")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateTreatmentPlanRequest,
  ): Models.TreatmentPlan | Models.ErrorResponse;

  @doc("Delete a treatment plan")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Add item to treatment plan")
  @post
  @route("{id}/items")
  addItem(
    @path id: string,
    @body request: Models.CreateTreatmentPlanItemRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.TreatmentPlanItem;
  } | Models.ErrorResponse;

  @doc("Update a treatment plan item")
  @put
  @route("{id}/items/{itemId}")
  updateItem(
    @path id: string,
    @path itemId: string,
    @body request: Models.UpdateTreatmentPlanItemRequest,
  ): Models.TreatmentPlanItem | Models.ErrorResponse;

  @doc("Remove item from treatment plan")
  @delete
  @route("{id}/items/{itemId}")
  removeItem(
    @path id: string,
    @path itemId: string,
  ): {
    message: string;
  } | Models.ErrorResponse;
}
