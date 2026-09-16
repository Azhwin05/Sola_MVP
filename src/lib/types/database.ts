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
      bom_headers: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          revision_id: string
          status: string
          study_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          revision_id: string
          status?: string
          study_id: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          revision_id?: string
          status?: string
          study_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bom_headers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_headers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_headers_revision_id_fkey"
            columns: ["revision_id"]
            isOneToOne: false
            referencedRelation: "engineering_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_headers_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "engineering_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      bom_items: {
        Row: {
          bom_header_id: string
          category: string
          created_at: string
          estimated_amount: number | null
          estimated_rate: number
          final_quantity: number | null
          id: string
          item: string
          organization_id: string
          quantity: number
          sort_order: number
          specification: string | null
          unit: string
          wastage_percent: number
        }
        Insert: {
          bom_header_id: string
          category: string
          created_at?: string
          estimated_amount?: number | null
          estimated_rate?: number
          final_quantity?: number | null
          id?: string
          item: string
          organization_id?: string
          quantity?: number
          sort_order?: number
          specification?: string | null
          unit?: string
          wastage_percent?: number
        }
        Update: {
          bom_header_id?: string
          category?: string
          created_at?: string
          estimated_amount?: number | null
          estimated_rate?: number
          final_quantity?: number | null
          id?: string
          item?: string
          organization_id?: string
          quantity?: number
          sort_order?: number
          specification?: string | null
          unit?: string
          wastage_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "bom_items_bom_header_id_fkey"
            columns: ["bom_header_id"]
            isOneToOne: false
            referencedRelation: "bom_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bom_items_organization_id_fkey"
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
      eb_bills: {
        Row: {
          amount: number | null
          bill_number: string | null
          billing_month: string
          closing_reading: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          demand_kva: number | null
          due_date: string | null
          extraction_confidence: number | null
          id: string
          lead_id: string | null
          opening_reading: number | null
          organization_id: string
          paid_status: string
          source_document_path: string | null
          survey_id: string | null
          tariff_category: string | null
          units_consumed: number
          updated_at: string
        }
        Insert: {
          amount?: number | null
          bill_number?: string | null
          billing_month: string
          closing_reading?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          demand_kva?: number | null
          due_date?: string | null
          extraction_confidence?: number | null
          id?: string
          lead_id?: string | null
          opening_reading?: number | null
          organization_id?: string
          paid_status?: string
          source_document_path?: string | null
          survey_id?: string | null
          tariff_category?: string | null
          units_consumed: number
          updated_at?: string
        }
        Update: {
          amount?: number | null
          bill_number?: string | null
          billing_month?: string
          closing_reading?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          demand_kva?: number | null
          due_date?: string | null
          extraction_confidence?: number | null
          id?: string
          lead_id?: string | null
          opening_reading?: number | null
          organization_id?: string
          paid_status?: string
          source_document_path?: string | null
          survey_id?: string | null
          tariff_category?: string | null
          units_consumed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eb_bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb_bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb_bills_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb_bills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eb_bills_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "site_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      engineering_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inputs: Json
          organization_id: string
          outputs: Json
          revision_number: number
          study_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inputs: Json
          organization_id?: string
          outputs: Json
          revision_number: number
          study_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inputs?: Json
          organization_id?: string
          outputs?: Json
          revision_number?: number
          study_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineering_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_revisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_revisions_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "engineering_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      engineering_studies: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          lead_id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          lead_id: string
          organization_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          lead_id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineering_studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_studies_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_studies_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engineering_studies_organization_id_fkey"
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
      project_events: {
        Row: {
          actor_id: string | null
          comment: string | null
          created_at: string
          event: string
          id: string
          organization_id: string
          project_id: string
        }
        Insert: {
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          event: string
          id?: string
          organization_id?: string
          project_id: string
        }
        Update: {
          actor_id?: string | null
          comment?: string | null
          created_at?: string
          event?: string
          id?: string
          organization_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
          owner_id: string | null
          planned_end: string | null
          planned_start: string | null
          project_id: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id?: string
          owner_id?: string | null
          planned_end?: string | null
          planned_start?: string | null
          project_id: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          owner_id?: string | null
          planned_end?: string | null
          planned_start?: string | null
          project_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_risks: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          impact: string
          mitigation: string | null
          organization_id: string
          owner_id: string | null
          probability: string
          project_id: string
          risk: string
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          impact?: string
          mitigation?: string | null
          organization_id?: string
          owner_id?: string | null
          probability?: string
          project_id: string
          risk: string
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          impact?: string
          mitigation?: string | null
          organization_id?: string
          owner_id?: string | null
          probability?: string
          project_id?: string
          risk?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_risks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          checklist: Json
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          owner_id: string | null
          priority: string
          project_id: string
          status: string
          team: string | null
          title: string
          updated_at: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          owner_id?: string | null
          priority?: string
          project_id: string
          status?: string
          team?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          owner_id?: string | null
          priority?: string
          project_id?: string
          status?: string
          team?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          capacity_kwp: number | null
          contract_value: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          lead_id: string | null
          organization_id: string
          pm_id: string | null
          project_number: string
          proposal_version_id: string | null
          site_id: string | null
          status: string
          target_cod: string | null
          updated_at: string
        }
        Insert: {
          capacity_kwp?: number | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          lead_id?: string | null
          organization_id?: string
          pm_id?: string | null
          project_number?: string
          proposal_version_id?: string | null
          site_id?: string | null
          status?: string
          target_cod?: string | null
          updated_at?: string
        }
        Update: {
          capacity_kwp?: number | null
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          lead_id?: string | null
          organization_id?: string
          pm_id?: string | null
          project_number?: string
          proposal_version_id?: string | null
          site_id?: string | null
          status?: string
          target_cod?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_proposal_version_id_fkey"
            columns: ["proposal_version_id"]
            isOneToOne: false
            referencedRelation: "proposal_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "customer_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_versions: {
        Row: {
          accepted_at: string | null
          assumptions: string | null
          bom_header_id: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          engineering_revision_id: string | null
          equipment_cost: number
          exclusions: string | null
          id: string
          installation_cost: number
          is_interstate: boolean
          lead_id: string
          organization_id: string
          other_cost: number
          payment_terms: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate_percent: number
          total_amount: number | null
          updated_at: string
          version: number
          warranty_equipment_years: number | null
          warranty_workmanship_years: number | null
        }
        Insert: {
          accepted_at?: string | null
          assumptions?: string | null
          bom_header_id?: string | null
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          engineering_revision_id?: string | null
          equipment_cost?: number
          exclusions?: string | null
          id?: string
          installation_cost?: number
          is_interstate?: boolean
          lead_id: string
          organization_id?: string
          other_cost?: number
          payment_terms?: string | null
          proposal_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate_percent?: number
          total_amount?: number | null
          updated_at?: string
          version: number
          warranty_equipment_years?: number | null
          warranty_workmanship_years?: number | null
        }
        Update: {
          accepted_at?: string | null
          assumptions?: string | null
          bom_header_id?: string | null
          change_summary?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number
          engineering_revision_id?: string | null
          equipment_cost?: number
          exclusions?: string | null
          id?: string
          installation_cost?: number
          is_interstate?: boolean
          lead_id?: string
          organization_id?: string
          other_cost?: number
          payment_terms?: string | null
          proposal_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate_percent?: number
          total_amount?: number | null
          updated_at?: string
          version?: number
          warranty_equipment_years?: number | null
          warranty_workmanship_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_bom_header_id_fkey"
            columns: ["bom_header_id"]
            isOneToOne: false
            referencedRelation: "bom_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_engineering_revision_id_fkey"
            columns: ["engineering_revision_id"]
            isOneToOne: false
            referencedRelation: "engineering_revisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_items: {
        Row: {
          bom_item_id: string | null
          category: string | null
          created_at: string
          id: string
          item: string
          organization_id: string
          quantity: number
          rfq_id: string
          sort_order: number
          specification: string | null
          unit: string
        }
        Insert: {
          bom_item_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          item: string
          organization_id?: string
          quantity: number
          rfq_id: string
          sort_order?: number
          specification?: string | null
          unit: string
        }
        Update: {
          bom_item_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          item?: string
          organization_id?: string
          quantity?: number
          rfq_id?: string
          sort_order?: number
          specification?: string | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_items_bom_item_id_fkey"
            columns: ["bom_item_id"]
            isOneToOne: false
            referencedRelation: "bom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_vendor_quote_items: {
        Row: {
          id: string
          organization_id: string
          quantity: number
          quote_id: string
          quoted_amount: number | null
          quoted_rate: number
          rfq_item_id: string
        }
        Insert: {
          id?: string
          organization_id?: string
          quantity: number
          quote_id: string
          quoted_amount?: number | null
          quoted_rate?: number
          rfq_item_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          quantity?: number
          quote_id?: string
          quoted_amount?: number | null
          quoted_rate?: number
          rfq_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_vendor_quote_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendor_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "rfq_vendor_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendor_quote_items_rfq_item_id_fkey"
            columns: ["rfq_item_id"]
            isOneToOne: false
            referencedRelation: "rfq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_vendor_quotes: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_lead_days: number | null
          id: string
          notes: string | null
          organization_id: string
          payment_terms: string | null
          rfq_id: string
          status: string
          submitted_at: string
          updated_at: string
          valid_until: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_lead_days?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          rfq_id: string
          status?: string
          submitted_at?: string
          updated_at?: string
          valid_until?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_lead_days?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          rfq_id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          valid_until?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_vendor_quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendor_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendor_quotes_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendor_quotes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_vendors: {
        Row: {
          id: string
          organization_id: string
          responded_at: string | null
          rfq_id: string
          sent_at: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          id?: string
          organization_id?: string
          responded_at?: string | null
          rfq_id: string
          sent_at?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          id?: string
          organization_id?: string
          responded_at?: string | null
          rfq_id?: string
          sent_at?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfq_vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendors_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          awarded_quote_id: string | null
          awarded_vendor_id: string | null
          bom_header_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          awarded_quote_id?: string | null
          awarded_vendor_id?: string | null
          bom_header_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          rfq_number?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          awarded_quote_id?: string | null
          awarded_vendor_id?: string | null
          bom_header_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          rfq_number?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_awarded_quote_id_fkey"
            columns: ["awarded_quote_id"]
            isOneToOne: false
            referencedRelation: "rfq_vendor_quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_awarded_vendor_id_fkey"
            columns: ["awarded_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_bom_header_id_fkey"
            columns: ["bom_header_id"]
            isOneToOne: false
            referencedRelation: "bom_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      site_surveys: {
        Row: {
          access_notes: string | null
          cable_route: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          electrical_panel: string | null
          engineer_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          inverter_location: string | null
          lead_id: string
          meter_type: string | null
          observations: string | null
          obstruction_notes: string | null
          obstructions: Json
          organization_id: string
          orientation: string | null
          recommendations: string | null
          review_comment: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risks: string | null
          roof_length: number | null
          roof_type: string | null
          roof_width: number | null
          sanctioned_load: number | null
          shadow_observations: string | null
          site_id: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          survey_date: string
          survey_number: string
          tilt: number | null
          transformer_details: string | null
          updated_at: string
          usable_area: number | null
          working_hours: string | null
        }
        Insert: {
          access_notes?: string | null
          cable_route?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          electrical_panel?: string | null
          engineer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          inverter_location?: string | null
          lead_id: string
          meter_type?: string | null
          observations?: string | null
          obstruction_notes?: string | null
          obstructions?: Json
          organization_id?: string
          orientation?: string | null
          recommendations?: string | null
          review_comment?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risks?: string | null
          roof_length?: number | null
          roof_type?: string | null
          roof_width?: number | null
          sanctioned_load?: number | null
          shadow_observations?: string | null
          site_id?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          survey_date?: string
          survey_number?: string
          tilt?: number | null
          transformer_details?: string | null
          updated_at?: string
          usable_area?: number | null
          working_hours?: string | null
        }
        Update: {
          access_notes?: string | null
          cable_route?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          electrical_panel?: string | null
          engineer_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          inverter_location?: string | null
          lead_id?: string
          meter_type?: string | null
          observations?: string | null
          obstruction_notes?: string | null
          obstructions?: Json
          organization_id?: string
          orientation?: string | null
          recommendations?: string | null
          review_comment?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risks?: string | null
          roof_length?: number | null
          roof_type?: string | null
          roof_width?: number | null
          sanctioned_load?: number | null
          shadow_observations?: string | null
          site_id?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          survey_date?: string
          survey_number?: string
          tilt?: number | null
          transformer_details?: string | null
          updated_at?: string
          usable_area?: number | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "customer_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_surveys_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_photo_categories: {
        Row: {
          created_at: string
          id: string
          is_mandatory: boolean
          name: string
          organization_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_mandatory?: boolean
          name: string
          organization_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_mandatory?: boolean
          name?: string
          organization_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_photo_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_photos: {
        Row: {
          caption: string | null
          category_id: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          organization_id: string
          storage_path: string
          survey_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          category_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          organization_id?: string
          storage_path: string
          survey_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          category_id?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          organization_id?: string
          storage_path?: string
          survey_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_photos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "survey_photo_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_photos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_photos_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "site_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      vendor_contacts: {
        Row: {
          created_at: string
          designation: string | null
          email: string | null
          id: string
          is_primary: boolean
          name: string
          organization_id: string
          phone: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          organization_id?: string
          phone?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          organization_id?: string
          phone?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          billing_address: Json
          category: string
          created_at: string
          created_by: string | null
          gstin: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          payment_terms: string | null
          status: string
          updated_at: string
          vendor_number: string
        }
        Insert: {
          billing_address?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          gstin?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          status?: string
          updated_at?: string
          vendor_number?: string
        }
        Update: {
          billing_address?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          gstin?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          status?: string
          updated_at?: string
          vendor_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      rfq_vendor_quote_totals: {
        Row: {
          quote_id: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_vendor_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "rfq_vendor_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invite: {
        Args: { p_full_name: string; p_token: string }
        Returns: string
      }
      accept_proposal: {
        Args: { p_version_id: string }
        Returns: {
          capacity_kwp: number | null
          contract_value: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          lead_id: string | null
          organization_id: string
          pm_id: string | null
          project_number: string
          proposal_version_id: string | null
          site_id: string | null
          status: string
          target_cod: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      archive_proposal: {
        Args: { p_version_id: string }
        Returns: {
          accepted_at: string | null
          assumptions: string | null
          bom_header_id: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          engineering_revision_id: string | null
          equipment_cost: number
          exclusions: string | null
          id: string
          installation_cost: number
          is_interstate: boolean
          lead_id: string
          organization_id: string
          other_cost: number
          payment_terms: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate_percent: number
          total_amount: number | null
          updated_at: string
          version: number
          warranty_equipment_years: number | null
          warranty_workmanship_years: number | null
        }
        SetofOptions: {
          from: "*"
          to: "proposal_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      award_rfq: {
        Args: { p_quote_id: string; p_rfq_id: string }
        Returns: {
          awarded_quote_id: string | null
          awarded_vendor_id: string | null
          bom_header_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rfqs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      bootstrap_organization: {
        Args: { p_full_name: string; p_org_name: string; p_org_slug: string }
        Returns: string
      }
      cancel_rfq: {
        Args: { p_reason: string | null; p_rfq_id: string }
        Returns: {
          awarded_quote_id: string | null
          awarded_vendor_id: string | null
          bom_header_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rfqs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      convert_lead_to_customer: { Args: { p_lead_id: string }; Returns: string }
      create_bom_from_revision: {
        Args: { p_items: Json; p_revision_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          revision_id: string
          status: string
          study_id: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "bom_headers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_engineering_revision: {
        Args: { p_inputs: Json; p_outputs: Json; p_study_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          id: string
          inputs: Json
          organization_id: string
          outputs: Json
          revision_number: number
          study_id: string
        }
        SetofOptions: {
          from: "*"
          to: "engineering_revisions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
        SetofOptions: {
          from: "*"
          to: "organization_invites"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_project: {
        Args: {
          p_capacity_kwp: number | null
          p_contract_value: number | null
          p_customer_id: string
          p_lead_id: string | null
          p_pm_id: string | null
          p_site_id: string | null
          p_target_cod: string | null
        }
        Returns: {
          capacity_kwp: number | null
          contract_value: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          lead_id: string | null
          organization_id: string
          pm_id: string | null
          project_number: string
          proposal_version_id: string | null
          site_id: string | null
          status: string
          target_cod: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_proposal_version: {
        Args: {
          p_assumptions: string | null
          p_bom_header_id: string | null
          p_change_summary?: string | null
          p_discount: number
          p_engineering_revision_id: string | null
          p_equipment_cost: number
          p_exclusions: string | null
          p_installation_cost: number
          p_is_interstate: boolean
          p_lead_id: string
          p_other_cost: number
          p_payment_terms: string | null
          p_scope: string | null
          p_tax_rate_percent: number
          p_warranty_equipment_years: number | null
          p_warranty_workmanship_years: number | null
        }
        Returns: {
          accepted_at: string | null
          assumptions: string | null
          bom_header_id: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          engineering_revision_id: string | null
          equipment_cost: number
          exclusions: string | null
          id: string
          installation_cost: number
          is_interstate: boolean
          lead_id: string
          organization_id: string
          other_cost: number
          payment_terms: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate_percent: number
          total_amount: number | null
          updated_at: string
          version: number
          warranty_equipment_years: number | null
          warranty_workmanship_years: number | null
        }
        SetofOptions: {
          from: "*"
          to: "proposal_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_rfq: {
        Args: {
          p_bom_header_id: string | null
          p_due_date: string | null
          p_notes: string | null
          p_project_id: string | null
          p_title: string
          p_vendor_ids: string[]
        }
        Returns: {
          awarded_quote_id: string | null
          awarded_vendor_id: string | null
          bom_header_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rfqs"
          isOneToOne: true
          isSetofReturn: false
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
      get_or_create_engineering_study: {
        Args: { p_lead_id: string }
        Returns: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          lead_id: string
          organization_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "engineering_studies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_permission: { Args: { perm_key: string }; Returns: boolean }
      is_org_owner: { Args: never; Returns: boolean }
      next_number: {
        Args: { p_entity_type: string; p_format?: string }
        Returns: string
      }
      reject_proposal: {
        Args: { p_reason: string; p_version_id: string }
        Returns: {
          accepted_at: string | null
          assumptions: string | null
          bom_header_id: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          engineering_revision_id: string | null
          equipment_cost: number
          exclusions: string | null
          id: string
          installation_cost: number
          is_interstate: boolean
          lead_id: string
          organization_id: string
          other_cost: number
          payment_terms: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate_percent: number
          total_amount: number | null
          updated_at: string
          version: number
          warranty_equipment_years: number | null
          warranty_workmanship_years: number | null
        }
        SetofOptions: {
          from: "*"
          to: "proposal_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      seed_default_lead_sources: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      seed_default_project_milestones: {
        Args: { p_org_id: string; p_project_id: string }
        Returns: undefined
      }
      seed_default_roles: { Args: { p_org_id: string }; Returns: undefined }
      seed_default_survey_photo_categories: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      send_proposal: {
        Args: { p_version_id: string }
        Returns: {
          accepted_at: string | null
          assumptions: string | null
          bom_header_id: string | null
          change_summary: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number
          engineering_revision_id: string | null
          equipment_cost: number
          exclusions: string | null
          id: string
          installation_cost: number
          is_interstate: boolean
          lead_id: string
          organization_id: string
          other_cost: number
          payment_terms: string | null
          proposal_number: string
          rejected_at: string | null
          rejection_reason: string | null
          scope: string | null
          sent_at: string | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_rate_percent: number
          total_amount: number | null
          updated_at: string
          version: number
          warranty_equipment_years: number | null
          warranty_workmanship_years: number | null
        }
        SetofOptions: {
          from: "*"
          to: "proposal_versions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_rfq: {
        Args: { p_rfq_id: string }
        Returns: {
          awarded_quote_id: string | null
          awarded_vendor_id: string | null
          bom_header_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          rfq_number: string
          status: string
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "rfqs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_vendor_quote: {
        Args: {
          p_delivery_lead_days: number | null
          p_items: Json
          p_notes: string | null
          p_payment_terms: string | null
          p_rfq_id: string
          p_valid_until: string | null
          p_vendor_id: string
        }
        Returns: {
          created_at: string
          created_by: string | null
          delivery_lead_days: number | null
          id: string
          notes: string | null
          organization_id: string
          payment_terms: string | null
          rfq_id: string
          status: string
          submitted_at: string
          updated_at: string
          valid_until: string | null
          vendor_id: string
        }
        SetofOptions: {
          from: "*"
          to: "rfq_vendor_quotes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
