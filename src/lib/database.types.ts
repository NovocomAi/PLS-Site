/**
 * Supabase Database Types
 * Auto-generated from schema - update as needed
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          email: string;
          name: string;
          address: string | null;
          phone: string | null;
          ai_access: boolean;
          status: 'active' | 'inactive' | 'archived';
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          ai_access?: boolean;
          status?: 'active' | 'inactive' | 'archived';
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          ai_access?: boolean;
          status?: 'active' | 'inactive' | 'archived';
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          category: 'identity' | 'accounting' | 'other';
          doc_kind: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          extracted_text: string | null;
          ai_summary: string | null;
          note: string | null;
          uploaded_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          category: 'identity' | 'accounting' | 'other';
          doc_kind: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          extracted_text?: string | null;
          ai_summary?: string | null;
          note?: string | null;
          uploaded_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          category?: 'identity' | 'accounting' | 'other';
          doc_kind?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          extracted_text?: string | null;
          ai_summary?: string | null;
          note?: string | null;
          uploaded_at?: string;
          processed_at?: string | null;
        };
      };
      audit_log: {
        Row: {
          id: string;
          client_id: string | null;
          action_type: string;
          summary: string;
          metadata: Json;
          performed_by: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          action_type: string;
          summary: string;
          metadata?: Json;
          performed_by?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          action_type?: string;
          summary?: string;
          metadata?: Json;
          performed_by?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      ai_consultations: {
        Row: {
          id: string;
          client_id: string | null;
          category: string;
          query: string;
          response: string;
          sources: Json;
          language: 'en' | 'pt';
          feedback_rating: number | null;
          feedback_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          category: string;
          query: string;
          response: string;
          sources?: Json;
          language?: 'en' | 'pt';
          feedback_rating?: number | null;
          feedback_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          category?: string;
          query?: string;
          response?: string;
          sources?: Json;
          language?: 'en' | 'pt';
          feedback_rating?: number | null;
          feedback_text?: string | null;
          created_at?: string;
        };
      };
      document_requests: {
        Row: {
          id: string;
          client_id: string;
          doc_kind: string;
          description: string | null;
          status: 'pending' | 'reminded' | 'received' | 'cancelled';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          last_reminder_at: string | null;
          reminder_count: number;
          reminder_channel: 'email' | 'whatsapp' | 'both' | null;
          requested_at: string;
          due_date: string | null;
          received_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          doc_kind: string;
          description?: string | null;
          status?: 'pending' | 'reminded' | 'received' | 'cancelled';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          last_reminder_at?: string | null;
          reminder_count?: number;
          reminder_channel?: 'email' | 'whatsapp' | 'both' | null;
          requested_at?: string;
          due_date?: string | null;
          received_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          doc_kind?: string;
          description?: string | null;
          status?: 'pending' | 'reminded' | 'received' | 'cancelled';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          last_reminder_at?: string | null;
          reminder_count?: number;
          reminder_channel?: 'email' | 'whatsapp' | 'both' | null;
          requested_at?: string;
          due_date?: string | null;
          received_at?: string | null;
        };
      };
      communications: {
        Row: {
          id: string;
          client_id: string;
          channel: 'email' | 'whatsapp' | 'sms';
          subject: string | null;
          body: string;
          template_id: string | null;
          status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          external_id: string | null;
          created_at: string;
          sent_at: string | null;
          delivered_at: string | null;
          read_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          channel: 'email' | 'whatsapp' | 'sms';
          subject?: string | null;
          body: string;
          template_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          external_id?: string | null;
          created_at?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          channel?: 'email' | 'whatsapp' | 'sms';
          subject?: string | null;
          body?: string;
          template_id?: string | null;
          status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
          external_id?: string | null;
          created_at?: string;
          sent_at?: string | null;
          delivered_at?: string | null;
          read_at?: string | null;
          error_message?: string | null;
        };
      };
    };
    Functions: {
      log_audit: {
        Args: {
          p_client_id: string;
          p_action_type: string;
          p_summary: string;
          p_performed_by?: string;
          p_metadata?: Json;
        };
        Returns: string;
      };
    };
  };
}

// Convenience types
export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export type AuditLog = Database['public']['Tables']['audit_log']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_log']['Insert'];

export type AIConsultation = Database['public']['Tables']['ai_consultations']['Row'];
export type AIConsultationInsert = Database['public']['Tables']['ai_consultations']['Insert'];

export type DocumentRequest = Database['public']['Tables']['document_requests']['Row'];
export type Communication = Database['public']['Tables']['communications']['Row'];
