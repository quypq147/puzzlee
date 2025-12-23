// Auto-generated Supabase types for selected public tables
// Based on provided sql_public.sql and sql_auth.sql schema excerpts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          code: string | null;
          created_by: string; // profiles.id (FK)
          start_time: string | null; // timestamptz
          end_time: string | null; // timestamptz
          is_active: boolean | null;
          created_at: string | null; // timestamptz
          updated_at: string | null; // timestamptz
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          code?: string | null;
          created_by: string;
          start_time?: string | null;
          end_time?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          code?: string | null;
          created_by?: string;
          start_time?: string | null;
          end_time?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string; // auth.users.id (FK)
          first_name: string | null;
          second_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string; // timestamptz, not null default now()
          updated_at: string | null; // timestamptz
          username: string; // not null
          background_url: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          second_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          username: string;
          background_url?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          second_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          username?: string;
          background_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users"; // schema: auth
            referencedColumns: ["id"];
          }
        ];
      };
      questions: {
        Row: {
          id: string;
          event_id: string; // events.id (FK)
          author_id: string | null; // profiles.id (FK)
          content: string;
          is_anonymous: boolean | null;
          status: Database["public"]["Enums"]["question_status"] | null;
          is_pinned: boolean | null;
          is_answered: boolean | null;
          score: number | null;
          flag_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          author_id?: string | null;
          content: string;
          is_anonymous?: boolean | null;
          status?: Database["public"]["Enums"]["question_status"] | null;
          is_pinned?: boolean | null;
          is_answered?: boolean | null;
          score?: number | null;
          flag_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          author_id?: string | null;
          content?: string;
          is_anonymous?: boolean | null;
          status?: Database["public"]["Enums"]["question_status"] | null;
          is_pinned?: boolean | null;
          is_answered?: boolean | null;
          score?: number | null;
          flag_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "questions_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "questions_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      question_votes: {
        Row: {
          question_id: string; // questions.id (FK)
          user_id: string; // profiles.id (FK)
          value: 1 | -1; // constrained by CHECK (value IN (1, -1))
          created_at: string | null;
        };
        Insert: {
          question_id: string;
          user_id: string;
          value: 1 | -1;
          created_at?: string | null;
        };
        Update: {
          question_id?: string;
          user_id?: string;
          value?: 1 | -1;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "question_votes_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "question_votes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      event_role: "PARTICIPANT" | "MODERATOR" | "HOST";
      question_status: "VISIBLE" | "HIDDEN" | "FLAGGED";
      // Add other enums as needed
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  auth: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          created_at: string | null;
          updated_at: string | null;
          // other columns omitted for brevity
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper utility types for selecting table rows by name
export type Tables<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Update"];

// Relationship-aware typed helper for Supabase client (optional usage)
export type Relationship<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Relationships"];