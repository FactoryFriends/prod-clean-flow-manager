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
      cleaning_task_templates: {
        Row: {
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
            foreignKeyName: "cleaning_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cleaning_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string
          location: Database["public"]["Enums"]["location_type"] | null
          name: string
          role: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string
          location?: Database["public"]["Enums"]["location_type"] | null
          name: string
          role?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string
          location?: Database["public"]["Enums"]["location_type"] | null
          name?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      location_type: "tothai" | "khin"
      staff_role: "chef" | "cleaner" | "other"
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
      location_type: ["tothai", "khin"],
      staff_role: ["chef", "cleaner", "other"],
      task_frequency: ["daily", "weekly", "monthly", "quarterly"],
      task_status: ["open", "closed"],
    },
  },
} as const
