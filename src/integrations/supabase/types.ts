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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assessment_predictions: {
        Row: {
          assessment_id: string
          condition: string
          confidence: number
          id: string
          rank: number
          user_id: string
        }
        Insert: {
          assessment_id: string
          condition: string
          confidence: number
          id?: string
          rank?: number
          user_id: string
        }
        Update: {
          assessment_id?: string
          condition?: string
          confidence?: number
          id?: string
          rank?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_predictions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          condition: string
          confidence: number
          created_at: string
          gradcam_path: string | null
          gradcam_url: string | null
          id: string
          image_path: string | null
          model_version: string | null
          skin_health_score: number | null
          user_id: string
        }
        Insert: {
          condition: string
          confidence: number
          created_at?: string
          gradcam_path?: string | null
          gradcam_url?: string | null
          id?: string
          image_path?: string | null
          model_version?: string | null
          skin_health_score?: number | null
          user_id: string
        }
        Update: {
          condition?: string
          confidence?: number
          created_at?: string
          gradcam_path?: string | null
          gradcam_url?: string | null
          id?: string
          image_path?: string | null
          model_version?: string | null
          skin_health_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          confidence_at_time: number | null
          created_at: string
          id: string
          message: string
          role: string
          routine_day: number | null
          session_id: string
          skin_condition_at_time: string | null
          user_id: string
        }
        Insert: {
          confidence_at_time?: number | null
          created_at?: string
          id?: string
          message: string
          role: string
          routine_day?: number | null
          session_id: string
          skin_condition_at_time?: string | null
          user_id: string
        }
        Update: {
          confidence_at_time?: number | null
          created_at?: string
          id?: string
          message?: string
          role?: string
          routine_day?: number | null
          session_id?: string
          skin_condition_at_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          note: string | null
          routine_day_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          note?: string | null
          routine_day_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          note?: string | null
          routine_day_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_feedback_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          compatibility: string | null
          id: string
          irritation_risk: string
          name: string
          purpose: string
          slug: string
          suitable_concerns: string[]
          usage_guidance: string | null
          warnings: string | null
        }
        Insert: {
          compatibility?: string | null
          id?: string
          irritation_risk: string
          name: string
          purpose: string
          slug: string
          suitable_concerns?: string[]
          usage_guidance?: string | null
          warnings?: string | null
        }
        Update: {
          compatibility?: string | null
          id?: string
          irritation_risk?: string
          name?: string
          purpose?: string
          slug?: string
          suitable_concerns?: string[]
          usage_guidance?: string | null
          warnings?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          kind: string
          time_of_day: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          kind: string
          time_of_day?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          kind?: string
          time_of_day?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category: string
          description: string | null
          id: string
          key_ingredients: string[]
          name: string
          price_band: string
          price_estimate: number | null
          suitable_skin_types: string[]
          targets_concerns: string[]
        }
        Insert: {
          brand?: string | null
          category: string
          description?: string | null
          id?: string
          key_ingredients?: string[]
          name: string
          price_band: string
          price_estimate?: number | null
          suitable_skin_types?: string[]
          targets_concerns?: string[]
        }
        Update: {
          brand?: string | null
          category?: string
          description?: string | null
          id?: string
          key_ingredients?: string[]
          name?: string
          price_band?: string
          price_estimate?: number | null
          suitable_skin_types?: string[]
          targets_concerns?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          age_group: string | null
          allergies: string[]
          budget: string | null
          created_at: string
          current_products: string[]
          environment: string | null
          full_name: string | null
          goals: string[]
          id: string
          lifestyle: string | null
          sensitivities: string[]
          skin_concerns: string[]
          skin_type: string | null
          sleep_quality: number | null
          sun_exposure: string | null
          updated_at: string
          water_intake_litres: number | null
        }
        Insert: {
          age?: number | null
          age_group?: string | null
          allergies?: string[]
          budget?: string | null
          created_at?: string
          current_products?: string[]
          environment?: string | null
          full_name?: string | null
          goals?: string[]
          id: string
          lifestyle?: string | null
          sensitivities?: string[]
          skin_concerns?: string[]
          skin_type?: string | null
          sleep_quality?: number | null
          sun_exposure?: string | null
          updated_at?: string
          water_intake_litres?: number | null
        }
        Update: {
          age?: number | null
          age_group?: string | null
          allergies?: string[]
          budget?: string | null
          created_at?: string
          current_products?: string[]
          environment?: string | null
          full_name?: string | null
          goals?: string[]
          id?: string
          lifestyle?: string | null
          sensitivities?: string[]
          skin_concerns?: string[]
          skin_type?: string | null
          sleep_quality?: number | null
          sun_exposure?: string | null
          updated_at?: string
          water_intake_litres?: number | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          confidence: number | null
          created_at: string
          entry_date: string
          hydration: number | null
          id: string
          routine_adherence: number | null
          skin_health_score: number | null
          sleep: number | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          entry_date?: string
          hydration?: number | null
          id?: string
          routine_adherence?: number | null
          skin_health_score?: number | null
          sleep?: number | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          entry_date?: string
          hydration?: number | null
          id?: string
          routine_adherence?: number | null
          skin_health_score?: number | null
          sleep?: number | null
          user_id?: string
        }
        Relationships: []
      }
      routine_days: {
        Row: {
          day_number: number
          evening_steps: string[]
          focus: string | null
          id: string
          morning_steps: string[]
          notes: string | null
          routine_id: string
          title: string
          user_id: string
        }
        Insert: {
          day_number: number
          evening_steps?: string[]
          focus?: string | null
          id?: string
          morning_steps?: string[]
          notes?: string | null
          routine_id: string
          title: string
          user_id: string
        }
        Update: {
          day_number?: number
          evening_steps?: string[]
          focus?: string | null
          id?: string
          morning_steps?: string[]
          notes?: string | null
          routine_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_tasks: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          id: string
          label: string
          routine_day_id: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          label: string
          routine_day_id: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          label?: string
          routine_day_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_tasks_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          assessment_id: string | null
          created_at: string
          generated_by: string | null
          id: string
          is_active: boolean
          rationale: string | null
          start_date: string
          user_id: string
          week_number: number
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          is_active?: boolean
          rationale?: string | null
          start_date?: string
          user_id: string
          week_number?: number
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          is_active?: boolean
          rationale?: string | null
          start_date?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "routines_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          completed_tasks: number | null
          created_at: string
          ending_score: number | null
          hydration: number | null
          id: string
          missed_tasks: number | null
          recommendations: string[]
          routine_adherence: number | null
          routine_id: string | null
          sleep: number | null
          starting_score: number | null
          summary: string | null
          user_id: string
          week_number: number
        }
        Insert: {
          completed_tasks?: number | null
          created_at?: string
          ending_score?: number | null
          hydration?: number | null
          id?: string
          missed_tasks?: number | null
          recommendations?: string[]
          routine_adherence?: number | null
          routine_id?: string | null
          sleep?: number | null
          starting_score?: number | null
          summary?: string | null
          user_id: string
          week_number?: number
        }
        Update: {
          completed_tasks?: number | null
          created_at?: string
          ending_score?: number | null
          hydration?: number | null
          id?: string
          missed_tasks?: number | null
          recommendations?: string[]
          routine_adherence?: number | null
          routine_id?: string | null
          sleep?: number | null
          starting_score?: number | null
          summary?: string | null
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
