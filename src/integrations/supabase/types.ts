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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accommodation_units: {
        Row: {
          allows_children: boolean | null
          allows_pets: boolean | null
          bed_type: string | null
          created_at: string | null
          description: string | null
          id: string
          max_capacity: number
          min_capacity: number
          name: string
          updated_at: string | null
        }
        Insert: {
          allows_children?: boolean | null
          allows_pets?: boolean | null
          bed_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_capacity: number
          min_capacity: number
          name: string
          updated_at?: string | null
        }
        Update: {
          allows_children?: boolean | null
          allows_pets?: boolean | null
          bed_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_capacity?: number
          min_capacity?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      additional_services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          requires_children_pricing: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          requires_children_pricing?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          requires_children_pricing?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          description: string | null
          id: string
          template_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          id?: string
          template_type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number
          id: string
          min_nights: number
          tariff_period_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage: number
          id?: string
          min_nights: number
          tariff_period_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number
          id?: string
          min_nights?: number
          tariff_period_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_tariff_period_id_fkey"
            columns: ["tariff_period_id"]
            isOneToOne: false
            referencedRelation: "tariff_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          adult_price: number
          child_price: number | null
          created_at: string | null
          id: string
          per_day: boolean | null
          service_id: string | null
          tariff_period_id: string | null
        }
        Insert: {
          adult_price: number
          child_price?: number | null
          created_at?: string | null
          id?: string
          per_day?: boolean | null
          service_id?: string | null
          tariff_period_id?: string | null
        }
        Update: {
          adult_price?: number
          child_price?: number | null
          created_at?: string | null
          id?: string
          per_day?: boolean | null
          service_id?: string | null
          tariff_period_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "additional_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_prices_tariff_period_id_fkey"
            columns: ["tariff_period_id"]
            isOneToOne: false
            referencedRelation: "tariff_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      tariff_periods: {
        Row: {
          created_at: string | null
          degree: Database["public"]["Enums"]["tariff_degree"]
          deposit_percentage: number
          end_date: string
          id: string
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          degree?: Database["public"]["Enums"]["tariff_degree"]
          deposit_percentage?: number
          end_date: string
          id?: string
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          degree?: Database["public"]["Enums"]["tariff_degree"]
          deposit_percentage?: number
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      unit_prices: {
        Row: {
          created_at: string | null
          id: string
          price_per_night: number
          tariff_period_id: string | null
          unit_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_night: number
          tariff_period_id?: string | null
          unit_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_night?: number
          tariff_period_id?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_prices_tariff_period_id_fkey"
            columns: ["tariff_period_id"]
            isOneToOne: false
            referencedRelation: "tariff_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_prices_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "accommodation_units"
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
      tariff_degree: "first" | "second"
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
      tariff_degree: ["first", "second"],
    },
  },
} as const
