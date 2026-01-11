-- Allow anonymous users to read settings
-- Migration: 037_allow_anon_read_settings.sql
-- Description: Adds RLS policy to allow anonymous (guest) users to read settings
-- This is needed so guest checkout can check if ordering is enabled

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous users to read settings" ON settings;

-- Create policy to allow anonymous users to read settings
CREATE POLICY "Allow anonymous users to read settings"
    ON settings
    FOR SELECT
    TO anon
    USING (true);

-- Add helpful comment
COMMENT ON POLICY "Allow anonymous users to read settings" ON settings IS
    'Anonymous (guest) users can read settings to check if ordering is enabled';

-- =====================================================
-- Storage Policies for solar-shop bucket
-- =====================================================
-- These policies allow file uploads for category images and other assets

-- Drop existing storage policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- Allow authenticated users to upload files to the solar-shop bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'solar-shop');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'solar-shop');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'solar-shop');

-- Allow public read access to all files in the bucket
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'solar-shop');
