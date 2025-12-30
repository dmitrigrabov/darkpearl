import {z} from 'zod'

export const modelsCoordinate = z.object({latitude: z.number(), longitude: z.number()});

export const modelsCreateCustomerRequest = z.object({first_name: z.string(), last_name: z.string(), email: z.string().optional(), phone: z.string().optional(), phone_secondary: z.string().optional(), billing_address_line1: z.string().optional(), billing_address_line2: z.string().optional(), billing_city: z.string().optional(), billing_postcode: z.string().optional(), is_active: z.boolean().optional(), preferred_contact_method: z.string().optional(), marketing_consent: z.boolean().optional(), notes: z.string().optional()});

export const modelsCreateInventoryRequest = z.object({product_id: z.string(), warehouse_id: z.string(), quantity_available: z.number().int().optional(), reorder_point: z.number().int().nonnegative("Reorder point must be non-negative").optional(), reorder_quantity: z.number().int().nonnegative("Reorder quantity must be non-negative").optional()});

export const modelsCreateInvoiceItemRequest = z.object({job_id: z.string().optional(), description: z.string(), quantity: z.number(), unit_price: z.number()});

export const modelsCreateInvoiceRequest = z.object({customer_id: z.string(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"]).optional(), issue_date: z.string().optional(), due_date: z.string(), vat_rate: z.number().optional(), payment_terms_days: z.number().int().optional(), notes: z.string().optional()});

export const modelsCreateJobConsumptionRequest = z.object({job_treatment_id: z.string(), product_id: z.string(), warehouse_id: z.string(), quantity_consumed: z.number()});

export const modelsCreateJobRequest = z.object({lawn_id: z.string(), route_stop_id: z.string().optional(), treatment_plan_item_id: z.string().optional(), status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped", "rescheduled"]).optional(), scheduled_date: z.string(), lawn_area_sqm: z.number(), lawn_condition_at_job: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), before_notes: z.string().optional()});

export const modelsCreateJobTreatmentRequest = z.object({treatment_id: z.string(), price_charged: z.number(), duration_minutes: z.number().int().optional()});

export const modelsCreateLawnRequest = z.object({property_id: z.string(), name: z.string(), area_sqm: z.number(), lawn_condition: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), boundary: z.array(modelsCoordinate).optional(), access_notes: z.string().optional(), is_active: z.boolean().optional()});

export const modelsCreateOperatorRequest = z.object({user_id: z.string().optional(), depot_id: z.string(), first_name: z.string(), last_name: z.string(), email: z.string().optional(), phone: z.string(), hourly_cost: z.number(), is_active: z.boolean().optional()});

export const modelsCreateOrderItemRequest = z.object({product_id: z.string(), quantity: z.number().int(), unit_price: z.number()});

export const modelsCreateOrderRequest = z.object({customer_id: z.string().optional(), warehouse_id: z.string(), notes: z.string().optional(), items: z.array(modelsCreateOrderItemRequest)});

export const modelsOrderItem = z.object({id: z.string(), order_id: z.string(), product_id: z.string(), quantity: z.number().int(), unit_price: z.number(), created_at: z.string()});

export const modelsCreateOrderResponse = z.object({items: z.array(modelsOrderItem), message: z.string(), id: z.string(), order_number: z.string(), status: z.enum(["pending", "reserved", "payment_processing", "payment_failed", "paid", "fulfilling", "fulfilled", "cancelled"]), customer_id: z.string().optional(), warehouse_id: z.string(), total_amount: z.number(), payment_reference: z.string().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsCreatePaymentRequest = z.object({invoice_id: z.string(), customer_id: z.string(), payment_reference: z.string().optional(), payment_method: z.enum(["card", "bank_transfer", "direct_debit", "cash", "cheque"]), amount: z.number(), payment_date: z.string().optional(), is_confirmed: z.boolean().optional(), notes: z.string().optional()});

export const modelsCreateProductRequest = z.object({sku: z.string(), name: z.string(), description: z.string().optional(), unit_price: z.number(), is_active: z.boolean().optional()});

export const modelsCreatePropertyRequest = z.object({customer_id: z.string(), address_line1: z.string(), address_line2: z.string().optional(), city: z.string(), postcode: z.string(), latitude: z.number().optional(), longitude: z.number().optional(), access_notes: z.string().optional(), is_active: z.boolean().optional()});

export const modelsCreateRouteRequest = z.object({operator_id: z.string(), vehicle_id: z.string().optional(), depot_id: z.string(), route_date: z.string(), status: z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]).optional(), notes: z.string().optional()});

export const modelsCreateRouteStopRequest = z.object({lawn_id: z.string(), stop_order: z.number().int(), estimated_arrival: z.string().optional(), estimated_departure: z.string().optional(), distance_from_previous_miles: z.number().optional()});

export const modelsCreateStockMovementRequest = z.object({correlation_id: z.string().optional(), product_id: z.string(), warehouse_id: z.string(), movement_type: z.enum(["receive", "transfer_out", "transfer_in", "adjust", "reserve", "release", "fulfill"]), quantity: z.number().int(), reference_id: z.string().optional(), reference_type: z.string().optional(), notes: z.string().optional()});

export const modelsCreateTreatmentPlanItemRequest = z.object({treatment_id: z.string(), scheduled_week: z.string().optional(), window_start: z.string().optional(), window_end: z.string().optional(), price_snapshot: z.number()});

export const modelsCreateTreatmentPlanRequest = z.object({lawn_id: z.string(), year: z.number().int(), status: z.enum(["active", "paused", "completed", "cancelled"]).optional(), total_estimated_price: z.number().optional(), notes: z.string().optional()});

export const modelsCreateTreatmentProductRequest = z.object({product_id: z.string(), quantity_per_100sqm: z.number(), quantity_multiplier_poor: z.number().optional()});

export const modelsCreateTreatmentRequest = z.object({code: z.string(), name: z.string(), description: z.string().optional(), season: z.enum(["spring_early", "spring_late", "summer", "autumn_early", "autumn_late"]).optional(), sequence_in_year: z.number().int().optional(), price_per_sqm: z.number(), min_price: z.number().optional(), minutes_per_100sqm: z.number(), setup_minutes: z.number().int().optional(), is_active: z.boolean().optional()});

export const modelsCreateVehicleRequest = z.object({depot_id: z.string(), registration: z.string(), make: z.string().optional(), vehicle_model: z.string().optional(), cost_per_mile: z.number().optional(), load_capacity_kg: z.number().optional(), is_active: z.boolean().optional()});

export const modelsCreateWarehouseRequest = z.object({code: z.string(), name: z.string(), address: z.string().optional(), is_active: z.boolean().optional()});

export const modelsCustomer = z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string(), email: z.string().optional(), phone: z.string().optional(), phone_secondary: z.string().optional(), billing_address_line1: z.string().optional(), billing_address_line2: z.string().optional(), billing_city: z.string().optional(), billing_postcode: z.string().optional(), is_active: z.boolean(), preferred_contact_method: z.string().optional(), marketing_consent: z.boolean(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsCustomerListResponse = z.object({data: z.array(modelsCustomer), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsErrorResponse = z.object({error: z.string()});

export const modelsInventoryLevel = z.object({id: z.string(), product_id: z.string(), warehouse_id: z.string(), quantity_available: z.number().int(), quantity_reserved: z.number().int(), reorder_point: z.number().int().nonnegative("Reorder point must be non-negative"), reorder_quantity: z.number().int().nonnegative("Reorder quantity must be non-negative"), created_at: z.string(), updated_at: z.string()});

export const modelsInventoryWithDetails = z.object({product: z.object({id: z.string(), sku: z.string(), name: z.string()}), warehouse: z.object({id: z.string(), code: z.string(), name: z.string()}), id: z.string(), product_id: z.string(), warehouse_id: z.string(), quantity_available: z.number().int(), quantity_reserved: z.number().int(), reorder_point: z.number().int().nonnegative("Reorder point must be non-negative"), reorder_quantity: z.number().int().nonnegative("Reorder quantity must be non-negative"), created_at: z.string(), updated_at: z.string()});

export const modelsInventoryListResponse = z.object({data: z.array(modelsInventoryWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsInvoice = z.object({id: z.string(), customer_id: z.string(), invoice_number: z.string(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"]), issue_date: z.string(), due_date: z.string(), subtotal: z.number(), vat_rate: z.number(), vat_amount: z.number(), total_amount: z.number(), amount_paid: z.number(), payment_terms_days: z.number().int(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsInvoiceItem = z.object({id: z.string(), invoice_id: z.string(), job_id: z.string().optional(), description: z.string(), quantity: z.number(), unit_price: z.number(), line_total: z.number(), created_at: z.string()});

export const modelsInvoiceItemWithDetails = z.object({id: z.string(), invoice_id: z.string(), job_id: z.string().optional(), description: z.string(), quantity: z.number(), unit_price: z.number(), line_total: z.number(), created_at: z.string(), job: z.object({id: z.string(), job_number: z.string(), scheduled_date: z.string()}).optional()});

export const modelsInvoiceWithDetails = z.object({id: z.string(), customer_id: z.string(), invoice_number: z.string(), status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"]), issue_date: z.string(), due_date: z.string(), subtotal: z.number(), vat_rate: z.number(), vat_amount: z.number(), total_amount: z.number(), amount_paid: z.number(), payment_terms_days: z.number().int(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string(), items: z.array(modelsInvoiceItemWithDetails).optional(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string(), email: z.string().optional(), billing_address_line1: z.string().optional(), billing_postcode: z.string().optional()}).optional(), amount_outstanding: z.number().optional()});

export const modelsInvoiceListResponse = z.object({data: z.array(modelsInvoiceWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsInvoiceStatus = z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"]);

export const modelsJob = z.object({id: z.string(), lawn_id: z.string(), route_stop_id: z.string().optional(), treatment_plan_item_id: z.string().optional(), job_number: z.string(), status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped", "rescheduled"]), scheduled_date: z.string(), started_at: z.string().optional(), completed_at: z.string().optional(), performed_by: z.string().optional(), lawn_area_sqm: z.number(), lawn_condition_at_job: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), before_notes: z.string().optional(), after_notes: z.string().optional(), customer_signature_url: z.string().optional(), before_photos: z.array(z.string()).optional(), after_photos: z.array(z.string()).optional(), created_at: z.string(), updated_at: z.string()});

export const modelsJobConsumption = z.object({id: z.string(), job_id: z.string(), job_treatment_id: z.string(), product_id: z.string(), warehouse_id: z.string(), quantity_consumed: z.number(), stock_movement_id: z.string().optional(), created_at: z.string()});

export const modelsJobTreatmentWithDetails = z.object({id: z.string(), job_id: z.string(), treatment_id: z.string(), price_charged: z.number(), duration_minutes: z.number().int().optional(), created_at: z.string(), treatment: z.object({id: z.string(), code: z.string(), name: z.string()}).optional(), consumptions: z.array(modelsJobConsumption).optional()});

export const modelsJobWithDetails = z.object({id: z.string(), lawn_id: z.string(), route_stop_id: z.string().optional(), treatment_plan_item_id: z.string().optional(), job_number: z.string(), status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped", "rescheduled"]), scheduled_date: z.string(), started_at: z.string().optional(), completed_at: z.string().optional(), performed_by: z.string().optional(), lawn_area_sqm: z.number(), lawn_condition_at_job: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), before_notes: z.string().optional(), after_notes: z.string().optional(), customer_signature_url: z.string().optional(), before_photos: z.array(z.string()).optional(), after_photos: z.array(z.string()).optional(), created_at: z.string(), updated_at: z.string(), treatments: z.array(modelsJobTreatmentWithDetails).optional(), lawn: z.object({id: z.string(), address_line1: z.string(), postcode: z.string()}).optional(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string()}).optional(), operator: z.object({id: z.string(), employee_number: z.string(), first_name: z.string(), last_name: z.string()}).optional()});

export const modelsJobListResponse = z.object({data: z.array(modelsJobWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsJobStatus = z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped", "rescheduled"]);

export const modelsJobTreatment = z.object({id: z.string(), job_id: z.string(), treatment_id: z.string(), price_charged: z.number(), duration_minutes: z.number().int().optional(), created_at: z.string()});

export const modelsLawn = z.object({id: z.string(), property_id: z.string(), name: z.string(), area_sqm: z.number(), lawn_condition: z.enum(["excellent", "good", "fair", "poor", "new"]), boundary: z.array(modelsCoordinate).optional(), access_notes: z.string().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsLawnCondition = z.enum(["excellent", "good", "fair", "poor", "new"]);

export const modelsLawnWithDetails = z.object({id: z.string(), property_id: z.string(), name: z.string(), area_sqm: z.number(), lawn_condition: z.enum(["excellent", "good", "fair", "poor", "new"]), boundary: z.array(modelsCoordinate).optional(), access_notes: z.string().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string(), property: z.object({id: z.string(), address_line1: z.string(), postcode: z.string(), latitude: z.number().optional(), longitude: z.number().optional()}).optional(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string()}).optional()});

export const modelsLawnListResponse = z.object({data: z.array(modelsLawnWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsMovementType = z.enum(["receive", "transfer_out", "transfer_in", "adjust", "reserve", "release", "fulfill"]);

export const modelsOperator = z.object({id: z.string(), user_id: z.string().optional(), depot_id: z.string(), employee_number: z.string(), first_name: z.string(), last_name: z.string(), email: z.string().optional(), phone: z.string(), hourly_cost: z.number(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsOperatorWithDetails = z.object({id: z.string(), user_id: z.string().optional(), depot_id: z.string(), employee_number: z.string(), first_name: z.string(), last_name: z.string(), email: z.string().optional(), phone: z.string(), hourly_cost: z.number(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string(), depot: z.object({id: z.string(), code: z.string(), name: z.string()}).optional()});

export const modelsOperatorListResponse = z.object({data: z.array(modelsOperatorWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsOrder = z.object({id: z.string(), order_number: z.string(), status: z.enum(["pending", "reserved", "payment_processing", "payment_failed", "paid", "fulfilling", "fulfilled", "cancelled"]), customer_id: z.string().optional(), warehouse_id: z.string(), total_amount: z.number(), payment_reference: z.string().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsOrderListResponse = z.object({data: z.array(modelsOrder), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsOrderStatus = z.enum(["pending", "reserved", "payment_processing", "payment_failed", "paid", "fulfilling", "fulfilled", "cancelled"]);

export const modelsOrderWithDetails = z.object({items: z.array(modelsOrderItem), warehouse: z.object({id: z.string(), code: z.string(), name: z.string()}), saga: z.object({id: z.string(), status: z.string(), current_step: z.string().optional(), error_message: z.string().optional(), created_at: z.string(), completed_at: z.string().optional()}).optional(), id: z.string(), order_number: z.string(), status: z.enum(["pending", "reserved", "payment_processing", "payment_failed", "paid", "fulfilling", "fulfilled", "cancelled"]), customer_id: z.string().optional(), warehouse_id: z.string(), total_amount: z.number(), payment_reference: z.string().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsPaginationMeta = z.object({count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsPayment = z.object({id: z.string(), invoice_id: z.string(), customer_id: z.string(), payment_reference: z.string().optional(), payment_method: z.enum(["card", "bank_transfer", "direct_debit", "cash", "cheque"]), amount: z.number(), payment_date: z.string(), is_confirmed: z.boolean(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsPaymentWithDetails = z.object({id: z.string(), invoice_id: z.string(), customer_id: z.string(), payment_reference: z.string().optional(), payment_method: z.enum(["card", "bank_transfer", "direct_debit", "cash", "cheque"]), amount: z.number(), payment_date: z.string(), is_confirmed: z.boolean(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string(), invoice: z.object({id: z.string(), invoice_number: z.string(), total_amount: z.number(), amount_paid: z.number()}).optional(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string()}).optional()});

export const modelsPaymentListResponse = z.object({data: z.array(modelsPaymentWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsPaymentMethod = z.enum(["card", "bank_transfer", "direct_debit", "cash", "cheque"]);

export const modelsProduct = z.object({id: z.string(), sku: z.string(), name: z.string(), description: z.string().optional(), unit_price: z.number(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsProductListResponse = z.object({data: z.array(modelsProduct), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsProperty = z.object({id: z.string(), customer_id: z.string(), address_line1: z.string(), address_line2: z.string().optional(), city: z.string(), postcode: z.string(), latitude: z.number().optional(), longitude: z.number().optional(), access_notes: z.string().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsPropertyWithDetails = z.object({id: z.string(), customer_id: z.string(), address_line1: z.string(), address_line2: z.string().optional(), city: z.string(), postcode: z.string(), latitude: z.number().optional(), longitude: z.number().optional(), access_notes: z.string().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string()}).optional()});

export const modelsPropertyListResponse = z.object({data: z.array(modelsPropertyWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsRoute = z.object({id: z.string(), operator_id: z.string(), vehicle_id: z.string().optional(), depot_id: z.string(), route_date: z.string(), status: z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]), estimated_distance_miles: z.number().optional(), actual_distance_miles: z.number().optional(), estimated_duration_minutes: z.number().int().optional(), actual_duration_minutes: z.number().int().optional(), started_at: z.string().optional(), completed_at: z.string().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsRouteStopWithDetails = z.object({id: z.string(), route_id: z.string(), lawn_id: z.string(), job_id: z.string().optional(), stop_order: z.number().int(), estimated_arrival: z.string().optional(), estimated_departure: z.string().optional(), actual_arrival: z.string().optional(), actual_departure: z.string().optional(), distance_from_previous_miles: z.number().optional(), created_at: z.string(), updated_at: z.string(), lawn: z.object({id: z.string(), address_line1: z.string(), postcode: z.string(), area_sqm: z.number(), latitude: z.number().optional(), longitude: z.number().optional(), access_notes: z.string().optional()}).optional(), customer: z.object({id: z.string(), first_name: z.string(), last_name: z.string(), phone: z.string().optional()}).optional()});

export const modelsRouteWithDetails = z.object({id: z.string(), operator_id: z.string(), vehicle_id: z.string().optional(), depot_id: z.string(), route_date: z.string(), status: z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]), estimated_distance_miles: z.number().optional(), actual_distance_miles: z.number().optional(), estimated_duration_minutes: z.number().int().optional(), actual_duration_minutes: z.number().int().optional(), started_at: z.string().optional(), completed_at: z.string().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string(), stops: z.array(modelsRouteStopWithDetails).optional(), operator: z.object({id: z.string(), employee_number: z.string(), first_name: z.string(), last_name: z.string(), phone: z.string()}).optional(), vehicle: z.object({id: z.string(), registration: z.string(), make: z.string().optional(), vehicle_model: z.string().optional()}).optional(), depot: z.object({id: z.string(), code: z.string(), name: z.string()}).optional()});

export const modelsRouteListResponse = z.object({data: z.array(modelsRouteWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsRouteStatus = z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]);

export const modelsRouteStop = z.object({id: z.string(), route_id: z.string(), lawn_id: z.string(), job_id: z.string().optional(), stop_order: z.number().int(), estimated_arrival: z.string().optional(), estimated_departure: z.string().optional(), actual_arrival: z.string().optional(), actual_departure: z.string().optional(), distance_from_previous_miles: z.number().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsSaga = z.object({id: z.string(), saga_type: z.string(), correlation_id: z.string(), status: z.enum(["started", "step_pending", "step_executing", "step_completed", "step_failed", "compensating", "compensation_completed", "completed", "failed"]), current_step: z.enum(["reserve_stock", "process_payment", "fulfill_order", "release_stock", "void_payment"]).optional(), payload: z.record(z.string(), z.unknown()), error_message: z.string().optional(), retry_count: z.number().int(), max_retries: z.number().int(), created_at: z.string(), updated_at: z.string(), completed_at: z.string().optional()});

export const modelsSagaEvent = z.object({id: z.string(), saga_id: z.string(), step_type: z.enum(["reserve_stock", "process_payment", "fulfill_order", "release_stock", "void_payment"]), event_type: z.string(), payload: z.record(z.string(), z.unknown()), created_at: z.string()});

export const modelsSagaStatus = z.enum(["started", "step_pending", "step_executing", "step_completed", "step_failed", "compensating", "compensation_completed", "completed", "failed"]);

export const modelsSagaStepType = z.enum(["reserve_stock", "process_payment", "fulfill_order", "release_stock", "void_payment"]);

export const modelsStockMovement = z.object({id: z.string(), correlation_id: z.string(), product_id: z.string(), warehouse_id: z.string(), movement_type: z.enum(["receive", "transfer_out", "transfer_in", "adjust", "reserve", "release", "fulfill"]), quantity: z.number().int(), reference_id: z.string().optional(), reference_type: z.string().optional(), notes: z.string().optional(), created_by: z.string().optional(), created_at: z.string()});

export const modelsStockMovementWithDetails = z.object({product: z.object({id: z.string(), sku: z.string(), name: z.string()}), warehouse: z.object({id: z.string(), code: z.string(), name: z.string()}), id: z.string(), correlation_id: z.string(), product_id: z.string(), warehouse_id: z.string(), movement_type: z.enum(["receive", "transfer_out", "transfer_in", "adjust", "reserve", "release", "fulfill"]), quantity: z.number().int(), reference_id: z.string().optional(), reference_type: z.string().optional(), notes: z.string().optional(), created_by: z.string().optional(), created_at: z.string()});

export const modelsStockMovementListResponse = z.object({data: z.array(modelsStockMovementWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsTimestamps = z.object({created_at: z.string(), updated_at: z.string()});

export const modelsTreatment = z.object({id: z.string(), code: z.string(), name: z.string(), description: z.string().optional(), season: z.enum(["spring_early", "spring_late", "summer", "autumn_early", "autumn_late"]).optional(), sequence_in_year: z.number().int().optional(), price_per_sqm: z.number(), min_price: z.number(), minutes_per_100sqm: z.number(), setup_minutes: z.number().int(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsTreatmentListResponse = z.object({data: z.array(modelsTreatment), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsTreatmentPlan = z.object({id: z.string(), lawn_id: z.string(), year: z.number().int(), status: z.enum(["active", "paused", "completed", "cancelled"]), total_estimated_price: z.number().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsTreatmentPlanItem = z.object({id: z.string(), treatment_plan_id: z.string(), treatment_id: z.string(), scheduled_week: z.string().optional(), window_start: z.string().optional(), window_end: z.string().optional(), price_snapshot: z.number(), is_completed: z.boolean(), completed_job_id: z.string().optional(), created_at: z.string(), updated_at: z.string()});

export const modelsTreatmentPlanItemWithDetails = z.object({id: z.string(), treatment_plan_id: z.string(), treatment_id: z.string(), scheduled_week: z.string().optional(), window_start: z.string().optional(), window_end: z.string().optional(), price_snapshot: z.number(), is_completed: z.boolean(), completed_job_id: z.string().optional(), created_at: z.string(), updated_at: z.string(), treatment: z.object({id: z.string(), code: z.string(), name: z.string()}).optional()});

export const modelsTreatmentPlanWithDetails = z.object({id: z.string(), lawn_id: z.string(), year: z.number().int(), status: z.enum(["active", "paused", "completed", "cancelled"]), total_estimated_price: z.number().optional(), notes: z.string().optional(), created_at: z.string(), updated_at: z.string(), items: z.array(modelsTreatmentPlanItemWithDetails).optional(), lawn: z.object({id: z.string(), address_line1: z.string(), postcode: z.string(), area_sqm: z.number()}).optional(), customer: z.object({id: z.string(), customer_number: z.string(), first_name: z.string(), last_name: z.string()}).optional()});

export const modelsTreatmentPlanListResponse = z.object({data: z.array(modelsTreatmentPlanWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsTreatmentPlanStatus = z.enum(["active", "paused", "completed", "cancelled"]);

export const modelsTreatmentProduct = z.object({id: z.string(), treatment_id: z.string(), product_id: z.string(), quantity_per_100sqm: z.number(), quantity_multiplier_poor: z.number(), created_at: z.string()});

export const modelsTreatmentSeason = z.enum(["spring_early", "spring_late", "summer", "autumn_early", "autumn_late"]);

export const modelsTreatmentWithProducts = z.object({id: z.string(), code: z.string(), name: z.string(), description: z.string().optional(), season: z.enum(["spring_early", "spring_late", "summer", "autumn_early", "autumn_late"]).optional(), sequence_in_year: z.number().int().optional(), price_per_sqm: z.number(), min_price: z.number(), minutes_per_100sqm: z.number(), setup_minutes: z.number().int(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string(), products: z.array(modelsTreatmentProduct).optional()});

export const modelsUpdateCustomerRequest = z.object({first_name: z.string().optional(), last_name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), phone_secondary: z.string().optional(), billing_address_line1: z.string().optional(), billing_address_line2: z.string().optional(), billing_city: z.string().optional(), billing_postcode: z.string().optional(), is_active: z.boolean().optional(), preferred_contact_method: z.string().optional(), marketing_consent: z.boolean().optional(), notes: z.string().optional()});

export const modelsUpdateInventoryRequest = z.object({quantity_available: z.number().int().optional(), quantity_reserved: z.number().int().optional(), reorder_point: z.number().int().optional(), reorder_quantity: z.number().int().optional()});

export const modelsUpdateInvoiceItemRequest = z.object({description: z.string().optional(), quantity: z.number().optional(), unit_price: z.number().optional()});

export const modelsUpdateInvoiceRequest = z.object({status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled", "refunded"]).optional(), due_date: z.string().optional(), vat_rate: z.number().optional(), payment_terms_days: z.number().int().optional(), notes: z.string().optional()});

export const modelsUpdateJobRequest = z.object({status: z.enum(["scheduled", "in_progress", "completed", "cancelled", "skipped", "rescheduled"]).optional(), started_at: z.string().optional(), completed_at: z.string().optional(), performed_by: z.string().optional(), lawn_condition_at_job: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), before_notes: z.string().optional(), after_notes: z.string().optional(), customer_signature_url: z.string().optional(), before_photos: z.array(z.string()).optional(), after_photos: z.array(z.string()).optional()});

export const modelsUpdateLawnRequest = z.object({name: z.string().optional(), area_sqm: z.number().optional(), lawn_condition: z.enum(["excellent", "good", "fair", "poor", "new"]).optional(), boundary: z.array(modelsCoordinate).optional(), access_notes: z.string().optional(), is_active: z.boolean().optional()});

export const modelsUpdateOperatorRequest = z.object({user_id: z.string().optional(), depot_id: z.string().optional(), first_name: z.string().optional(), last_name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), hourly_cost: z.number().optional(), is_active: z.boolean().optional()});

export const modelsUpdatePaymentRequest = z.object({payment_reference: z.string().optional(), payment_method: z.enum(["card", "bank_transfer", "direct_debit", "cash", "cheque"]).optional(), amount: z.number().optional(), payment_date: z.string().optional(), is_confirmed: z.boolean().optional(), notes: z.string().optional()});

export const modelsUpdateProductRequest = z.object({sku: z.string().optional(), name: z.string().optional(), description: z.string().optional(), unit_price: z.number().optional(), is_active: z.boolean().optional()});

export const modelsUpdatePropertyRequest = z.object({address_line1: z.string().optional(), address_line2: z.string().optional(), city: z.string().optional(), postcode: z.string().optional(), latitude: z.number().optional(), longitude: z.number().optional(), access_notes: z.string().optional(), is_active: z.boolean().optional()});

export const modelsUpdateRouteRequest = z.object({operator_id: z.string().optional(), vehicle_id: z.string().optional(), route_date: z.string().optional(), status: z.enum(["draft", "confirmed", "in_progress", "completed", "cancelled"]).optional(), estimated_distance_miles: z.number().optional(), actual_distance_miles: z.number().optional(), estimated_duration_minutes: z.number().int().optional(), actual_duration_minutes: z.number().int().optional(), started_at: z.string().optional(), completed_at: z.string().optional(), notes: z.string().optional()});

export const modelsUpdateRouteStopRequest = z.object({stop_order: z.number().int().optional(), estimated_arrival: z.string().optional(), estimated_departure: z.string().optional(), actual_arrival: z.string().optional(), actual_departure: z.string().optional(), distance_from_previous_miles: z.number().optional()});

export const modelsUpdateTreatmentPlanItemRequest = z.object({scheduled_week: z.string().optional(), window_start: z.string().optional(), window_end: z.string().optional(), price_snapshot: z.number().optional()});

export const modelsUpdateTreatmentPlanRequest = z.object({status: z.enum(["active", "paused", "completed", "cancelled"]).optional(), total_estimated_price: z.number().optional(), notes: z.string().optional()});

export const modelsUpdateTreatmentRequest = z.object({code: z.string().optional(), name: z.string().optional(), description: z.string().optional(), season: z.enum(["spring_early", "spring_late", "summer", "autumn_early", "autumn_late"]).optional(), sequence_in_year: z.number().int().optional(), price_per_sqm: z.number().optional(), min_price: z.number().optional(), minutes_per_100sqm: z.number().optional(), setup_minutes: z.number().int().optional(), is_active: z.boolean().optional()});

export const modelsUpdateVehicleRequest = z.object({depot_id: z.string().optional(), registration: z.string().optional(), make: z.string().optional(), vehicle_model: z.string().optional(), cost_per_mile: z.number().optional(), load_capacity_kg: z.number().optional(), is_active: z.boolean().optional()});

export const modelsUpdateWarehouseRequest = z.object({code: z.string().optional(), name: z.string().optional(), address: z.string().optional(), is_active: z.boolean().optional()});

export const modelsVehicle = z.object({id: z.string(), depot_id: z.string(), registration: z.string(), make: z.string().optional(), vehicle_model: z.string().optional(), cost_per_mile: z.number().optional(), load_capacity_kg: z.number().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsVehicleWithDetails = z.object({id: z.string(), depot_id: z.string(), registration: z.string(), make: z.string().optional(), vehicle_model: z.string().optional(), cost_per_mile: z.number().optional(), load_capacity_kg: z.number().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string(), depot: z.object({id: z.string(), code: z.string(), name: z.string()}).optional()});

export const modelsVehicleListResponse = z.object({data: z.array(modelsVehicleWithDetails), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export const modelsWarehouse = z.object({id: z.string(), code: z.string(), name: z.string(), address: z.string().optional(), is_active: z.boolean(), created_at: z.string(), updated_at: z.string()});

export const modelsWarehouseListResponse = z.object({data: z.array(modelsWarehouse), count: z.number().int(), limit: z.number().int(), offset: z.number().int()});

export type ModelsCoordinate = {latitude: number, longitude: number};

export type ModelsCreateCustomerRequest = {first_name: string, last_name: string, email?: string | undefined, phone?: string | undefined, phone_secondary?: string | undefined, billing_address_line1?: string | undefined, billing_address_line2?: string | undefined, billing_city?: string | undefined, billing_postcode?: string | undefined, is_active?: boolean | undefined, preferred_contact_method?: string | undefined, marketing_consent?: boolean | undefined, notes?: string | undefined};

export type ModelsCreateInventoryRequest = {product_id: string, warehouse_id: string, quantity_available?: number | undefined, reorder_point?: number | undefined, reorder_quantity?: number | undefined};

export type ModelsCreateInvoiceItemRequest = {job_id?: string | undefined, description: string, quantity: number, unit_price: number};

export type ModelsCreateInvoiceRequest = {customer_id: string, status?: ('draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded') | undefined, issue_date?: string | undefined, due_date: string, vat_rate?: number | undefined, payment_terms_days?: number | undefined, notes?: string | undefined};

export type ModelsCreateJobConsumptionRequest = {job_treatment_id: string, product_id: string, warehouse_id: string, quantity_consumed: number};

export type ModelsCreateJobRequest = {lawn_id: string, route_stop_id?: string | undefined, treatment_plan_item_id?: string | undefined, status?: ('scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled') | undefined, scheduled_date: string, lawn_area_sqm: number, lawn_condition_at_job?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, before_notes?: string | undefined};

export type ModelsCreateJobTreatmentRequest = {treatment_id: string, price_charged: number, duration_minutes?: number | undefined};

export type ModelsCreateLawnRequest = {property_id: string, name: string, area_sqm: number, lawn_condition?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, boundary?: Array<ModelsCoordinate> | undefined, access_notes?: string | undefined, is_active?: boolean | undefined};

export type ModelsCreateOperatorRequest = {user_id?: string | undefined, depot_id: string, first_name: string, last_name: string, email?: string | undefined, phone: string, hourly_cost: number, is_active?: boolean | undefined};

export type ModelsCreateOrderItemRequest = {product_id: string, quantity: number, unit_price: number};

export type ModelsCreateOrderRequest = {customer_id?: string | undefined, warehouse_id: string, notes?: string | undefined, items: Array<ModelsCreateOrderItemRequest>};

export type ModelsOrderItem = {id: string, order_id: string, product_id: string, quantity: number, unit_price: number, created_at: string};

export type ModelsCreateOrderResponse = {items: Array<ModelsOrderItem>, message: string, id: string, order_number: string, status: 'pending' | 'reserved' | 'payment_processing' | 'payment_failed' | 'paid' | 'fulfilling' | 'fulfilled' | 'cancelled', customer_id?: string | undefined, warehouse_id: string, total_amount: number, payment_reference?: string | undefined, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsCreatePaymentRequest = {invoice_id: string, customer_id: string, payment_reference?: string | undefined, payment_method: 'card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque', amount: number, payment_date?: string | undefined, is_confirmed?: boolean | undefined, notes?: string | undefined};

export type ModelsCreateProductRequest = {sku: string, name: string, description?: string | undefined, unit_price: number, is_active?: boolean | undefined};

export type ModelsCreatePropertyRequest = {customer_id: string, address_line1: string, address_line2?: string | undefined, city: string, postcode: string, latitude?: number | undefined, longitude?: number | undefined, access_notes?: string | undefined, is_active?: boolean | undefined};

export type ModelsCreateRouteRequest = {operator_id: string, vehicle_id?: string | undefined, depot_id: string, route_date: string, status?: ('draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled') | undefined, notes?: string | undefined};

export type ModelsCreateRouteStopRequest = {lawn_id: string, stop_order: number, estimated_arrival?: string | undefined, estimated_departure?: string | undefined, distance_from_previous_miles?: number | undefined};

export type ModelsCreateStockMovementRequest = {correlation_id?: string | undefined, product_id: string, warehouse_id: string, movement_type: 'receive' | 'transfer_out' | 'transfer_in' | 'adjust' | 'reserve' | 'release' | 'fulfill', quantity: number, reference_id?: string | undefined, reference_type?: string | undefined, notes?: string | undefined};

export type ModelsCreateTreatmentPlanItemRequest = {treatment_id: string, scheduled_week?: string | undefined, window_start?: string | undefined, window_end?: string | undefined, price_snapshot: number};

export type ModelsCreateTreatmentPlanRequest = {lawn_id: string, year: number, status?: ('active' | 'paused' | 'completed' | 'cancelled') | undefined, total_estimated_price?: number | undefined, notes?: string | undefined};

export type ModelsCreateTreatmentProductRequest = {product_id: string, quantity_per_100sqm: number, quantity_multiplier_poor?: number | undefined};

export type ModelsCreateTreatmentRequest = {code: string, name: string, description?: string | undefined, season?: ('spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late') | undefined, sequence_in_year?: number | undefined, price_per_sqm: number, min_price?: number | undefined, minutes_per_100sqm: number, setup_minutes?: number | undefined, is_active?: boolean | undefined};

export type ModelsCreateVehicleRequest = {depot_id: string, registration: string, make?: string | undefined, vehicle_model?: string | undefined, cost_per_mile?: number | undefined, load_capacity_kg?: number | undefined, is_active?: boolean | undefined};

export type ModelsCreateWarehouseRequest = {code: string, name: string, address?: string | undefined, is_active?: boolean | undefined};

export type ModelsCustomer = {id: string, customer_number: string, first_name: string, last_name: string, email?: string | undefined, phone?: string | undefined, phone_secondary?: string | undefined, billing_address_line1?: string | undefined, billing_address_line2?: string | undefined, billing_city?: string | undefined, billing_postcode?: string | undefined, is_active: boolean, preferred_contact_method?: string | undefined, marketing_consent: boolean, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsCustomerListResponse = {data: Array<ModelsCustomer>, count: number, limit: number, offset: number};

export type ModelsErrorResponse = {error: string};

export type ModelsInventoryLevel = {id: string, product_id: string, warehouse_id: string, quantity_available: number, quantity_reserved: number, reorder_point: number, reorder_quantity: number, created_at: string, updated_at: string};

export type ModelsInventoryWithDetails = {product: {id: string, sku: string, name: string}, warehouse: {id: string, code: string, name: string}, id: string, product_id: string, warehouse_id: string, quantity_available: number, quantity_reserved: number, reorder_point: number, reorder_quantity: number, created_at: string, updated_at: string};

export type ModelsInventoryListResponse = {data: Array<ModelsInventoryWithDetails>, count: number, limit: number, offset: number};

export type ModelsInvoice = {id: string, customer_id: string, invoice_number: string, status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded', issue_date: string, due_date: string, subtotal: number, vat_rate: number, vat_amount: number, total_amount: number, amount_paid: number, payment_terms_days: number, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsInvoiceItem = {id: string, invoice_id: string, job_id?: string | undefined, description: string, quantity: number, unit_price: number, line_total: number, created_at: string};

export type ModelsInvoiceItemWithDetails = {id: string, invoice_id: string, job_id?: string | undefined, description: string, quantity: number, unit_price: number, line_total: number, created_at: string, job?: {id: string, job_number: string, scheduled_date: string} | undefined};

export type ModelsInvoiceWithDetails = {id: string, customer_id: string, invoice_number: string, status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded', issue_date: string, due_date: string, subtotal: number, vat_rate: number, vat_amount: number, total_amount: number, amount_paid: number, payment_terms_days: number, notes?: string | undefined, created_at: string, updated_at: string, items?: Array<ModelsInvoiceItemWithDetails> | undefined, customer?: ({id: string, customer_number: string, first_name: string, last_name: string, email?: string | undefined, billing_address_line1?: string | undefined, billing_postcode?: string | undefined}) | undefined, amount_outstanding?: number | undefined};

export type ModelsInvoiceListResponse = {data: Array<ModelsInvoiceWithDetails>, count: number, limit: number, offset: number};

export type ModelsInvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';

export type ModelsJob = {id: string, lawn_id: string, route_stop_id?: string | undefined, treatment_plan_item_id?: string | undefined, job_number: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled', scheduled_date: string, started_at?: string | undefined, completed_at?: string | undefined, performed_by?: string | undefined, lawn_area_sqm: number, lawn_condition_at_job?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, before_notes?: string | undefined, after_notes?: string | undefined, customer_signature_url?: string | undefined, before_photos?: Array<string> | undefined, after_photos?: Array<string> | undefined, created_at: string, updated_at: string};

export type ModelsJobConsumption = {id: string, job_id: string, job_treatment_id: string, product_id: string, warehouse_id: string, quantity_consumed: number, stock_movement_id?: string | undefined, created_at: string};

export type ModelsJobTreatmentWithDetails = {id: string, job_id: string, treatment_id: string, price_charged: number, duration_minutes?: number | undefined, created_at: string, treatment?: {id: string, code: string, name: string} | undefined, consumptions?: Array<ModelsJobConsumption> | undefined};

export type ModelsJobWithDetails = {id: string, lawn_id: string, route_stop_id?: string | undefined, treatment_plan_item_id?: string | undefined, job_number: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled', scheduled_date: string, started_at?: string | undefined, completed_at?: string | undefined, performed_by?: string | undefined, lawn_area_sqm: number, lawn_condition_at_job?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, before_notes?: string | undefined, after_notes?: string | undefined, customer_signature_url?: string | undefined, before_photos?: Array<string> | undefined, after_photos?: Array<string> | undefined, created_at: string, updated_at: string, treatments?: Array<ModelsJobTreatmentWithDetails> | undefined, lawn?: {id: string, address_line1: string, postcode: string} | undefined, customer?: {id: string, customer_number: string, first_name: string, last_name: string} | undefined, operator?: {id: string, employee_number: string, first_name: string, last_name: string} | undefined};

export type ModelsJobListResponse = {data: Array<ModelsJobWithDetails>, count: number, limit: number, offset: number};

export type ModelsJobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled';

export type ModelsJobTreatment = {id: string, job_id: string, treatment_id: string, price_charged: number, duration_minutes?: number | undefined, created_at: string};

export type ModelsLawn = {id: string, property_id: string, name: string, area_sqm: number, lawn_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'new', boundary?: Array<ModelsCoordinate> | undefined, access_notes?: string | undefined, is_active: boolean, created_at: string, updated_at: string};

export type ModelsLawnCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'new';

export type ModelsLawnWithDetails = {id: string, property_id: string, name: string, area_sqm: number, lawn_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'new', boundary?: Array<ModelsCoordinate> | undefined, access_notes?: string | undefined, is_active: boolean, created_at: string, updated_at: string, property?: ({id: string, address_line1: string, postcode: string, latitude?: number | undefined, longitude?: number | undefined}) | undefined, customer?: {id: string, customer_number: string, first_name: string, last_name: string} | undefined};

export type ModelsLawnListResponse = {data: Array<ModelsLawnWithDetails>, count: number, limit: number, offset: number};

export type ModelsMovementType = 'receive' | 'transfer_out' | 'transfer_in' | 'adjust' | 'reserve' | 'release' | 'fulfill';

export type ModelsOperator = {id: string, user_id?: string | undefined, depot_id: string, employee_number: string, first_name: string, last_name: string, email?: string | undefined, phone: string, hourly_cost: number, is_active: boolean, created_at: string, updated_at: string};

export type ModelsOperatorWithDetails = {id: string, user_id?: string | undefined, depot_id: string, employee_number: string, first_name: string, last_name: string, email?: string | undefined, phone: string, hourly_cost: number, is_active: boolean, created_at: string, updated_at: string, depot?: {id: string, code: string, name: string} | undefined};

export type ModelsOperatorListResponse = {data: Array<ModelsOperatorWithDetails>, count: number, limit: number, offset: number};

export type ModelsOrder = {id: string, order_number: string, status: 'pending' | 'reserved' | 'payment_processing' | 'payment_failed' | 'paid' | 'fulfilling' | 'fulfilled' | 'cancelled', customer_id?: string | undefined, warehouse_id: string, total_amount: number, payment_reference?: string | undefined, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsOrderListResponse = {data: Array<ModelsOrder>, count: number, limit: number, offset: number};

export type ModelsOrderStatus = 'pending' | 'reserved' | 'payment_processing' | 'payment_failed' | 'paid' | 'fulfilling' | 'fulfilled' | 'cancelled';

export type ModelsOrderWithDetails = {items: Array<ModelsOrderItem>, warehouse: {id: string, code: string, name: string}, saga?: ({id: string, status: string, current_step?: string | undefined, error_message?: string | undefined, created_at: string, completed_at?: string | undefined}) | undefined, id: string, order_number: string, status: 'pending' | 'reserved' | 'payment_processing' | 'payment_failed' | 'paid' | 'fulfilling' | 'fulfilled' | 'cancelled', customer_id?: string | undefined, warehouse_id: string, total_amount: number, payment_reference?: string | undefined, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsPaginationMeta = {count: number, limit: number, offset: number};

export type ModelsPayment = {id: string, invoice_id: string, customer_id: string, payment_reference?: string | undefined, payment_method: 'card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque', amount: number, payment_date: string, is_confirmed: boolean, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsPaymentWithDetails = {id: string, invoice_id: string, customer_id: string, payment_reference?: string | undefined, payment_method: 'card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque', amount: number, payment_date: string, is_confirmed: boolean, notes?: string | undefined, created_at: string, updated_at: string, invoice?: {id: string, invoice_number: string, total_amount: number, amount_paid: number} | undefined, customer?: {id: string, customer_number: string, first_name: string, last_name: string} | undefined};

export type ModelsPaymentListResponse = {data: Array<ModelsPaymentWithDetails>, count: number, limit: number, offset: number};

export type ModelsPaymentMethod = 'card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque';

export type ModelsProduct = {id: string, sku: string, name: string, description?: string | undefined, unit_price: number, is_active: boolean, created_at: string, updated_at: string};

export type ModelsProductListResponse = {data: Array<ModelsProduct>, count: number, limit: number, offset: number};

export type ModelsProperty = {id: string, customer_id: string, address_line1: string, address_line2?: string | undefined, city: string, postcode: string, latitude?: number | undefined, longitude?: number | undefined, access_notes?: string | undefined, is_active: boolean, created_at: string, updated_at: string};

export type ModelsPropertyWithDetails = {id: string, customer_id: string, address_line1: string, address_line2?: string | undefined, city: string, postcode: string, latitude?: number | undefined, longitude?: number | undefined, access_notes?: string | undefined, is_active: boolean, created_at: string, updated_at: string, customer?: {id: string, customer_number: string, first_name: string, last_name: string} | undefined};

export type ModelsPropertyListResponse = {data: Array<ModelsPropertyWithDetails>, count: number, limit: number, offset: number};

export type ModelsRoute = {id: string, operator_id: string, vehicle_id?: string | undefined, depot_id: string, route_date: string, status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled', estimated_distance_miles?: number | undefined, actual_distance_miles?: number | undefined, estimated_duration_minutes?: number | undefined, actual_duration_minutes?: number | undefined, started_at?: string | undefined, completed_at?: string | undefined, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsRouteStopWithDetails = {id: string, route_id: string, lawn_id: string, job_id?: string | undefined, stop_order: number, estimated_arrival?: string | undefined, estimated_departure?: string | undefined, actual_arrival?: string | undefined, actual_departure?: string | undefined, distance_from_previous_miles?: number | undefined, created_at: string, updated_at: string, lawn?: ({id: string, address_line1: string, postcode: string, area_sqm: number, latitude?: number | undefined, longitude?: number | undefined, access_notes?: string | undefined}) | undefined, customer?: ({id: string, first_name: string, last_name: string, phone?: string | undefined}) | undefined};

export type ModelsRouteWithDetails = {id: string, operator_id: string, vehicle_id?: string | undefined, depot_id: string, route_date: string, status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled', estimated_distance_miles?: number | undefined, actual_distance_miles?: number | undefined, estimated_duration_minutes?: number | undefined, actual_duration_minutes?: number | undefined, started_at?: string | undefined, completed_at?: string | undefined, notes?: string | undefined, created_at: string, updated_at: string, stops?: Array<ModelsRouteStopWithDetails> | undefined, operator?: {id: string, employee_number: string, first_name: string, last_name: string, phone: string} | undefined, vehicle?: ({id: string, registration: string, make?: string | undefined, vehicle_model?: string | undefined}) | undefined, depot?: {id: string, code: string, name: string} | undefined};

export type ModelsRouteListResponse = {data: Array<ModelsRouteWithDetails>, count: number, limit: number, offset: number};

export type ModelsRouteStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type ModelsRouteStop = {id: string, route_id: string, lawn_id: string, job_id?: string | undefined, stop_order: number, estimated_arrival?: string | undefined, estimated_departure?: string | undefined, actual_arrival?: string | undefined, actual_departure?: string | undefined, distance_from_previous_miles?: number | undefined, created_at: string, updated_at: string};

export type ModelsSaga = {id: string, saga_type: string, correlation_id: string, status: 'started' | 'step_pending' | 'step_executing' | 'step_completed' | 'step_failed' | 'compensating' | 'compensation_completed' | 'completed' | 'failed', current_step?: ('reserve_stock' | 'process_payment' | 'fulfill_order' | 'release_stock' | 'void_payment') | undefined, payload: Record<string, unknown>, error_message?: string | undefined, retry_count: number, max_retries: number, created_at: string, updated_at: string, completed_at?: string | undefined};

export type ModelsSagaEvent = {id: string, saga_id: string, step_type: 'reserve_stock' | 'process_payment' | 'fulfill_order' | 'release_stock' | 'void_payment', event_type: string, payload: Record<string, unknown>, created_at: string};

export type ModelsSagaStatus = 'started' | 'step_pending' | 'step_executing' | 'step_completed' | 'step_failed' | 'compensating' | 'compensation_completed' | 'completed' | 'failed';

export type ModelsSagaStepType = 'reserve_stock' | 'process_payment' | 'fulfill_order' | 'release_stock' | 'void_payment';

export type ModelsStockMovement = {id: string, correlation_id: string, product_id: string, warehouse_id: string, movement_type: 'receive' | 'transfer_out' | 'transfer_in' | 'adjust' | 'reserve' | 'release' | 'fulfill', quantity: number, reference_id?: string | undefined, reference_type?: string | undefined, notes?: string | undefined, created_by?: string | undefined, created_at: string};

export type ModelsStockMovementWithDetails = {product: {id: string, sku: string, name: string}, warehouse: {id: string, code: string, name: string}, id: string, correlation_id: string, product_id: string, warehouse_id: string, movement_type: 'receive' | 'transfer_out' | 'transfer_in' | 'adjust' | 'reserve' | 'release' | 'fulfill', quantity: number, reference_id?: string | undefined, reference_type?: string | undefined, notes?: string | undefined, created_by?: string | undefined, created_at: string};

export type ModelsStockMovementListResponse = {data: Array<ModelsStockMovementWithDetails>, count: number, limit: number, offset: number};

export type ModelsTimestamps = {created_at: string, updated_at: string};

export type ModelsTreatment = {id: string, code: string, name: string, description?: string | undefined, season?: ('spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late') | undefined, sequence_in_year?: number | undefined, price_per_sqm: number, min_price: number, minutes_per_100sqm: number, setup_minutes: number, is_active: boolean, created_at: string, updated_at: string};

export type ModelsTreatmentListResponse = {data: Array<ModelsTreatment>, count: number, limit: number, offset: number};

export type ModelsTreatmentPlan = {id: string, lawn_id: string, year: number, status: 'active' | 'paused' | 'completed' | 'cancelled', total_estimated_price?: number | undefined, notes?: string | undefined, created_at: string, updated_at: string};

export type ModelsTreatmentPlanItem = {id: string, treatment_plan_id: string, treatment_id: string, scheduled_week?: string | undefined, window_start?: string | undefined, window_end?: string | undefined, price_snapshot: number, is_completed: boolean, completed_job_id?: string | undefined, created_at: string, updated_at: string};

export type ModelsTreatmentPlanItemWithDetails = {id: string, treatment_plan_id: string, treatment_id: string, scheduled_week?: string | undefined, window_start?: string | undefined, window_end?: string | undefined, price_snapshot: number, is_completed: boolean, completed_job_id?: string | undefined, created_at: string, updated_at: string, treatment?: {id: string, code: string, name: string} | undefined};

export type ModelsTreatmentPlanWithDetails = {id: string, lawn_id: string, year: number, status: 'active' | 'paused' | 'completed' | 'cancelled', total_estimated_price?: number | undefined, notes?: string | undefined, created_at: string, updated_at: string, items?: Array<ModelsTreatmentPlanItemWithDetails> | undefined, lawn?: {id: string, address_line1: string, postcode: string, area_sqm: number} | undefined, customer?: {id: string, customer_number: string, first_name: string, last_name: string} | undefined};

export type ModelsTreatmentPlanListResponse = {data: Array<ModelsTreatmentPlanWithDetails>, count: number, limit: number, offset: number};

export type ModelsTreatmentPlanStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export type ModelsTreatmentProduct = {id: string, treatment_id: string, product_id: string, quantity_per_100sqm: number, quantity_multiplier_poor: number, created_at: string};

export type ModelsTreatmentSeason = 'spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late';

export type ModelsTreatmentWithProducts = {id: string, code: string, name: string, description?: string | undefined, season?: ('spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late') | undefined, sequence_in_year?: number | undefined, price_per_sqm: number, min_price: number, minutes_per_100sqm: number, setup_minutes: number, is_active: boolean, created_at: string, updated_at: string, products?: Array<ModelsTreatmentProduct> | undefined};

export type ModelsUpdateCustomerRequest = {first_name?: string | undefined, last_name?: string | undefined, email?: string | undefined, phone?: string | undefined, phone_secondary?: string | undefined, billing_address_line1?: string | undefined, billing_address_line2?: string | undefined, billing_city?: string | undefined, billing_postcode?: string | undefined, is_active?: boolean | undefined, preferred_contact_method?: string | undefined, marketing_consent?: boolean | undefined, notes?: string | undefined};

export type ModelsUpdateInventoryRequest = {quantity_available?: number | undefined, quantity_reserved?: number | undefined, reorder_point?: number | undefined, reorder_quantity?: number | undefined};

export type ModelsUpdateInvoiceItemRequest = {description?: string | undefined, quantity?: number | undefined, unit_price?: number | undefined};

export type ModelsUpdateInvoiceRequest = {status?: ('draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded') | undefined, due_date?: string | undefined, vat_rate?: number | undefined, payment_terms_days?: number | undefined, notes?: string | undefined};

export type ModelsUpdateJobRequest = {status?: ('scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled') | undefined, started_at?: string | undefined, completed_at?: string | undefined, performed_by?: string | undefined, lawn_condition_at_job?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, before_notes?: string | undefined, after_notes?: string | undefined, customer_signature_url?: string | undefined, before_photos?: Array<string> | undefined, after_photos?: Array<string> | undefined};

export type ModelsUpdateLawnRequest = {name?: string | undefined, area_sqm?: number | undefined, lawn_condition?: ('excellent' | 'good' | 'fair' | 'poor' | 'new') | undefined, boundary?: Array<ModelsCoordinate> | undefined, access_notes?: string | undefined, is_active?: boolean | undefined};

export type ModelsUpdateOperatorRequest = {user_id?: string | undefined, depot_id?: string | undefined, first_name?: string | undefined, last_name?: string | undefined, email?: string | undefined, phone?: string | undefined, hourly_cost?: number | undefined, is_active?: boolean | undefined};

export type ModelsUpdatePaymentRequest = {payment_reference?: string | undefined, payment_method?: ('card' | 'bank_transfer' | 'direct_debit' | 'cash' | 'cheque') | undefined, amount?: number | undefined, payment_date?: string | undefined, is_confirmed?: boolean | undefined, notes?: string | undefined};

export type ModelsUpdateProductRequest = {sku?: string | undefined, name?: string | undefined, description?: string | undefined, unit_price?: number | undefined, is_active?: boolean | undefined};

export type ModelsUpdatePropertyRequest = {address_line1?: string | undefined, address_line2?: string | undefined, city?: string | undefined, postcode?: string | undefined, latitude?: number | undefined, longitude?: number | undefined, access_notes?: string | undefined, is_active?: boolean | undefined};

export type ModelsUpdateRouteRequest = {operator_id?: string | undefined, vehicle_id?: string | undefined, route_date?: string | undefined, status?: ('draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled') | undefined, estimated_distance_miles?: number | undefined, actual_distance_miles?: number | undefined, estimated_duration_minutes?: number | undefined, actual_duration_minutes?: number | undefined, started_at?: string | undefined, completed_at?: string | undefined, notes?: string | undefined};

export type ModelsUpdateRouteStopRequest = {stop_order?: number | undefined, estimated_arrival?: string | undefined, estimated_departure?: string | undefined, actual_arrival?: string | undefined, actual_departure?: string | undefined, distance_from_previous_miles?: number | undefined};

export type ModelsUpdateTreatmentPlanItemRequest = {scheduled_week?: string | undefined, window_start?: string | undefined, window_end?: string | undefined, price_snapshot?: number | undefined};

export type ModelsUpdateTreatmentPlanRequest = {status?: ('active' | 'paused' | 'completed' | 'cancelled') | undefined, total_estimated_price?: number | undefined, notes?: string | undefined};

export type ModelsUpdateTreatmentRequest = {code?: string | undefined, name?: string | undefined, description?: string | undefined, season?: ('spring_early' | 'spring_late' | 'summer' | 'autumn_early' | 'autumn_late') | undefined, sequence_in_year?: number | undefined, price_per_sqm?: number | undefined, min_price?: number | undefined, minutes_per_100sqm?: number | undefined, setup_minutes?: number | undefined, is_active?: boolean | undefined};

export type ModelsUpdateVehicleRequest = {depot_id?: string | undefined, registration?: string | undefined, make?: string | undefined, vehicle_model?: string | undefined, cost_per_mile?: number | undefined, load_capacity_kg?: number | undefined, is_active?: boolean | undefined};

export type ModelsUpdateWarehouseRequest = {code?: string | undefined, name?: string | undefined, address?: string | undefined, is_active?: boolean | undefined};

export type ModelsVehicle = {id: string, depot_id: string, registration: string, make?: string | undefined, vehicle_model?: string | undefined, cost_per_mile?: number | undefined, load_capacity_kg?: number | undefined, is_active: boolean, created_at: string, updated_at: string};

export type ModelsVehicleWithDetails = {id: string, depot_id: string, registration: string, make?: string | undefined, vehicle_model?: string | undefined, cost_per_mile?: number | undefined, load_capacity_kg?: number | undefined, is_active: boolean, created_at: string, updated_at: string, depot?: {id: string, code: string, name: string} | undefined};

export type ModelsVehicleListResponse = {data: Array<ModelsVehicleWithDetails>, count: number, limit: number, offset: number};

export type ModelsWarehouse = {id: string, code: string, name: string, address?: string | undefined, is_active: boolean, created_at: string, updated_at: string};

export type ModelsWarehouseListResponse = {data: Array<ModelsWarehouse>, count: number, limit: number, offset: number};
