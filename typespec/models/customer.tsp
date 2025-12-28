namespace DarkPearl.Models;

@doc("Customer who owns lawns")
model Customer {
  @doc("Unique customer identifier")
  id: string;

  @doc("Customer number (e.g., GM-10001)")
  customer_number: string;

  @doc("First name")
  first_name: string;

  @doc("Last name")
  last_name: string;

  @doc("Email address")
  email?: string;

  @doc("Primary phone number")
  phone?: string;

  @doc("Secondary phone number")
  phone_secondary?: string;

  @doc("Billing address line 1")
  billing_address_line1?: string;

  @doc("Billing address line 2")
  billing_address_line2?: string;

  @doc("Billing city")
  billing_city?: string;

  @doc("Billing postcode (UK format)")
  billing_postcode?: string;

  @doc("Whether customer is active")
  is_active: boolean;

  @doc("Preferred contact method")
  preferred_contact_method?: string;

  @doc("Marketing consent given")
  marketing_consent: boolean;

  @doc("Additional notes")
  notes?: string;

  ...Timestamps;
}

@doc("Request to create a new customer")
model CreateCustomerRequest {
  @doc("First name")
  first_name: string;

  @doc("Last name")
  last_name: string;

  @doc("Email address")
  email?: string;

  @doc("Primary phone number")
  phone?: string;

  @doc("Secondary phone number")
  phone_secondary?: string;

  @doc("Billing address line 1")
  billing_address_line1?: string;

  @doc("Billing address line 2")
  billing_address_line2?: string;

  @doc("Billing city")
  billing_city?: string;

  @doc("Billing postcode (UK format)")
  billing_postcode?: string;

  @doc("Whether customer is active (defaults to true)")
  is_active?: boolean;

  @doc("Preferred contact method (defaults to email)")
  preferred_contact_method?: string;

  @doc("Marketing consent given (defaults to false)")
  marketing_consent?: boolean;

  @doc("Additional notes")
  notes?: string;
}

@doc("Request to update an existing customer")
model UpdateCustomerRequest {
  @doc("First name")
  first_name?: string;

  @doc("Last name")
  last_name?: string;

  @doc("Email address")
  email?: string;

  @doc("Primary phone number")
  phone?: string;

  @doc("Secondary phone number")
  phone_secondary?: string;

  @doc("Billing address line 1")
  billing_address_line1?: string;

  @doc("Billing address line 2")
  billing_address_line2?: string;

  @doc("Billing city")
  billing_city?: string;

  @doc("Billing postcode (UK format)")
  billing_postcode?: string;

  @doc("Whether customer is active")
  is_active?: boolean;

  @doc("Preferred contact method")
  preferred_contact_method?: string;

  @doc("Marketing consent given")
  marketing_consent?: boolean;

  @doc("Additional notes")
  notes?: string;
}

@doc("Paginated list of customers")
model CustomerListResponse {
  @doc("List of customers")
  data: Customer[];

  ...PaginationMeta;
}
