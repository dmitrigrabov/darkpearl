export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      customers: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_postcode: string | null
          created_at: string
          created_by: string | null
          customer_number: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          marketing_consent: boolean
          notes: string | null
          phone: string | null
          phone_secondary: string | null
          preferred_contact_method: string | null
          updated_at: string
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_postcode?: string | null
          created_at?: string
          created_by?: string | null
          customer_number: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          marketing_consent?: boolean
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_postcode?: string | null
          created_at?: string
          created_by?: string | null
          customer_number?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          marketing_consent?: boolean
          notes?: string | null
          phone?: string | null
          phone_secondary?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          product_id: string
          quantity_available: number
          quantity_reserved: number
          reorder_point: number
          reorder_quantity: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_id: string
          quantity_available?: number
          quantity_reserved?: number
          reorder_point?: number
          reorder_quantity?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          product_id?: string
          quantity_available?: number
          quantity_reserved?: number
          reorder_point?: number
          reorder_quantity?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          job_id: string | null
          line_total: number
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          job_id?: string | null
          line_total: number
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          job_id?: string | null
          line_total?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          created_by: string | null
          customer_id: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_terms_days: number | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          vat_amount: number
          vat_rate: number | null
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_terms_days?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_terms_days?: number | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_consumptions: {
        Row: {
          created_at: string
          id: string
          job_id: string
          job_treatment_id: string
          product_id: string
          quantity_consumed: number
          stock_movement_id: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          job_treatment_id: string
          product_id: string
          quantity_consumed: number
          stock_movement_id?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          job_treatment_id?: string
          product_id?: string
          quantity_consumed?: number
          stock_movement_id?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_consumptions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_consumptions_job_treatment_id_fkey"
            columns: ["job_treatment_id"]
            isOneToOne: false
            referencedRelation: "job_treatments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_consumptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_consumptions_stock_movement_id_fkey"
            columns: ["stock_movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_consumptions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      job_treatments: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          job_id: string
          price_charged: number
          treatment_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id: string
          price_charged: number
          treatment_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          job_id?: string
          price_charged?: number
          treatment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_treatments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_treatments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          after_notes: string | null
          after_photos: Json | null
          before_notes: string | null
          before_photos: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_signature_url: string | null
          id: string
          job_number: string
          lawn_area_sqm: number
          lawn_condition_at_job:
            | Database["public"]["Enums"]["lawn_condition"]
            | null
          lawn_id: string
          performed_by: string | null
          route_stop_id: string | null
          scheduled_date: string
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          treatment_plan_item_id: string | null
          updated_at: string
        }
        Insert: {
          after_notes?: string | null
          after_photos?: Json | null
          before_notes?: string | null
          before_photos?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_signature_url?: string | null
          id?: string
          job_number: string
          lawn_area_sqm: number
          lawn_condition_at_job?:
            | Database["public"]["Enums"]["lawn_condition"]
            | null
          lawn_id: string
          performed_by?: string | null
          route_stop_id?: string | null
          scheduled_date: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          treatment_plan_item_id?: string | null
          updated_at?: string
        }
        Update: {
          after_notes?: string | null
          after_photos?: Json | null
          before_notes?: string | null
          before_photos?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_signature_url?: string | null
          id?: string
          job_number?: string
          lawn_area_sqm?: number
          lawn_condition_at_job?:
            | Database["public"]["Enums"]["lawn_condition"]
            | null
          lawn_id?: string
          performed_by?: string | null
          route_stop_id?: string | null
          scheduled_date?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          treatment_plan_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_lawn_id_fkey"
            columns: ["lawn_id"]
            isOneToOne: false
            referencedRelation: "lawns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_route_stop_id_fkey"
            columns: ["route_stop_id"]
            isOneToOne: false
            referencedRelation: "route_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_treatment_plan_item_id_fkey"
            columns: ["treatment_plan_item_id"]
            isOneToOne: false
            referencedRelation: "treatment_plan_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lawns: {
        Row: {
          access_notes: string | null
          address_line1: string
          address_line2: string | null
          area_sqm: number
          city: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          is_active: boolean
          latitude: number | null
          lawn_condition: Database["public"]["Enums"]["lawn_condition"]
          longitude: number | null
          postcode: string
          updated_at: string
        }
        Insert: {
          access_notes?: string | null
          address_line1: string
          address_line2?: string | null
          area_sqm: number
          city: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          lawn_condition?: Database["public"]["Enums"]["lawn_condition"]
          longitude?: number | null
          postcode: string
          updated_at?: string
        }
        Update: {
          access_notes?: string | null
          address_line1?: string
          address_line2?: string | null
          area_sqm?: number
          city?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          lawn_condition?: Database["public"]["Enums"]["lawn_condition"]
          longitude?: number | null
          postcode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          created_at: string
          created_by: string | null
          depot_id: string
          email: string | null
          employee_number: string
          first_name: string
          hourly_cost: number
          id: string
          is_active: boolean
          last_name: string
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          depot_id: string
          email?: string | null
          employee_number: string
          first_name: string
          hourly_cost: number
          id?: string
          is_active?: boolean
          last_name: string
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          depot_id?: string
          email?: string | null
          employee_number?: string
          first_name?: string
          hourly_cost?: number
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operators_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          notes: string | null
          order_number: string
          payment_reference: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          invoice_id: string
          is_confirmed: boolean
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          invoice_id: string
          is_confirmed?: boolean
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          invoice_id?: string
          is_confirmed?: boolean
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          sku: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sku: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sku?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          created_at: string
          distance_from_previous_miles: number | null
          estimated_arrival: string | null
          estimated_departure: string | null
          id: string
          job_id: string | null
          lawn_id: string
          route_id: string
          stop_order: number
          updated_at: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          distance_from_previous_miles?: number | null
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          job_id?: string | null
          lawn_id: string
          route_id: string
          stop_order: number
          updated_at?: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          created_at?: string
          distance_from_previous_miles?: number | null
          estimated_arrival?: string | null
          estimated_departure?: string | null
          id?: string
          job_id?: string | null
          lawn_id?: string
          route_id?: string
          stop_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_route_stops_job"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_lawn_id_fkey"
            columns: ["lawn_id"]
            isOneToOne: false
            referencedRelation: "lawns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_stops_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          actual_distance_miles: number | null
          actual_duration_minutes: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          depot_id: string
          estimated_distance_miles: number | null
          estimated_duration_minutes: number | null
          id: string
          notes: string | null
          operator_id: string
          route_date: string
          started_at: string | null
          status: Database["public"]["Enums"]["route_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          actual_distance_miles?: number | null
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          depot_id: string
          estimated_distance_miles?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          operator_id: string
          route_date: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          actual_distance_miles?: number | null
          actual_duration_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          depot_id?: string
          estimated_distance_miles?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          notes?: string | null
          operator_id?: string
          route_date?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["route_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      saga_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          saga_id: string
          step_type: Database["public"]["Enums"]["saga_step_type"]
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          saga_id: string
          step_type: Database["public"]["Enums"]["saga_step_type"]
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          saga_id?: string
          step_type?: Database["public"]["Enums"]["saga_step_type"]
        }
        Relationships: [
          {
            foreignKeyName: "saga_events_saga_id_fkey"
            columns: ["saga_id"]
            isOneToOne: false
            referencedRelation: "sagas"
            referencedColumns: ["id"]
          },
        ]
      }
      sagas: {
        Row: {
          completed_at: string | null
          correlation_id: string
          created_at: string
          current_step: Database["public"]["Enums"]["saga_step_type"] | null
          error_message: string | null
          id: string
          max_retries: number
          payload: Json
          retry_count: number
          saga_type: string
          status: Database["public"]["Enums"]["saga_status"]
          trigger_run_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          correlation_id: string
          created_at?: string
          current_step?: Database["public"]["Enums"]["saga_step_type"] | null
          error_message?: string | null
          id?: string
          max_retries?: number
          payload?: Json
          retry_count?: number
          saga_type: string
          status?: Database["public"]["Enums"]["saga_status"]
          trigger_run_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          correlation_id?: string
          created_at?: string
          current_step?: Database["public"]["Enums"]["saga_step_type"] | null
          error_message?: string | null
          id?: string
          max_retries?: number
          payload?: Json
          retry_count?: number
          saga_type?: string
          status?: Database["public"]["Enums"]["saga_status"]
          trigger_run_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          correlation_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          warehouse_id: string
        }
        Insert: {
          correlation_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          warehouse_id: string
        }
        Update: {
          correlation_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plan_items: {
        Row: {
          completed_job_id: string | null
          created_at: string
          id: string
          is_completed: boolean
          price_snapshot: number
          scheduled_week: string | null
          treatment_id: string
          treatment_plan_id: string
          updated_at: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          completed_job_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          price_snapshot: number
          scheduled_week?: string | null
          treatment_id: string
          treatment_plan_id: string
          updated_at?: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          completed_job_id?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          price_snapshot?: number
          scheduled_week?: string | null
          treatment_id?: string
          treatment_plan_id?: string
          updated_at?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_treatment_plan_items_job"
            columns: ["completed_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plan_items_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_plan_items_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lawn_id: string
          notes: string | null
          status: Database["public"]["Enums"]["treatment_plan_status"]
          total_estimated_price: number | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lawn_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["treatment_plan_status"]
          total_estimated_price?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lawn_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["treatment_plan_status"]
          total_estimated_price?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "treatment_plans_lawn_id_fkey"
            columns: ["lawn_id"]
            isOneToOne: false
            referencedRelation: "lawns"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity_multiplier_poor: number | null
          quantity_per_100sqm: number
          treatment_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity_multiplier_poor?: number | null
          quantity_per_100sqm: number
          treatment_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity_multiplier_poor?: number | null
          quantity_per_100sqm?: number
          treatment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatment_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatment_products_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      treatments: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          min_price: number | null
          minutes_per_100sqm: number
          name: string
          price_per_sqm: number
          season: Database["public"]["Enums"]["treatment_season"] | null
          sequence_in_year: number | null
          setup_minutes: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_price?: number | null
          minutes_per_100sqm: number
          name: string
          price_per_sqm: number
          season?: Database["public"]["Enums"]["treatment_season"] | null
          sequence_in_year?: number | null
          setup_minutes?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_price?: number | null
          minutes_per_100sqm?: number
          name?: string
          price_per_sqm?: number
          season?: Database["public"]["Enums"]["treatment_season"] | null
          sequence_in_year?: number | null
          setup_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          cost_per_mile: number | null
          created_at: string
          created_by: string | null
          depot_id: string
          id: string
          is_active: boolean
          load_capacity_kg: number | null
          make: string | null
          registration: string
          updated_at: string
          vehicle_model: string | null
        }
        Insert: {
          cost_per_mile?: number | null
          created_at?: string
          created_by?: string | null
          depot_id: string
          id?: string
          is_active?: boolean
          load_capacity_kg?: number | null
          make?: string | null
          registration: string
          updated_at?: string
          vehicle_model?: string | null
        }
        Update: {
          cost_per_mile?: number | null
          created_at?: string
          created_by?: string | null
          depot_id?: string
          id?: string
          is_active?: boolean
          load_capacity_kg?: number | null
          make?: string | null
          registration?: string
          updated_at?: string
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_depot_id_fkey"
            columns: ["depot_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_depot: boolean
          latitude: number | null
          longitude: number | null
          name: string
          postcode: string | null
          service_radius_miles: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_depot?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          postcode?: string | null
          service_radius_miles?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_depot?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          postcode?: string | null
          service_radius_miles?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_stock_availability: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_warehouse_id: string
        }
        Returns: boolean
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_manager: { Args: never; Returns: boolean }
      owns_or_is_admin: {
        Args: { resource_created_by: string }
        Returns: boolean
      }
    }
    Enums: {
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
        | "refunded"
      job_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "skipped"
        | "rescheduled"
      lawn_condition: "excellent" | "good" | "fair" | "poor" | "new"
      movement_type:
        | "receive"
        | "transfer_out"
        | "transfer_in"
        | "adjust"
        | "reserve"
        | "release"
        | "fulfill"
        | "consume"
      order_status:
        | "pending"
        | "reserved"
        | "payment_processing"
        | "payment_failed"
        | "paid"
        | "fulfilling"
        | "fulfilled"
        | "cancelled"
      payment_method:
        | "card"
        | "bank_transfer"
        | "direct_debit"
        | "cash"
        | "cheque"
      route_status:
        | "draft"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      saga_status:
        | "started"
        | "step_pending"
        | "step_executing"
        | "step_completed"
        | "step_failed"
        | "compensating"
        | "compensation_completed"
        | "completed"
        | "failed"
      saga_step_type:
        | "reserve_stock"
        | "process_payment"
        | "fulfill_order"
        | "release_stock"
        | "void_payment"
      treatment_plan_status: "active" | "paused" | "completed" | "cancelled"
      treatment_season:
        | "spring_early"
        | "spring_late"
        | "summer"
        | "autumn_early"
        | "autumn_late"
      user_role: "admin" | "manager" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partial",
        "overdue",
        "cancelled",
        "refunded",
      ],
      job_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "skipped",
        "rescheduled",
      ],
      lawn_condition: ["excellent", "good", "fair", "poor", "new"],
      movement_type: [
        "receive",
        "transfer_out",
        "transfer_in",
        "adjust",
        "reserve",
        "release",
        "fulfill",
        "consume",
      ],
      order_status: [
        "pending",
        "reserved",
        "payment_processing",
        "payment_failed",
        "paid",
        "fulfilling",
        "fulfilled",
        "cancelled",
      ],
      payment_method: [
        "card",
        "bank_transfer",
        "direct_debit",
        "cash",
        "cheque",
      ],
      route_status: [
        "draft",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      saga_status: [
        "started",
        "step_pending",
        "step_executing",
        "step_completed",
        "step_failed",
        "compensating",
        "compensation_completed",
        "completed",
        "failed",
      ],
      saga_step_type: [
        "reserve_stock",
        "process_payment",
        "fulfill_order",
        "release_stock",
        "void_payment",
      ],
      treatment_plan_status: ["active", "paused", "completed", "cancelled"],
      treatment_season: [
        "spring_early",
        "spring_late",
        "summer",
        "autumn_early",
        "autumn_late",
      ],
      user_role: ["admin", "manager", "viewer"],
    },
  },
} as const

