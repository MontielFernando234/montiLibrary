/** Database types for Supabase - matches the profiles table schema */

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
      };
    };
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
