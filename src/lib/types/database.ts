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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          created_at: string
          customer_id: string
          designation: string | null
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organization_id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organization_id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_sites: {
        Row: {
          address: Json
          created_at: string
          customer_id: string
          id: string
          label: string
          organization_id: string
          site_type: string | null
        }
        Insert: {
          address?: Json
          created_at?: string
          customer_id: string
          id?: string
          label: string
          organization_id?: string
          site_type?: string | null
        }
        Update: {
          address?: Json
          created_at?: string
          customer_id?: string
          id?: string
          label?: string
          organization_id?: string
          site_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_sites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: Json
          created_at: string
          created_by: string | null
          customer_type: string
          gstin: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          updated_at: string
        }
        Insert: {
          billing_address?: Json
          created_at?: string
          created_by?: string | null
          customer_type?: string
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          created_by?: string | null
          customer_type?: string
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_type: string
          actor_id: string | null
          created_at: string
          description: string
          id: string
          lead_id: string
          organization_id: string
        }
        Insert: {
          activity_type?: string
          actor_id?: string | null
          created_at?: string
          description: string
          id?: string
          lead_id: string
          organization_id?: string
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_name: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          estimated_capacity_kwp: number | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          lead_number: string
          lost_reason: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          organization_id: string
          owner_id: string | null
          priority: string
          project_type: string
          site_id: string | null
          source_id: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_capacity_kwp?: number | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_number?: string
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          priority?: string
          project_type?: string
          site_id?: string | null
          source_id?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_capacity_kwp?: number | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lead_number?: string
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          organization_id?: string
          owner_id?: string | null
          priority?: string
          project_type?: string
          site_id?: string | null
          source_id?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "customer_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "lead_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      numbering_sequences: {
        Row: {
          entity_type: string
          last_value: number
          organization_id: string
          year: number
        }
        Insert: {
          entity_type: string
          last_value?: number
          organization_id: string
          year: number
        }
        Update: {
          entity_type?: string
          last_value?: number
          organization_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "numbering_sequences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          organization_id: string
          role_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          expires_at?: string
          id?: string
          organization_id: string
          role_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          organization_id?: string
          role_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_address: Json
          created_at: string
          gstin: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          billing_address?: Json
          created_at?: string
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          billing_address?: Json
          created_at?: string
          gstin?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          description: string
          id: string
          key: string
          module: string
        }
        Insert: {
          description: string
          id?: string
          key: string
          module: string
        }
        Update: {
          description?: string
          id?: string
          key?: string
          module?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization_id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          organization_id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          notification_config: Json
          numbering_formats: Json
          organization_id: string
          tax_config: Json
          updated_at: string
          workflow_config: Json
        }
        Insert: {
          notification_config?: Json
          numbering_formats?: Json
          organization_id: string
          tax_config?: Json
          updated_at?: string
          workflow_config?: Json
        }
        Update: {
          notification_config?: Json
          numbering_formats?: Json
          organization_id?: string
          tax_config?: Json
          updated_at?: string
          workflow_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          organization_id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: { p_full_name: string; p_token: string }
        Returns: string
      }
      bootstrap_organization: {
        Args: { p_full_name: string; p_org_name: string; p_org_slug: string }
        Returns: string
      }
      convert_lead_to_customer: { Args: { p_lead_id: string }; Returns: string }
      create_invite: {
        Args: { p_email?: string; p_role_key: string }
        Returns: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          organization_id: string
          role_id: string
          token: string
        }
      }
      current_org_id: { Args: never; Returns: string }
      get_invite_preview: {
        Args: { p_token: string }
        Returns: {
          organization_name: string
          role_name: string
          valid: boolean
        }[]
      }
      has_permission: { Args: { perm_key: string }; Returns: boolean }
      is_org_owner: { Args: never; Returns: boolean }
      next_number: {
        Args: { p_entity_type: string; p_format?: string }
        Returns: string
      }
      seed_default_lead_sources: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      seed_default_roles: { Args: { p_org_id: string }; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
