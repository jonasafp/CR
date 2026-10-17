import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "../types/database.types";
import { environment } from "../config/environment";

export const supabase =
  createClient<Database>(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
