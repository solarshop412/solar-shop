import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Database } from '../shared/models/database.model';

// @ts-ignore
const globalAny: any = globalThis as any;

export const supabase: SupabaseClient<Database> = globalAny.supabaseClient || createClient<Database>(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Save it globally to avoid recreating during HMR
globalAny.supabaseClient = supabase;