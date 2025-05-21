import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;
    private currentUser = new BehaviorSubject<any>(null);

    constructor() {
        this.supabase = createClient(
            environment.supabaseUrl,
            environment.supabaseKey
        );

        // Initialize auth state
        this.supabase.auth.onAuthStateChange((event, session) => {
            try {
                this.currentUser.next(session?.user ?? null);
            } catch (error: any) {
                if (error.name !== 'NavigatorLockAcquireTimeoutError') {
                    console.error('Auth state change error:', error);
                } else {
                    console.warn('Navigator lock timeout (harmless in dev):', error);
                }
            }
        });
    }

    // Auth methods
    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    async signUp(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) throw error;
    }

    async resetPassword(email: string) {
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return data;
    }

    // Data methods
    public async getTable(tableName: string, filters?: Record<string, any>): Promise<any[]> {
        let query = this.supabase.from(tableName).select('*');

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'in' in value) {
                    query = query.in(key, value.in as readonly any[]);
                } else {
                    query = query.eq(key, value);
                }
            });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    public async getTableById(tableName: string, id: string): Promise<any> {
        const { data, error } = await this.supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    public async getTableWithRelations(
        tableName: string,
        joins: Record<string, string> = {}, // e.g., { vendor: 'vendor_id', project: 'project_id' }
        filters?: Record<string, any>
    ): Promise<any[]> {
        // Construct select fields
        const relationFields = Object.entries(joins)
            .map(([alias, foreignKey]) => `${alias}:${foreignKey}(*)`)
            .join(', ');

        const selectClause = relationFields ? `*, ${relationFields}` : '*';

        let query = this.supabase.from(tableName).select(selectClause);

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'in' in value) {
                    query = query.in(key, value.in as readonly any[]);
                } else {
                    query = query.eq(key, value);
                }
            });
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    public async createRecord(tableName: string, record: any): Promise<any> {
        const { data, error } = await this.supabase
            .from(tableName)
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async bulkInsert(tableName: string, records: any[]): Promise<any> {
        const { data, error } = await this.supabase
            .from(tableName)
            .insert(records);

        if (error) throw error;
        return data;
    }

    public async updateRecord(tableName: string, id: string, record: any): Promise<any> {
        const { data, error } = await this.supabase
            .from(tableName)
            .update(record)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async deleteRecord(tableName: string, id: string): Promise<void> {
        const { error } = await this.supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser.asObservable();
    }

    // Get current session
    async getSession() {
        const { data: { session }, error } = await this.supabase.auth.getSession();
        if (error) throw error;
        return session;
    }

    public async uploadFile(file: File): Promise<string> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await this.supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = this.supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    public async deleteFile(filePath: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from('documents')
            .remove([filePath]);

        if (error) throw error;
    }

    public async getDocumentPublicUrl(filePath: string): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days expiration

        if (error || !data || !data.signedUrl) {
            throw new Error('Failed to create signed URL');
        }

        return data.signedUrl;
    }
} 