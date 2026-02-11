export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          couple_id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          couple_id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          couple_id?: string;
          display_name?: string | null;
          created_at?: string;
        };
      };
      happy_logs: {
        Row: {
          id: string;
          couple_id: string;
          user_id: string;
          occurred_at: string;
          category: string;
          note: string | null;
          points: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id?: string;
          user_id?: string;
          occurred_at: string;
          category: string;
          note?: string | null;
          points: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          user_id?: string;
          occurred_at?: string;
          category?: string;
          note?: string | null;
          points?: number;
          created_at?: string;
        };
      };
      monthly_goals: {
        Row: {
          id: string;
          couple_id: string;
          month_start: string;
          target_points: number;
          created_by: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id?: string;
          month_start: string;
          target_points: number;
          created_by?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          month_start?: string;
          target_points?: number;
          created_by?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_couple_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
