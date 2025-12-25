namespace DarkPearl.Models;

@doc("Standard error response")
model ErrorResponse {
  @doc("Error message")
  error: string;
}

@doc("Paginated list response metadata")
model PaginationMeta {
  @doc("Total count of items")
  count: int32;

  @doc("Maximum items per page")
  limit: int32;

  @doc("Offset from start")
  offset: int32;
}

@doc("Standard timestamps for entities")
model Timestamps {
  @doc("Creation timestamp")
  created_at: utcDateTime;

  @doc("Last update timestamp")
  updated_at: utcDateTime;
}
