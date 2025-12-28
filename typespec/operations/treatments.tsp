using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/treatments")
@tag("Treatments")
interface Treatments {
  @doc("List all treatments with optional filters")
  @get
  list(
    @query season?: Models.TreatmentSeason,
    @query is_active?: boolean,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.TreatmentListResponse;

  @doc("Get a treatment by ID with products")
  @get
  @route("{id}")
  get(@path id: string): Models.TreatmentWithProducts | Models.ErrorResponse;

  @doc("Create a new treatment")
  @post
  create(@body request: Models.CreateTreatmentRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Treatment;
  } | Models.ErrorResponse;

  @doc("Update an existing treatment")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateTreatmentRequest,
  ): Models.Treatment | Models.ErrorResponse;

  @doc("Delete a treatment")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Add product to treatment")
  @post
  @route("{id}/products")
  addProduct(
    @path id: string,
    @body request: Models.CreateTreatmentProductRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.TreatmentProduct;
  } | Models.ErrorResponse;

  @doc("Remove product from treatment")
  @delete
  @route("{id}/products/{productId}")
  removeProduct(
    @path id: string,
    @path productId: string,
  ): {
    message: string;
  } | Models.ErrorResponse;
}
