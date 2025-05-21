import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// @ts-ignore
const globalAny: any = globalThis as any;

export const supabase: SupabaseClient = globalAny.supabaseClient || createClient(
    environment.supabaseUrl,
    environment.supabaseKey
);

// Save it globally to avoid recreating during HMR
globalAny.supabaseClient = supabase;