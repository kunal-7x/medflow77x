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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          patient_id: string | null
          priority: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          patient_id?: string | null
          priority?: string
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          patient_id?: string | null
          priority?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          date: string
          doctor: string
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          phone: string | null
          status: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          doctor: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          phone?: string | null
          status?: string
          time: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          doctor?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          phone?: string | null
          status?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          record_id: string
          table_name: string
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          record_id: string
          table_name: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          record_id?: string
          table_name?: string
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      beds: {
        Row: {
          assigned_date: string | null
          created_at: string
          floor: number
          id: string
          number: string
          patient_id: string | null
          status: string
          ward: string
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string
          floor?: number
          id?: string
          number: string
          patient_id?: string | null
          status?: string
          ward: string
        }
        Update: {
          assigned_date?: string | null
          created_at?: string
          floor?: number
          id?: string
          number?: string
          patient_id?: string | null
          status?: string
          ward?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          insurance_claim_id: string | null
          items: Json | null
          patient_id: string | null
          patient_name: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          insurance_claim_id?: string | null
          items?: Json | null
          patient_id?: string | null
          patient_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          insurance_claim_id?: string | null
          items?: Json | null
          patient_id?: string | null
          patient_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          administration_log: Json[] | null
          created_at: string
          doctor: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          medication: string
          patient_id: string | null
          patient_name: string
          start_date: string
          status: string
        }
        Insert: {
          administration_log?: Json[] | null
          created_at?: string
          doctor: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          medication: string
          patient_id?: string | null
          patient_name: string
          start_date?: string
          status?: string
        }
        Update: {
          administration_log?: Json[] | null
          created_at?: string
          doctor?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          medication?: string
          patient_id?: string | null
          patient_name?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_date: string | null
          created_at: string
          doctor: string
          id: string
          ordered: string
          patient_id: string | null
          patient_name: string
          priority: string
          result: string | null
          status: string
          test: string
          type: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          doctor: string
          id?: string
          ordered?: string
          patient_id?: string | null
          patient_name: string
          priority?: string
          result?: string | null
          status?: string
          test: string
          type: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          doctor?: string
          id?: string
          ordered?: string
          patient_id?: string | null
          patient_name?: string
          priority?: string
          result?: string | null
          status?: string
          test?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          admission_date: string | null
          age: number | null
          allergies: string[] | null
          bed_number: string | null
          blood_group: string | null
          condition: string
          created_at: string
          date_of_birth: string | null
          diagnosis: string
          discharge_date: string | null
          doctor: string | null
          email: string | null
          emergency_contact: string | null
          gender: string | null
          id: string
          name: string
          phone: string | null
          status: string
          updated_at: string
          vitals: Json | null
          vitals_history: Json[] | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          age?: number | null
          allergies?: string[] | null
          bed_number?: string | null
          blood_group?: string | null
          condition?: string
          created_at?: string
          date_of_birth?: string | null
          diagnosis?: string
          discharge_date?: string | null
          doctor?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          vitals?: Json | null
          vitals_history?: Json[] | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          age?: number | null
          allergies?: string[] | null
          bed_number?: string | null
          blood_group?: string | null
          condition?: string
          created_at?: string
          date_of_birth?: string | null
          diagnosis?: string
          discharge_date?: string | null
          doctor?: string | null
          email?: string | null
          emergency_contact?: string | null
          gender?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          vitals?: Json | null
          vitals_history?: Json[] | null
          ward?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          department: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          shift: string
          status: string
        }
        Insert: {
          created_at?: string
          department: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role: string
          shift?: string
          status?: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          shift?: string
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "doctor" | "nurse" | "receptionist"
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
      app_role: ["admin", "doctor", "nurse", "receptionist"],
    },
  },
} as const
