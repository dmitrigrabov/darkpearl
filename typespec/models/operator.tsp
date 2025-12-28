namespace DarkPearl.Models;

@doc("Technician who performs treatments")
model Operator {
  @doc("Unique operator identifier")
  id: string;

  @doc("Linked auth user (if operator logs in)")
  user_id?: string;

  @doc("Home depot (warehouse)")
  depot_id: string;

  @doc("Employee number (e.g., OP-001)")
  employee_number: string;

  @doc("First name")
  first_name: string;

  @doc("Last name")
  last_name: string;

  @doc("Email address")
  email?: string;

  @doc("Phone number")
  phone: string;

  @doc("Hourly cost for P&L")
  hourly_cost: float64;

  @doc("Whether operator is active")
  is_active: boolean;

  ...Timestamps;
}

@doc("Operator with depot details")
model OperatorWithDetails {
  ...Operator;

  @doc("Depot details")
  depot?: {
    id: string;
    code: string;
    name: string;
  };
}

@doc("Request to create a new operator")
model CreateOperatorRequest {
  @doc("Linked auth user (if operator logs in)")
  user_id?: string;

  @doc("Home depot (warehouse)")
  depot_id: string;

  @doc("First name")
  first_name: string;

  @doc("Last name")
  last_name: string;

  @doc("Email address")
  email?: string;

  @doc("Phone number")
  phone: string;

  @doc("Hourly cost for P&L")
  hourly_cost: float64;

  @doc("Whether operator is active (defaults to true)")
  is_active?: boolean;
}

@doc("Request to update an existing operator")
model UpdateOperatorRequest {
  @doc("Linked auth user")
  user_id?: string;

  @doc("Home depot")
  depot_id?: string;

  @doc("First name")
  first_name?: string;

  @doc("Last name")
  last_name?: string;

  @doc("Email address")
  email?: string;

  @doc("Phone number")
  phone?: string;

  @doc("Hourly cost for P&L")
  hourly_cost?: float64;

  @doc("Whether operator is active")
  is_active?: boolean;
}

@doc("Paginated list of operators")
model OperatorListResponse {
  @doc("List of operators")
  data: OperatorWithDetails[];

  ...PaginationMeta;
}
