export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          stage: string
          planting_date: string
          estimated_harvest_date: string | null
          next_watering: string | null
          watering_frequency: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          stage: string
          planting_date?: string
          estimated_harvest_date?: string | null
          next_watering?: string | null
          watering_frequency?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          stage?: string
          planting_date?: string
          estimated_harvest_date?: string | null
          next_watering?: string | null
          watering_frequency?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          username: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      plant_tips: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          image_url?: string | null
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
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