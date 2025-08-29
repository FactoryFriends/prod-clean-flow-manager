export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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
          item_details: Json | null
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
          item_details?: Json | null
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
          item_details?: Json | null
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
      product_cost_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_cost: number
          old_cost: number | null
          product_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_cost: number
          old_cost?: number | null
          product_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_cost?: number
          old_cost?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_cost_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          items_per_package: number | null
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
          items_per_package?: number | null
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
          items_per_package?: number | null
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
          allergens: string[] | null
          cost: number | null
          created_at: string
          id: string
          inner_unit_type: string | null
          markup_percent: number | null
          minimal_margin_threshold_percent: number | null
          name: string
          name_thai: string | null
          packages_per_batch: number
          pickable: boolean
          price_per_package: number | null
          price_per_unit: number | null
          product_fiche_url: string | null
          product_kind: string
          product_type: string
          sales_price: number | null
          shelf_life_days: number | null
          supplier_id: string | null
          supplier_name: string | null
          supplier_package_unit: string | null
          unit_size: number
          unit_type: string
          units_per_package: number | null
          updated_at: string
          variable_packaging: boolean
        }
        Insert: {
          active?: boolean
          allergens?: string[] | null
          cost?: number | null
          created_at?: string
          id?: string
          inner_unit_type?: string | null
          markup_percent?: number | null
          minimal_margin_threshold_percent?: number | null
          name: string
          name_thai?: string | null
          packages_per_batch?: number
          pickable?: boolean
          price_per_package?: number | null
          price_per_unit?: number | null
          product_fiche_url?: string | null
          product_kind?: string
          product_type?: string
          sales_price?: number | null
          shelf_life_days?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_package_unit?: string | null
          unit_size: number
          unit_type: string
          units_per_package?: number | null
          updated_at?: string
          variable_packaging?: boolean
        }
        Update: {
          active?: boolean
          allergens?: string[] | null
          cost?: number | null
          created_at?: string
          id?: string
          inner_unit_type?: string | null
          markup_percent?: number | null
          minimal_margin_threshold_percent?: number | null
          name?: string
          name_thai?: string | null
          packages_per_batch?: number
          pickable?: boolean
          price_per_package?: number | null
          price_per_unit?: number | null
          product_fiche_url?: string | null
          product_kind?: string
          product_type?: string
          sales_price?: number | null
          shelf_life_days?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          supplier_package_unit?: string | null
          unit_size?: number
          unit_type?: string
          units_per_package?: number | null
          updated_at?: string
          variable_packaging?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fk_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          created_by: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
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
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          contact_person: string | null
          created_at: string
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
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      unit_options: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          unit_type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          unit_type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          unit_type?: string
          updated_at?: string
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
      get_current_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          created_by: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          created_by: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      update_user_profile: {
        Args: {
          p_full_name: string
          p_profile_id: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: {
          created_at: string
          created_by: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
      update_user_role: {
        Args: {
          p_profile_id: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: {
          created_at: string
          created_by: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }[]
      }
    }
    Enums: {
      location_type: "tothai" | "khin" | "both"
      staff_role: "chef" | "cleaner"
      task_frequency: "daily" | "weekly" | "monthly" | "quarterly"
      task_status: "open" | "closed"
      user_role: "admin" | "production"
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
  public: {
    Enums: {
      location_type: ["tothai", "khin", "both"],
      staff_role: ["chef", "cleaner"],
      task_frequency: ["daily", "weekly", "monthly", "quarterly"],
      task_status: ["open", "closed"],
      user_role: ["admin", "production"],
    },
  },
} as const
