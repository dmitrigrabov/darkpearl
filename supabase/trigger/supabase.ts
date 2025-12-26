// Supabase client for trigger.dev tasks
import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Saga service functions
export async function createSagaRecord(
  correlationId: string,
  payload: Record<string, unknown>,
  triggerRunId?: string
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sagas")
    .insert({
      saga_type: "order_fulfillment",
      correlation_id: correlationId,
      status: "started",
      payload,
      trigger_run_id: triggerRunId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSagaByCorrelationId(correlationId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sagas")
    .select("*")
    .eq("correlation_id", correlationId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateSagaStatus(
  sagaId: string,
  status: string,
  errorMessage?: string | null
) {
  const supabase = getSupabaseClient();
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage !== undefined) {
    updateData.error_message = errorMessage;
  }

  if (status === "completed" || status === "failed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("sagas")
    .update(updateData)
    .eq("id", sagaId);

  if (error) throw error;
}

export async function updateSagaStep(
  sagaId: string,
  step: string,
  status: string
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("sagas")
    .update({
      current_step: step,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sagaId);

  if (error) throw error;
}

export async function recordSagaEvent(
  sagaId: string,
  stepType: string,
  eventType: string,
  payload: Record<string, unknown> = {}
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("saga_events").insert({
    saga_id: sagaId,
    step_type: stepType,
    event_type: eventType,
    payload,
  });

  if (error) throw error;
}

export async function getCompletedSteps(sagaId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("saga_events")
    .select("step_type")
    .eq("saga_id", sagaId)
    .eq("event_type", "step_completed");

  if (error) throw error;
  return data?.map((e) => e.step_type) || [];
}

// Order service functions
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
}

export async function updateOrder(
  orderId: string,
  data: Record<string, unknown>
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("orders")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
}

// Inventory service functions
export async function getInventoryByProductWarehouse(
  productId: string,
  warehouseId: string
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateInventoryQuantities(
  inventoryId: string,
  quantities: { quantity_available?: number; quantity_reserved?: number }
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("inventory")
    .update({ ...quantities, updated_at: new Date().toISOString() })
    .eq("id", inventoryId);

  if (error) throw error;
}

// Stock movement service functions
export async function createStockMovement(data: {
  correlationId: string;
  productId: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  referenceId: string;
  referenceType: string;
  notes?: string;
}) {
  const supabase = getSupabaseClient();

  // Check for existing movement (idempotency)
  const { data: existing } = await supabase
    .from("stock_movements")
    .select("id")
    .eq("correlation_id", data.correlationId)
    .eq("movement_type", data.movementType)
    .eq("product_id", data.productId)
    .eq("warehouse_id", data.warehouseId)
    .single();

  if (existing) {
    return existing;
  }

  const { data: movement, error } = await supabase
    .from("stock_movements")
    .insert({
      correlation_id: data.correlationId,
      product_id: data.productId,
      warehouse_id: data.warehouseId,
      movement_type: data.movementType,
      quantity: data.quantity,
      reference_id: data.referenceId,
      reference_type: data.referenceType,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return movement;
}
