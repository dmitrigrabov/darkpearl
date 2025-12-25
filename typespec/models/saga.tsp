namespace DarkPearl.Models;

@doc("Saga status")
enum SagaStatus {
  @doc("Saga just started")
  started,

  @doc("Waiting to execute next step")
  step_pending,

  @doc("Currently executing a step")
  step_executing,

  @doc("Step completed successfully")
  step_completed,

  @doc("Step failed")
  step_failed,

  @doc("Running compensation steps")
  compensating,

  @doc("Compensation completed")
  compensation_completed,

  @doc("Saga completed successfully")
  completed,

  @doc("Saga failed")
  failed,
}

@doc("Saga step types for order fulfillment")
enum SagaStepType {
  @doc("Reserve stock for order items")
  reserve_stock,

  @doc("Process payment")
  process_payment,

  @doc("Fulfill order and deduct inventory")
  fulfill_order,

  @doc("Release reserved stock (compensation)")
  release_stock,

  @doc("Void payment (compensation)")
  void_payment,
}

@doc("Saga instance tracking distributed transaction")
model Saga {
  @doc("Unique saga identifier")
  id: string;

  @doc("Type of saga (e.g., 'order_fulfillment')")
  saga_type: string;

  @doc("Correlation ID linking to the entity (e.g., order ID)")
  correlation_id: string;

  @doc("Current saga status")
  status: SagaStatus;

  @doc("Current step being executed")
  current_step?: SagaStepType;

  @doc("Saga context data")
  payload: Record<unknown>;

  @doc("Error message if saga failed")
  error_message?: string;

  @doc("Number of retry attempts")
  retry_count: int32;

  @doc("Maximum retry attempts allowed")
  max_retries: int32;

  @doc("Creation timestamp")
  created_at: utcDateTime;

  @doc("Last update timestamp")
  updated_at: utcDateTime;

  @doc("Completion timestamp")
  completed_at?: utcDateTime;
}

@doc("Event in saga event store")
model SagaEvent {
  @doc("Unique event identifier")
  id: string;

  @doc("Saga ID this event belongs to")
  saga_id: string;

  @doc("Step type for this event")
  step_type: SagaStepType;

  @doc("Event type (e.g., 'step_started', 'step_completed', 'step_failed')")
  event_type: string;

  @doc("Event payload")
  payload: Record<unknown>;

  @doc("Creation timestamp")
  created_at: utcDateTime;
}
