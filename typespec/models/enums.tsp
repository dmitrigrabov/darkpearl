namespace DarkPearl.Models;

@doc("Treatment season/timing")
enum TreatmentSeason {
  spring_early: "spring_early",
  spring_late: "spring_late",
  summer: "summer",
  autumn_early: "autumn_early",
  autumn_late: "autumn_late",
}

@doc("Job execution status")
enum JobStatus {
  scheduled: "scheduled",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
  skipped: "skipped",
  rescheduled: "rescheduled",
}

@doc("Treatment plan status")
enum TreatmentPlanStatus {
  active: "active",
  paused: "paused",
  completed: "completed",
  cancelled: "cancelled",
}

@doc("Route execution status")
enum RouteStatus {
  draft: "draft",
  confirmed: "confirmed",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
}

@doc("Invoice status")
enum InvoiceStatus {
  draft: "draft",
  sent: "sent",
  paid: "paid",
  partial: "partial",
  overdue: "overdue",
  cancelled: "cancelled",
  refunded: "refunded",
}

@doc("Payment method")
enum PaymentMethod {
  card: "card",
  bank_transfer: "bank_transfer",
  direct_debit: "direct_debit",
  cash: "cash",
  cheque: "cheque",
}

@doc("Lawn condition assessment")
enum LawnCondition {
  excellent: "excellent",
  good: "good",
  fair: "fair",
  poor: "poor",
  new: "new",
}
