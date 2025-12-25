using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/products")
@tag("Products")
interface Products {
  @doc("List all products with optional filters")
  @get
  list(
    @query is_active?: boolean,
    @query search?: string,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.ProductListResponse;

  @doc("Get a product by ID")
  @get
  @route("{id}")
  get(@path id: string): Models.Product | Models.ErrorResponse;

  @doc("Create a new product")
  @post
  create(@body request: Models.CreateProductRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Product;
  } | Models.ErrorResponse;

  @doc("Update an existing product")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateProductRequest,
  ): Models.Product | Models.ErrorResponse;

  @doc("Delete a product")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;
}
