// Route and Job status types
export type RouteStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'skipped' | 'rescheduled';
export type LawnCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'new';

// Operator type
export type Operator = {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
};

// Property with location
export type PropertyWithLocation = {
  id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  latitude: number | null;
  longitude: number | null;
};

// Customer summary
export type CustomerSummary = {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
};

// Lawn with property and customer
export type LawnWithProperty = {
  id: string;
  name: string;
  area_sqm: number;
  property: PropertyWithLocation & {
    customer: CustomerSummary;
  };
};

// Route with relations (list view)
export type RouteWithRelations = {
  id: string;
  operator_id: string;
  depot_id: string;
  vehicle_id: string | null;
  route_date: string;
  status: RouteStatus;
  estimated_duration_minutes: number | null;
  actual_duration_minutes: number | null;
  estimated_distance_miles: number | null;
  actual_distance_miles: number | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  operator: Operator;
  depot: {
    id: string;
    code: string;
    name: string;
  };
  vehicle: {
    id: string;
    registration: string;
    make: string | null;
    vehicle_model: string | null;
  } | null;
};

// Route stop with location data
export type RouteStopWithLocation = {
  id: string;
  route_id: string;
  stop_order: number;
  estimated_arrival: string | null;
  estimated_departure: string | null;
  actual_arrival: string | null;
  actual_departure: string | null;
  distance_from_previous_miles: number | null;
  created_at: string;
  lawn: {
    id: string;
    name: string;
    area_sqm: number;
    property: PropertyWithLocation;
  };
  job: {
    id: string;
    job_number: string;
    status: JobStatus;
  } | null;
};

// Route detail with stops (single route view)
export type RouteDetailWithStops = RouteWithRelations & {
  stops: RouteStopWithLocation[];
};

// Job with relations
export type JobWithRelations = {
  id: string;
  job_number: string;
  lawn_id: string;
  performed_by: string | null;
  route_stop_id: string | null;
  treatment_plan_item_id: string | null;
  scheduled_date: string;
  lawn_area_sqm: number;
  status: JobStatus;
  lawn_condition_at_job: LawnCondition | null;
  before_notes: string | null;
  after_notes: string | null;
  customer_signature_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  lawn: LawnWithProperty;
  operator: Operator | null;
};

// Schedule status calculation types
export type ScheduleStatusType = 'not_started' | 'on_time' | 'ahead' | 'behind' | 'completed';

export type StopScheduleStatus = {
  stopId: string;
  isCompleted: boolean;
  minutesAheadBehind: number; // negative = behind, positive = ahead
  status: ScheduleStatusType;
};

export type RouteScheduleStatus = {
  routeId: string;
  completedStops: number;
  totalStops: number;
  percentComplete: number;
  overallMinutesAheadBehind: number;
  status: ScheduleStatusType;
};

// Calendar event for unified display
export type CalendarEventType = 'job' | 'route';

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  date: string;
  title: string;
  subtitle: string;
  status: string;
  statusColor: string;
  operator?: Operator | null;
  location?: string;
};

// Status colors mapping
export const routeStatusColors: Record<RouteStatus, string> = {
  draft: '#9ca3af',      // gray
  confirmed: '#3b82f6',  // blue
  in_progress: '#f59e0b', // amber
  completed: '#22c55e',  // green
  cancelled: '#ef4444',  // red
};

export const jobStatusColors: Record<JobStatus, string> = {
  scheduled: '#3b82f6',   // blue
  in_progress: '#f59e0b', // amber
  completed: '#22c55e',   // green
  cancelled: '#ef4444',   // red
  skipped: '#9ca3af',     // gray
  rescheduled: '#8b5cf6', // purple
};
