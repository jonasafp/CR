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
          company_id: string
          created_at: string
          entity_id: string | null
          entity_name: string
          id: number
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          entity_id?: string | null
          entity_name: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          entity_id?: string | null
          entity_name?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_number: string | null
          city: string | null
          complement: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          legal_name: string
          logo_url: string | null
          municipal_registration: string | null
          neighborhood: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          state_registration: string | null
          status: Database["public"]["Enums"]["registration_status"]
          street: string | null
          trade_name: string
          updated_at: string
        }
        Insert: {
          address_number?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name: string
          logo_url?: string | null
          municipal_registration?: string | null
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          street?: string | null
          trade_name: string
          updated_at?: string
        }
        Update: {
          address_number?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          legal_name?: string
          logo_url?: string | null
          municipal_registration?: string | null
          neighborhood?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          street?: string | null
          trade_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          active: boolean
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_member_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_member_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_number: string | null
          city: string | null
          company_id: string
          complement: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          status: Database["public"]["Enums"]["registration_status"]
          street: string | null
          updated_at: string
        }
        Insert: {
          address_number?: string | null
          city?: string | null
          company_id: string
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          street?: string | null
          updated_at?: string
        }
        Update: {
          address_number?: string | null
          city?: string | null
          company_id?: string
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_categories: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["registration_status"]
          transaction_type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["registration_status"]
          transaction_type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["registration_status"]
          transaction_type?: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          sale_id: string | null
          status: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_type: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          sale_id?: string | null
          status?: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_type?: Database["public"]["Enums"]["financial_transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_company_category_fkey"
            columns: ["company_id", "category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "financial_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_company_sale_fkey"
            columns: ["company_id", "sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          sale_id: string | null
          stock_after: number
          stock_before: number
          unit_cost: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          sale_id?: string | null
          stock_after: number
          stock_before: number
          unit_cost?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          sale_id?: string | null
          stock_after?: number
          stock_before?: number
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_company_product_fkey"
            columns: ["company_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "inventory_movements_company_sale_fkey"
            columns: ["company_id", "sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["registration_status"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["registration_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_negative_stock: boolean
          barcode: string | null
          category_id: string | null
          company_id: string
          created_at: string
          id: string
          minimum_stock: number
          name: string
          notes: string | null
          purchase_price: number
          sale_price: number
          sku: string | null
          status: Database["public"]["Enums"]["registration_status"]
          stock_quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          allow_negative_stock?: boolean
          barcode?: string | null
          category_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          minimum_stock?: number
          name: string
          notes?: string | null
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          allow_negative_stock?: boolean
          barcode?: string | null
          category_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          minimum_stock?: number
          name?: string
          notes?: string | null
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_category_fkey"
            columns: ["company_id", "category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          company_id: string
          created_at: string
          discount: number
          id: string
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total: number
          unit: string
          unit_price: number
        }
        Insert: {
          company_id: string
          created_at?: string
          discount?: number
          id?: string
          product_id: string
          product_name: string
          quantity: number
          sale_id: string
          total: number
          unit: string
          unit_price: number
        }
        Update: {
          company_id?: string
          created_at?: string
          discount?: number
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_company_product_fkey"
            columns: ["company_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "sale_items_company_sale_fkey"
            columns: ["company_id", "sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["company_id", "id"]
          },
        ]
      }
      sales: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          company_id: string
          completed_at: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_name: string
          discount: number
          id: string
          notes: string | null
          number: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["sale_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          company_id: string
          completed_at?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          discount?: number
          id?: string
          notes?: string | null
          number?: never
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          company_id?: string
          completed_at?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          discount?: number
          id?: string
          notes?: string | null
          number?: never
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_company_customer_fkey"
            columns: ["company_id", "customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["company_id", "id"]
          },
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          company_id: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
      company_member_role: "owner" | "admin" | "manager" | "cashier" | "viewer"
      financial_transaction_status: "pending" | "paid" | "cancelled"
      financial_transaction_type: "income" | "expense"
      inventory_movement_type:
        | "entry"
        | "exit"
        | "adjustment"
        | "sale"
        | "sale_cancellation"
      payment_method:
        | "cash"
        | "pix"
        | "credit_card"
        | "debit_card"
        | "bank_transfer"
        | "other"
      registration_status: "active" | "inactive"
      sale_status: "completed" | "cancelled"
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
    Enums: {
      company_member_role: ["owner", "admin", "manager", "cashier", "viewer"],
      financial_transaction_status: ["pending", "paid", "cancelled"],
      financial_transaction_type: ["income", "expense"],
      inventory_movement_type: [
        "entry",
        "exit",
        "adjustment",
        "sale",
        "sale_cancellation",
      ],
      payment_method: [
        "cash",
        "pix",
        "credit_card",
        "debit_card",
        "bank_transfer",
        "other",
      ],
      registration_status: ["active", "inactive"],
      sale_status: ["completed", "cancelled"],
    },
  },
} as const

