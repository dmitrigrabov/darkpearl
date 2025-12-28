namespace DarkPearl.Models;

@doc("Customer payment")
model Payment {
  @doc("Unique payment identifier")
  id: string;

  @doc("Invoice being paid")
  invoice_id: string;

  @doc("Customer making payment")
  customer_id: string;

  @doc("Payment reference (bank ref, card auth code)")
  payment_reference?: string;

  @doc("Payment method")
  payment_method: PaymentMethod;

  @doc("Payment amount")
  amount: float64;

  @doc("Payment date")
  payment_date: plainDate;

  @doc("Whether payment is confirmed by bank")
  is_confirmed: boolean;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Payment with invoice and customer details")
model PaymentWithDetails {
  ...Payment;

  @doc("Invoice details")
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: float64;
    amount_paid: float64;
  };

  @doc("Customer details")
  customer?: {
    id: string;
    customer_number: string;
    first_name: string;
    last_name: string;
  };
}

@doc("Request to create a payment")
model CreatePaymentRequest {
  @doc("Invoice being paid")
  invoice_id: string;

  @doc("Customer making payment")
  customer_id: string;

  @doc("Payment reference")
  payment_reference?: string;

  @doc("Payment method")
  payment_method: PaymentMethod;

  @doc("Payment amount")
  amount: float64;

  @doc("Payment date (defaults to today)")
  payment_date?: plainDate;

  @doc("Whether payment is confirmed (defaults to false)")
  is_confirmed?: boolean;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to update a payment")
model UpdatePaymentRequest {
  @doc("Payment reference")
  payment_reference?: string;

  @doc("Payment method")
  payment_method?: PaymentMethod;

  @doc("Payment amount")
  amount?: float64;

  @doc("Payment date")
  payment_date?: plainDate;

  @doc("Whether payment is confirmed")
  is_confirmed?: boolean;

  @doc("Additional notes")
  notes?: string;
}

@doc("Paginated list of payments")
model PaymentListResponse {
  @doc("List of payments")
  data: PaymentWithDetails[];

  ...PaginationMeta;
}
