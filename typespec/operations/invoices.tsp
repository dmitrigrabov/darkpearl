using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/invoices")
@tag("Invoices")
interface Invoices {
  @doc("List all invoices with optional filters")
  @get
  list(
    @query customer_id?: string,
    @query status?: Models.InvoiceStatus,
    @query overdue?: boolean,
    @query date_from?: plainDate,
    @query date_to?: plainDate,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.InvoiceListResponse;

  @doc("Get an invoice by ID with items")
  @get
  @route("{id}")
  get(@path id: string): Models.InvoiceWithDetails | Models.ErrorResponse;

  @doc("Create a new invoice")
  @post
  create(@body request: Models.CreateInvoiceRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Invoice;
  } | Models.ErrorResponse;

  @doc("Update an existing invoice")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateInvoiceRequest,
  ): Models.Invoice | Models.ErrorResponse;

  @doc("Delete an invoice")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Add item to invoice")
  @post
  @route("{id}/items")
  addItem(
    @path id: string,
    @body request: Models.CreateInvoiceItemRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.InvoiceItem;
  } | Models.ErrorResponse;

  @doc("Update an invoice item")
  @put
  @route("{id}/items/{itemId}")
  updateItem(
    @path id: string,
    @path itemId: string,
    @body request: Models.UpdateInvoiceItemRequest,
  ): Models.InvoiceItem | Models.ErrorResponse;

  @doc("Remove item from invoice")
  @delete
  @route("{id}/items/{itemId}")
  removeItem(
    @path id: string,
    @path itemId: string,
  ): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Send invoice to customer")
  @post
  @route("{id}/send")
  send(@path id: string): Models.Invoice | Models.ErrorResponse;

  @doc("Mark invoice as paid")
  @post
  @route("{id}/mark-paid")
  markPaid(@path id: string): Models.Invoice | Models.ErrorResponse;
}
