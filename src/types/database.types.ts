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
      inventory: {
        Row: {
          created_at: string
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
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
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
      products: {
        Row: {
          created_at: string
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
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
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
    }
    Enums: {
      movement_type:
        | "receive"
        | "transfer_out"
        | "transfer_in"
        | "adjust"
        | "reserve"
        | "release"
        | "fulfill"
      order_status:
        | "pending"
        | "reserved"
        | "payment_processing"
        | "payment_failed"
        | "paid"
        | "fulfilling"
        | "fulfilled"
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
      movement_type: [
        "receive",
        "transfer_out",
        "transfer_in",
        "adjust",
        "reserve",
        "release",
        "fulfill",
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
    },
  },
} as const

