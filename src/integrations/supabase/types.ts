export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          favv_relevant: boolean
          id: string
          location: string | null
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          staff_code: string | null
          staff_name: string | null
          timestamp: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          favv_relevant?: boolean
          id?: string
          location?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          staff_code?: string | null
          staff_name?: string | null
          timestamp?: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          favv_relevant?: boolean
          id?: string
          location?: string | null
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          staff_code?: string | null
          staff_name?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      batch_labels: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          label_number: number
          printed_at: string | null
          qr_code_data: Json
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          label_number: number
          printed_at?: string | null
          qr_code_data: Json
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          label_number?: number
          printed_at?: string | null
          qr_code_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "batch_labels_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      chefs: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location: Database["public"]["Enums"]["location_type"]
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location: Database["public"]["Enums"]["location_type"]
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location?: Database["public"]["Enums"]["location_type"]
          name?: string
        }
        Relationships: []
      }
      cleaning_task_templates: {
        Row: {
          active: boolean
          assigned_role: Database["public"]["Enums"]["staff_role"] | null
          created_at: string
          description: string | null
          estimated_duration: number | null
          favv_compliance: boolean | null
          frequency: Database["public"]["Enums"]["task_frequency"]
          id: string
          location: Database["public"]["Enums"]["location_type"]
          monthly_day_of_month: number | null
          quarterly_start_month: number | null
          requires_photo: boolean | null
          title: string
          updated_at: string
          weekly_day_of_week: number | null
        }
        Insert: {
          active?: boolean
          assigned_role?: Database["public"]["Enums"]["staff_role"] | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          favv_compliance?: boolean | null
          frequency: Database["public"]["Enums"]["task_frequency"]
          id?: string
          location: Database["public"]["Enums"]["location_type"]
          monthly_day_of_month?: number | null
          quarterly_start_month?: number | null
          requires_photo?: boolean | null
          title: string
          updated_at?: string
          weekly_day_of_week?: number | null
        }
        Update: {
          active?: boolean
          assigned_role?: Database["public"]["Enums"]["staff_role"] | null
          created_at?: string
          description?: string | null
          estimated_duration?: number | null
          favv_compliance?: boolean | null
          frequency?: Database["public"]["Enums"]["task_frequency"]
          id?: string
          location?: Database["public"]["Enums"]["location_type"]
          monthly_day_of_month?: number | null
          quarterly_start_month?: number | null
          requires_photo?: boolean | null
          title?: string
          updated_at?: string
          weekly_day_of_week?: number | null
        }
        Relationships: []
      }
      cleaning_tasks: {
        Row: {
          actual_duration: number | null
          assigned_role: Database["public"]["Enums"]["staff_role"] | null
          assigned_staff_name: string | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          completion_notes: string | null
          created_at: string
          description: string | null
          due_time: string | null
          estimated_duration: number | null
          favv_compliance: boolean | null
          id: string
          location: Database["public"]["Enums"]["location_type"]
          photo_urls: string[] | null
          scheduled_date: string
          status: Database["public"]["Enums"]["task_status"] | null
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_role?: Database["public"]["Enums"]["staff_role"] | null
          assigned_staff_name?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          favv_compliance?: boolean | null
          id?: string
          location: Database["public"]["Enums"]["location_type"]
          photo_urls?: string[] | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["task_status"] | null
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_role?: Database["public"]["Enums"]["staff_role"] | null
          assigned_staff_name?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_notes?: string | null
          created_at?: string
          description?: string | null
          due_time?: string | null
          estimated_duration?: number | null
          favv_compliance?: boolean | null
          id?: string
          location?: Database["public"]["Enums"]["location_type"]
          photo_urls?: string[] | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "cleaning_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "staff_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "cleaning_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cleaning_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          active: boolean
          address: string | null
          contact_person: string | null
          created_at: string
          customer_type: string
          delivery_instructions: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_person?: string | null
          created_at?: string
          customer_type: string
          delivery_instructions?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_person?: string | null
          created_at?: string
          customer_type?: string
          delivery_instructions?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dispatch_items: {
        Row: {
          batch_number: string | null
          created_at: string
          dispatch_id: string
          expiry_date: string | null
          id: string
          item_id: string
          item_name: string
          item_type: string
          production_date: string | null
          quantity: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          dispatch_id: string
          expiry_date?: string | null
          id?: string
          item_id: string
          item_name: string
          item_type: string
          production_date?: string | null
          quantity: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          dispatch_id?: string
          expiry_date?: string | null
          id?: string
          item_id?: string
          item_name?: string
          item_type?: string
          production_date?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_items_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_records"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_records: {
        Row: {
          created_at: string
          customer: string | null
          dispatch_notes: string | null
          dispatch_type: string
          id: string
          location: string
          picker_code: string
          picker_name: string
          total_items: number
          total_packages: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer?: string | null
          dispatch_notes?: string | null
          dispatch_type: string
          id?: string
          location: string
          picker_code: string
          picker_name: string
          total_items?: number
          total_packages?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer?: string | null
          dispatch_notes?: string | null
          dispatch_type?: string
          id?: string
          location?: string
          picker_code?: string
          picker_name?: string
          total_items?: number
          total_packages?: number
          updated_at?: string
        }
        Relationships: []
      }
      packing_slips: {
        Row: {
          batch_ids: string[]
          created_at: string
          destination: string
          dispatch_id: string | null
          id: string
          picked_up_by: string | null
          pickup_date: string | null
          prepared_by: string | null
          slip_number: string
          status: string | null
          total_items: number
          total_packages: number
        }
        Insert: {
          batch_ids: string[]
          created_at?: string
          destination: string
          dispatch_id?: string | null
          id?: string
          picked_up_by?: string | null
          pickup_date?: string | null
          prepared_by?: string | null
          slip_number: string
          status?: string | null
          total_items?: number
          total_packages?: number
        }
        Update: {
          batch_ids?: string[]
          created_at?: string
          destination?: string
          dispatch_id?: string | null
          id?: string
          picked_up_by?: string | null
          pickup_date?: string | null
          prepared_by?: string | null
          slip_number?: string
          status?: string | null
          total_items?: number
          total_packages?: number
        }
        Relationships: [
          {
            foreignKeyName: "packing_slips_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatch_records"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          batch_number: string
          chef_id: string
          created_at: string
          expiry_date: string
          id: string
          location: Database["public"]["Enums"]["location_type"]
          packages_produced: number
          product_id: string
          production_date: string
          production_notes: string | null
          updated_at: string
        }
        Insert: {
          batch_number: string
          chef_id: string
          created_at?: string
          expiry_date: string
          id?: string
          location: Database["public"]["Enums"]["location_type"]
          packages_produced: number
          product_id: string
          production_date?: string
          production_notes?: string | null
          updated_at?: string
        }
        Update: {
          batch_number?: string
          chef_id?: string
          created_at?: string
          expiry_date?: string
          id?: string
          location?: Database["public"]["Enums"]["location_type"]
          packages_produced?: number
          product_id?: string
          production_date?: string
          production_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "chefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          packages_per_batch: number
          price_per_unit: number | null
          product_type: string
          shelf_life_days: number | null
          supplier_name: string | null
          unit_size: number
          unit_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          packages_per_batch?: number
          price_per_unit?: number | null
          product_type?: string
          shelf_life_days?: number | null
          supplier_name?: string | null
          unit_size: number
          unit_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          packages_per_batch?: number
          price_per_unit?: number | null
          product_type?: string
          shelf_life_days?: number | null
          supplier_name?: string | null
          unit_size?: number
          unit_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          department: string | null
          initials: string | null
          location: Database["public"]["Enums"]["location_type"] | null
          name: string
          permission_level: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          department?: string | null
          initials?: string | null
          location?: Database["public"]["Enums"]["location_type"] | null
          name: string
          permission_level?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          department?: string | null
          initials?: string | null
          location?: Database["public"]["Enums"]["location_type"] | null
          name?: string
          permission_level?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_batch_number: {
        Args: { product_name: string; production_date: string }
        Returns: string
      }
      generate_daily_cleaning_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_scheduled_cleaning_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      location_type: "tothai" | "khin" | "both"
      staff_role: "chef" | "cleaner"
      task_frequency: "daily" | "weekly" | "monthly" | "quarterly"
      task_status: "open" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      location_type: ["tothai", "khin", "both"],
      staff_role: ["chef", "cleaner"],
      task_frequency: ["daily", "weekly", "monthly", "quarterly"],
      task_status: ["open", "closed"],
    },
  },
} as const
