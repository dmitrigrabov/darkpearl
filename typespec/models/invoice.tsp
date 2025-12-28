namespace DarkPearl.Models;

@doc("Customer invoice")
model Invoice {
  @doc("Unique invoice identifier")
  id: string;

  @doc("Customer being billed")
  customer_id: string;

  @doc("Invoice number (e.g., INV-2024-00123)")
  invoice_number: string;

  @doc("Invoice status")
  status: InvoiceStatus;

  @doc("Issue date")
  issue_date: plainDate;

  @doc("Due date")
  due_date: plainDate;

  @doc("Subtotal before VAT")
  subtotal: float64;

  @doc("VAT rate (e.g., 20.00 for 20%)")
  vat_rate: float64;

  @doc("VAT amount")
  vat_amount: float64;

  @doc("Total amount including VAT")
  total_amount: float64;

  @doc("Amount already paid")
  amount_paid: float64;

  @doc("Payment terms in days")
  payment_terms_days: int32;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Invoice line item")
model InvoiceItem {
  @doc("Unique item identifier")
  id: string;

  @doc("Parent invoice")
  invoice_id: string;

  @doc("Linked job (if applicable)")
  job_id?: string;

  @doc("Item description")
  description: string;

  @doc("Quantity")
  quantity: float64;

  @doc("Unit price")
  unit_price: float64;

  @doc("Line total")
  line_total: float64;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}

@doc("Invoice item with job details")
model InvoiceItemWithDetails {
  ...InvoiceItem;

  @doc("Job details")
  job?: {
    id: string;
    job_number: string;
    scheduled_date: plainDate;
  };
}

@doc("Invoice with full details")
model InvoiceWithDetails {
  ...Invoice;

  @doc("Invoice line items")
  items?: InvoiceItemWithDetails[];

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
    email?: string;
    billing_address_line1?: string;
    billing_postcode?: string;
  };

  @doc("Amount outstanding")
  amount_outstanding?: float64;
}

@doc("Request to create an invoice")
model CreateInvoiceRequest {
  @doc("Customer being billed")
  customer_id: string;

  @doc("Invoice status (defaults to draft)")
  status?: InvoiceStatus;

  @doc("Issue date (defaults to today)")
  issue_date?: plainDate;

  @doc("Due date")
  due_date: plainDate;

  @doc("VAT rate (defaults to 20.00)")
  vat_rate?: float64;

  @doc("Payment terms in days (defaults to 30)")
  payment_terms_days?: int32;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to update an invoice")
model UpdateInvoiceRequest {
  @doc("Invoice status")
  status?: InvoiceStatus;

  @doc("Due date")
  due_date?: plainDate;

  @doc("VAT rate")
  vat_rate?: float64;

  @doc("Payment terms in days")
  payment_terms_days?: int32;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to add item to invoice")
model CreateInvoiceItemRequest {
  @doc("Linked job (if applicable)")
  job_id?: string;

  @doc("Item description")
  description: string;

  @doc("Quantity")
  quantity: float64;

  @doc("Unit price")
  unit_price: float64;
}

@doc("Request to update an invoice item")
model UpdateInvoiceItemRequest {
  @doc("Item description")
  description?: string;

  @doc("Quantity")
  quantity?: float64;

  @doc("Unit price")
  unit_price?: float64;
}

@doc("Paginated list of invoices")
model InvoiceListResponse {
  @doc("List of invoices")
  data: InvoiceWithDetails[];

  ...PaginationMeta;
}
