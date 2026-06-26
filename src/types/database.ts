/** Database types for Supabase - matches the profiles and books table schemas */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role: 'reader' | 'admin';
          is_active: boolean;
          date_of_birth: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          role?: 'reader' | 'admin';
          is_active?: boolean;
          date_of_birth?: string | null;
          address?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          role?: 'reader' | 'admin';
          is_active?: boolean;
          date_of_birth?: string | null;
          address?: string | null;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          year: number | null;
          genre: string | null;
          description: string | null;
          cover_url: string | null;
          status: 'available' | 'reserved';
          is_visible: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          deleted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          year?: number | null;
          genre?: string | null;
          description?: string | null;
          cover_url?: string | null;
          status?: 'available' | 'reserved';
          is_visible?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          title?: string;
          author?: string;
          year?: number | null;
          genre?: string | null;
          description?: string | null;
          cover_url?: string | null;
          status?: 'available' | 'reserved';
          is_visible?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_user_active: {
        Args: { user_id: string };
        Returns: boolean;
      };
      get_user_role: {
        Args: { user_id: string };
        Returns: string;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type UserRole = 'reader' | 'admin';

export type Book = Database['public']['Tables']['books']['Row'];
export type BookInsert = Database['public']['Tables']['books']['Insert'];
export type BookUpdate = Database['public']['Tables']['books']['Update'];
export type BookStatus = 'available' | 'reserved';
