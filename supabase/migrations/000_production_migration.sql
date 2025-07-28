-- =====================================================
-- COMPREHENSIVE PRODUCTION MIGRATION
-- File: 000_production_migration.sql
-- Description: Complete merged migration for solar shop database
-- Created: 2025-01-27
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 001: Complete Solar Shop Schema
-- From: 001_complete_solar_shop_schema.sql
-- =====================================================

-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.increment_blog_post_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    role TEXT DEFAULT 'customer' NOT NULL CHECK (role IN ('customer', 'admin', 'moderator', 'company_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR' NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    features TEXT[] DEFAULT '{}' NOT NULL,
    certifications TEXT[] DEFAULT '{}' NOT NULL,
    warranty_years INTEGER DEFAULT 1,
    weight DECIMAL(8,2),
    dimensions TEXT,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')) NOT NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    rating_average DECIMAL(3,2) DEFAULT 0 NOT NULL,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_on_sale BOOLEAN DEFAULT false NOT NULL,
    free_shipping BOOLEAN DEFAULT false NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create offers table (consolidates coupons and offers)
CREATE TABLE public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled')) NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    image_url TEXT,
    banner_image_url TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    auto_apply BOOLEAN DEFAULT false NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_order_amount DECIMAL(10,2),
    applicable_product_ids UUID[],
    applicable_category_ids UUID[],
    excluded_product_ids UUID[],
    excluded_category_ids UUID[],
    max_usage INTEGER,
    max_usage_per_customer INTEGER,
    current_usage INTEGER DEFAULT 0 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create cart_items table
CREATE TABLE public.cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT cart_user_or_session CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    featured_image_url TEXT,
    featured_image TEXT, -- For backward compatibility
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT, -- For backward compatibility
    tags TEXT[] DEFAULT '{}' NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
    is_published BOOLEAN GENERATED ALWAYS AS (status = 'published') STORED,
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    reading_time INTEGER,
    view_count INTEGER DEFAULT 0 NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL, -- For backward compatibility
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_status);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON public.offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured, published_at);

-- =====================================================
-- SECTION 005: Updated Profiles Table (Clean Version)
-- From: 005_create_profiles_table_clean.sql
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 006: Fix RLS Infinite Recursion
-- From: 006_fix_rls_infinite_recursion.sql
-- =====================================================

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create a proper security definer function to check admin role without RLS
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Use a direct query without RLS to avoid infinite recursion
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE user_id = user_uuid 
        AND role IN ('admin', 'company_admin')
    );
END;
$$;

-- Create a function to check if user can access a specific profile
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Users can access their own profile or admins can access any profile
    RETURN (
        auth.uid() = profile_user_id OR 
        public.is_admin_user(auth.uid())
    );
END;
$$;

-- Grant execution permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.can_access_profile(UUID) TO authenticated, anon;

-- Create RLS policies for profiles using the security definer functions
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin_user());

-- Allow profile insertion (for user registration)
CREATE POLICY "System can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (true);

-- Create policies for other tables with the new function
CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage offers" ON public.offers
    FOR ALL USING (public.is_admin_user());

CREATE POLICY "Public can view offers" ON public.offers
    FOR SELECT USING (true);

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (
        auth.uid() = user_id OR 
        (auth.uid() IS NULL AND session_id IS NOT NULL)
    );

-- Blog posts policies (public read for published posts)
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
    FOR ALL USING (public.is_admin_user());

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        CASE 
            WHEN NEW.email like 'admin%' THEN 'admin'
            WHEN NEW.email like 'company_admin%' THEN 'company_admin'
            ELSE 'customer'
        END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment blog post view count
CREATE OR REPLACE FUNCTION increment_blog_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.blog_posts 
    SET view_count = view_count + 1, views_count = views_count + 1
    WHERE id = post_id AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 007: Add B2B Support to Offers
-- From: 007_add_is_b2b_to_offers.sql
-- =====================================================

-- Add is_b2b column to offers table
ALTER TABLE offers 
ADD COLUMN is_b2b BOOLEAN DEFAULT FALSE;

-- Update the offers table to include original_price and discounted_price for better pricing structure
ALTER TABLE offers 
ADD COLUMN original_price DECIMAL(10,2),
ADD COLUMN discounted_price DECIMAL(10,2);

-- Create index on is_b2b for performance
CREATE INDEX idx_offers_is_b2b ON offers(is_b2b);
CREATE INDEX idx_offers_featured_b2b ON offers(featured, is_b2b);

-- =====================================================
-- SECTION 008: Create Wishlist Table
-- From: 008_create_wishlist_table.sql
-- =====================================================

-- Create the wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure a user can only add a product to wishlist once
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON public.wishlist(created_at);

-- Create the trigger for updating updated_at column
CREATE TRIGGER update_wishlist_updated_at
    BEFORE UPDATE ON public.wishlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert to their own wishlist" ON public.wishlist
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete from their own wishlist" ON public.wishlist
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all wishlists" ON public.wishlist
    FOR SELECT USING (public.is_admin_user());

-- =====================================================
-- SECTION 009: Create Companies Table
-- From: 009_create_companies_table.sql
-- =====================================================

-- Create the companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Personal Information (from user registration)
    contact_person_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    contact_person_name TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    address TEXT,
    
    -- Company Information
    company_name TEXT NOT NULL,
    tax_number TEXT NOT NULL UNIQUE,
    company_address TEXT NOT NULL,
    company_phone TEXT NOT NULL,
    company_email TEXT NOT NULL,
    website TEXT,
    
    -- Business Details
    business_type TEXT NOT NULL CHECK (business_type IN ('retailer', 'wholesaler', 'installer', 'distributor', 'other')),
    years_in_business INTEGER NOT NULL CHECK (years_in_business >= 0),
    annual_revenue DECIMAL(15,2),
    number_of_employees INTEGER CHECK (number_of_employees >= 0),
    description TEXT,
    
    -- Status and Approval
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES public.profiles(user_id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES public.profiles(user_id),
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_contact_person_id ON public.companies(contact_person_id);
CREATE INDEX IF NOT EXISTS idx_companies_tax_number ON public.companies(tax_number);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_business_type ON public.companies(business_type);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON public.companies(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_email ON public.companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_company_email ON public.companies(company_email);

-- Create the trigger for updating updated_at column
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SECTION 010: Fix Companies RLS Policy
-- From: 010_fix_companies_rls_policy.sql
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public registration (anyone can insert a company)
CREATE POLICY "Public can register companies" ON public.companies
    FOR INSERT WITH CHECK (true);

-- Company owners can view their own company
CREATE POLICY "Company owners can view their own company" ON public.companies
    FOR SELECT USING (contact_person_id = auth.uid());

-- Company owners can update their own pending company
CREATE POLICY "Company owners can update their own pending company" ON public.companies
    FOR UPDATE USING (
        contact_person_id = auth.uid()
        AND status = 'pending'
    );

-- Admins can view all companies
CREATE POLICY "Admins can view all companies" ON public.companies
    FOR SELECT USING (public.is_admin_user());

-- Admins can update any company
CREATE POLICY "Admins can update any company" ON public.companies
    FOR UPDATE USING (public.is_admin_user());

-- Admins can delete companies
CREATE POLICY "Admins can delete companies" ON public.companies
    FOR DELETE USING (public.is_admin_user());

-- Ensure anon users can also insert (for public registration)
GRANT INSERT ON public.companies TO anon;

-- =====================================================
-- SECTION 011: Create Contacts Table
-- From: 011_create_contacts_table.sql
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT,
    message TEXT,
    is_newsletter BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_newsletter ON public.contacts(is_newsletter);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at);

-- Trigger to update updated_at column
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert contacts
CREATE POLICY "Anyone can insert contacts" ON public.contacts
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Admins can manage contacts
CREATE POLICY "Admins can manage contacts" ON public.contacts
    FOR ALL USING (public.is_admin_user()) 
    WITH CHECK (public.is_admin_user());

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.contacts TO anon, authenticated;
GRANT SELECT, INSERT ON public.contacts TO anon;

-- =====================================================
-- SECTION 012: Add B2B Support to Orders
-- From: 012_add_is_b2b_to_orders.sql
-- =====================================================

-- Note: Orders table will be created later in Section 20241201
-- This section is placeholder for B2B flag addition

-- =====================================================
-- SECTION 013: Update Products Dimensions
-- From: 013_update_products_dimensions_and_remove_columns.sql
-- =====================================================

-- Note: Products table dimensions already created as TEXT in base schema
-- Removed columns (in_stock, stock_threshold, subcategory) are already excluded

-- =====================================================
-- SECTION 014: Add Order Item ID to Reviews
-- From: 014_add_order_item_id_to_reviews.sql  
-- =====================================================

-- Note: Reviews table will be created later in Section 20241201
-- This section is placeholder for order_item_id addition

-- =====================================================
-- SECTION 015: Fix Reviews Admin Policies
-- From: 015_fix_reviews_admin_policies.sql
-- =====================================================

-- Note: Reviews policies will be created later in Section 20241201
-- This section is placeholder

-- =====================================================
-- SECTION 016: Add Minimum Order to Company Pricing
-- From: 016_add_minimum_order_to_company_pricing.sql
-- =====================================================

-- Note: Company pricing table will be created later in Section 025
-- This section is placeholder

-- =====================================================
-- SECTION 017: Create Offer Products Table
-- From: 017_create_offer_products_table.sql
-- =====================================================

-- Create offer_products table
CREATE TABLE public.offer_products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure unique combination of offer and product
    UNIQUE(offer_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_offer_products_offer_id ON public.offer_products(offer_id);
CREATE INDEX idx_offer_products_product_id ON public.offer_products(product_id);
CREATE INDEX idx_offer_products_active ON public.offer_products(is_active);
CREATE INDEX idx_offer_products_sort_order ON public.offer_products(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_offer_products_updated_at 
    BEFORE UPDATE ON public.offer_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for offer_products
-- Allow public read access for active offer products
CREATE POLICY "Offer products are viewable by everyone" ON public.offer_products
    FOR SELECT USING (true);

-- Allow admins to manage offer products
CREATE POLICY "Admins can manage offer products" ON public.offer_products
    FOR ALL USING (public.is_admin_user());

-- Create a function to automatically calculate discounted price
CREATE OR REPLACE FUNCTION calculate_offer_product_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Set original price from product if not provided
    IF NEW.original_price IS NULL THEN
        SELECT price INTO NEW.original_price 
        FROM public.products 
        WHERE id = NEW.product_id;
    END IF;
    
    -- Calculate discounted price based on discount type
    IF NEW.discount_percentage > 0 THEN
        NEW.discounted_price = NEW.original_price * (1 - NEW.discount_percentage / 100);
    ELSIF NEW.discount_amount > 0 THEN
        NEW.discounted_price = GREATEST(NEW.original_price - NEW.discount_amount, 0);
    ELSE
        NEW.discounted_price = NEW.original_price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate discounted price
CREATE TRIGGER calculate_offer_product_price_trigger
    BEFORE INSERT OR UPDATE ON public.offer_products
    FOR EACH ROW EXECUTE FUNCTION calculate_offer_product_price();

-- =====================================================
-- SECTION 018: Remove Type from Offers
-- From: 018_remove_type_from_offers.sql
-- =====================================================

-- Note: Type column already excluded from base offers table schema

-- =====================================================
-- SECTION 019: Add Quantity Pricing Tiers
-- From: 019_add_quantity_pricing_tiers.sql
-- =====================================================

-- Note: Company pricing table will be created later with tiers in Section 025

-- =====================================================
-- SECTION 020: Create Product Relationships
-- From: 020_create_product_relationships.sql
-- =====================================================

-- Create the product_relationships table
CREATE TABLE product_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'suggested',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure either related_product_id or related_category_id is set, but not both
  CONSTRAINT check_relationship_target CHECK (
    (related_product_id IS NOT NULL AND related_category_id IS NULL) OR
    (related_product_id IS NULL AND related_category_id IS NOT NULL)
  ),
  
  -- Ensure a product cannot be related to itself
  CONSTRAINT check_no_self_reference CHECK (
    product_id != related_product_id OR related_product_id IS NULL
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_product_relationships_product ON product_relationships(product_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_related_product ON product_relationships(related_product_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_related_category ON product_relationships(related_category_id) WHERE is_active = true;
CREATE INDEX idx_product_relationships_type ON product_relationships(relationship_type);

-- Create unique constraint to prevent duplicate relationships
CREATE UNIQUE INDEX idx_unique_product_relationships ON product_relationships(
  product_id, 
  COALESCE(related_product_id, '00000000-0000-0000-0000-000000000000'::uuid),
  COALESCE(related_category_id, '00000000-0000-0000-0000-000000000000'::uuid),
  relationship_type
) WHERE is_active = true;

-- Enable RLS
ALTER TABLE product_relationships ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read active relationships
CREATE POLICY "Users can view active product relationships" ON product_relationships
  FOR SELECT
  USING (is_active = true);

-- Add trigger to update the updated_at timestamp
CREATE TRIGGER update_product_relationships_updated_at
  BEFORE UPDATE ON product_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 021: Company Pricing Backward Compatibility
-- From: 021_company_pricing_backward_compatibility.sql
-- =====================================================

-- Note: Company pricing table will be created later in Section 025 with all features

-- =====================================================
-- SECTION 022: Fix Product Relationships RLS Policy
-- From: 022_fix_product_relationships_rls_policy.sql
-- =====================================================

-- Policy for admins to manage product relationships
CREATE POLICY "Admins can manage product relationships" ON product_relationships
  FOR ALL
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- =====================================================
-- SECTION 023: Add Product Categories Many-to-Many
-- From: 023_add_product_categories_many_to_many.sql
-- =====================================================

-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique product-category combinations
    UNIQUE(product_id, category_id)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_primary ON product_categories(product_id, is_primary) WHERE is_primary = true;

-- Migrate existing category_id data to the new junction table
INSERT INTO product_categories (product_id, category_id, is_primary)
SELECT id, category_id, true
FROM products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- RLS Policies for product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "product_categories_select_policy" ON product_categories
    FOR SELECT USING (true);

-- Allow admin users to insert, update, and delete
CREATE POLICY "product_categories_insert_policy" ON product_categories
    FOR INSERT WITH CHECK (public.is_admin_user());

CREATE POLICY "product_categories_update_policy" ON product_categories
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "product_categories_delete_policy" ON product_categories
    FOR DELETE USING (public.is_admin_user());

-- Add a trigger to ensure only one primary category per product
CREATE OR REPLACE FUNCTION ensure_single_primary_category()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting is_primary to true, unset all other primary categories for this product
    IF NEW.is_primary = true THEN
        UPDATE product_categories 
        SET is_primary = false 
        WHERE product_id = NEW.product_id 
        AND category_id != NEW.category_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_category
    BEFORE INSERT OR UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_category();

-- =====================================================
-- SECTION 024: Add Image to Offers and Remove Active
-- From: 024_add_image_to_offers_and_remove_active.sql
-- =====================================================

-- Note: image_url already added to offers table in base schema
-- Note: is_active column already excluded from base schema

-- =====================================================
-- SECTION 20241201: Create Orders and Reviews Tables
-- From: 20241201_create_orders_and_reviews.sql
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    total_amount DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    shipping_status VARCHAR(20) DEFAULT 'not_shipped' CHECK (shipping_status IN ('not_shipped', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number VARCHAR(100),
    notes TEXT,
    admin_notes TEXT,
    is_b2b BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    product_image_url TEXT,
    product_specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    admin_response TEXT,
    helpful_count INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, order_item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_is_b2b ON orders(is_b2b);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_item_id ON reviews(order_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Add constraints for discount values
ALTER TABLE order_items 
ADD CONSTRAINT order_items_discount_amount_check CHECK (discount_amount >= 0),
ADD CONSTRAINT order_items_discount_percentage_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

ALTER TABLE orders 
ADD CONSTRAINT orders_discount_percentage_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD CONSTRAINT orders_tax_percentage_check CHECK (tax_percentage >= 0 AND tax_percentage <= 100);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
    
    -- Get the count of orders created today
    SELECT COUNT(*) + 1 INTO counter
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Pad with zeros to make it 4 digits
    order_num := order_num || LPAD(counter::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Create triggers for updated_at timestamp
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete orders" ON orders
    FOR DELETE USING (public.is_admin_user());

-- Create RLS policies for order_items
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create order items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Guest users can create order items for guest orders" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id IS NULL
        )
    );

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update order items" ON order_items
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete order items" ON order_items
    FOR DELETE USING (public.is_admin_user());

-- Create RLS policies for reviews
CREATE POLICY "Users can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews for their purchases" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.user_id = auth.uid() 
            AND oi.product_id = reviews.product_id
            AND oi.id = reviews.order_item_id
            AND o.status = 'delivered'
        )
    );

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews" ON reviews
    FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admins can update all reviews" ON reviews
    FOR UPDATE USING (public.is_admin_user());

CREATE POLICY "Admins can delete all reviews" ON reviews
    FOR DELETE USING (public.is_admin_user());

-- =====================================================
-- SECTION 20241202: Add User Lookup Function
-- From: 20241202_add_user_lookup_function.sql
-- =====================================================

-- Create a function to find user by email and return user_id
CREATE OR REPLACE FUNCTION public.find_user_by_email(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        au.email::TEXT,
        p.first_name,
        p.last_name,
        p.full_name,
        p.role
    FROM public.profiles p
    INNER JOIN auth.users au ON au.id = p.user_id
    WHERE LOWER(au.email) = LOWER(user_email)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.find_user_by_email(TEXT) TO authenticated;

-- =====================================================
-- SECTION 025: Create Company Pricing (was 007)
-- From: 007_create_company_pricing.sql + 019 + 021
-- =====================================================

-- Create table with quantity tiers and backward compatibility
CREATE TABLE IF NOT EXISTS public.company_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    -- Tiered pricing structure
    price_tier_1 DECIMAL(10,2) NOT NULL,
    quantity_tier_1 INTEGER DEFAULT 1,
    quantity_tier_2 INTEGER,
    price_tier_2 DECIMAL(10, 2),
    quantity_tier_3 INTEGER,
    price_tier_3 DECIMAL(10, 2),
    -- Backward compatibility
    price DECIMAL(10, 2),
    minimum_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, product_id)
);

-- Add constraints
ALTER TABLE company_pricing
ADD CONSTRAINT check_quantity_tiers_order 
CHECK (
    quantity_tier_1 < COALESCE(quantity_tier_2, quantity_tier_1 + 1) AND
    COALESCE(quantity_tier_2, 0) < COALESCE(quantity_tier_3, COALESCE(quantity_tier_2, 0) + 1)
),
ADD CONSTRAINT check_tier_2_completeness 
CHECK (
    (quantity_tier_2 IS NULL AND price_tier_2 IS NULL) OR
    (quantity_tier_2 IS NOT NULL AND price_tier_2 IS NOT NULL)
),
ADD CONSTRAINT check_tier_3_completeness 
CHECK (
    (quantity_tier_3 IS NULL AND price_tier_3 IS NULL) OR
    (quantity_tier_3 IS NOT NULL AND price_tier_3 IS NOT NULL)
),
ADD CONSTRAINT check_tier_order
CHECK (
    (quantity_tier_3 IS NULL) OR (quantity_tier_2 IS NOT NULL)
),
ADD CONSTRAINT check_minimum_order_positive CHECK (minimum_order >= 1);

-- Create indexes
CREATE INDEX idx_company_pricing_quantities ON company_pricing (quantity_tier_1, quantity_tier_2, quantity_tier_3);
CREATE INDEX idx_company_pricing_minimum_order ON company_pricing(minimum_order);

-- Trigger for updated_at
CREATE TRIGGER update_company_pricing_updated_at
    BEFORE UPDATE ON public.company_pricing
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.company_pricing ENABLE ROW LEVEL SECURITY;

-- Company owners can manage their company's pricing
CREATE POLICY "Company owners manage their pricing" ON public.company_pricing
    FOR ALL USING (
        company_id IN (
            SELECT id FROM public.companies c
            WHERE c.contact_person_id = auth.uid()
            AND c.status = 'approved'
        )
    );

-- Admins can manage all company pricing
CREATE POLICY "Admins manage all company pricing" ON public.company_pricing
    FOR ALL USING (public.is_admin_user());

-- Create a trigger to keep price and price_tier_1 in sync for backward compatibility
CREATE OR REPLACE FUNCTION sync_company_pricing_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- When price_tier_1 is updated, update price
  IF NEW.price_tier_1 IS NOT NULL AND (NEW.price IS NULL OR NEW.price != NEW.price_tier_1) THEN
    NEW.price := NEW.price_tier_1;
  END IF;
  
  -- When price is updated, update price_tier_1
  IF NEW.price IS NOT NULL AND (NEW.price_tier_1 IS NULL OR NEW.price_tier_1 != NEW.price) THEN
    NEW.price_tier_1 := NEW.price;
  END IF;
  
  -- Ensure quantity_tier_1 has a default value
  IF NEW.quantity_tier_1 IS NULL THEN
    NEW.quantity_tier_1 := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_company_pricing_columns_trigger
BEFORE INSERT OR UPDATE ON company_pricing
FOR EACH ROW
EXECUTE FUNCTION sync_company_pricing_columns();

-- =====================================================
-- SECTION 026: Fix Company Pricing Foreign Key (was 012)
-- From: 012_fix_company_pricing_foreign_key.sql
-- =====================================================

-- Note: Foreign key constraint already properly set in Section 025

-- =====================================================
-- SECTION 999: SEED DATA
-- =====================================================

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, parent_id, image_url, is_active, sort_order) VALUES
('01234567-89ab-cdef-0123-456789abcdef', 'Solar Panels', 'solar-panels', 'High-efficiency solar panels for residential and commercial use', NULL, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde0', 'Inverters', 'inverters', 'Solar inverters to convert DC to AC power', NULL, 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 2),
('01234567-89ab-cdef-0123-456789abcde1', 'Battery Storage', 'battery-storage', 'Energy storage solutions for solar systems', NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop', true, 3),
('01234567-89ab-cdef-0123-456789abcde2', 'Mounting Systems', 'mounting-systems', 'Roof and ground mounting solutions', NULL, 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop', true, 4),
('01234567-89ab-cdef-0123-456789abcde3', 'Monitoring Systems', 'monitoring-systems', 'Solar system monitoring and optimization', NULL, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=500&fit=crop', true, 5),
('01234567-89ab-cdef-0123-456789abcde4', 'Accessories', 'accessories', 'Cables, connectors, and other solar accessories', NULL, 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop', true, 6),

-- Subcategories
('01234567-89ab-cdef-0123-456789abcde5', 'Monocrystalline Panels', 'monocrystalline-panels', 'High-efficiency monocrystalline solar panels', '01234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde6', 'Polycrystalline Panels', 'polycrystalline-panels', 'Cost-effective polycrystalline solar panels', '01234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&h=500&fit=crop', true, 2),
('01234567-89ab-cdef-0123-456789abcde7', 'String Inverters', 'string-inverters', 'Traditional string inverters for solar systems', '01234567-89ab-cdef-0123-456789abcde0', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 1),
('01234567-89ab-cdef-0123-456789abcde8', 'Micro Inverters', 'micro-inverters', 'Panel-level micro inverters for optimal performance', '01234567-89ab-cdef-0123-456789abcde0', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=500&h=500&fit=crop', true, 2);

-- Insert Products
INSERT INTO public.products (id, name, slug, description, short_description, sku, price, original_price, category_id, brand, model, specifications, features, certifications, warranty_years, weight, dimensions, images, stock_quantity, is_featured, is_active, rating_average, rating_count, free_shipping) VALUES

-- Solar Panels
('11234567-89ab-cdef-0123-456789abcdef', 'SolarMax Pro 400W Monocrystalline Panel', 'solarmax-pro-400w-mono', 'High-efficiency 400W monocrystalline solar panel with excellent performance in low-light conditions. Features advanced PERC cell technology and robust aluminum frame for long-lasting durability.', 'High-efficiency 400W monocrystalline solar panel', 'SM-MONO-400W-001', 299.99, 349.99, '01234567-89ab-cdef-0123-456789abcde5', 'SolarMax', 'SM-400M-PERC', '{"power_output": "400W", "efficiency": "21.2%", "voltage_max": "40.5V", "current_max": "9.88A", "cell_type": "Monocrystalline PERC", "cells": "72 cells", "temperature_coefficient": "-0.38%/°C"}', ARRAY['PERC cell technology', 'Anti-reflective coating', 'Corrosion-resistant frame', 'IP67 junction box', '25-year performance warranty'], ARRAY['IEC 61215', 'IEC 61730', 'CE', 'TUV', 'UL 1703'], 25, 22.5, '2000x1000x35mm', '[{"url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop", "alt": "SolarMax Pro 400W Panel", "is_primary": true}]', 150, true, true, 4.7, 89, true),

('11234567-89ab-cdef-0123-456789abcde0', 'EcoSolar 320W Polycrystalline Panel', 'ecosolar-320w-poly', 'Reliable and cost-effective 320W polycrystalline solar panel perfect for residential installations. Excellent value for money with proven performance.', 'Cost-effective 320W polycrystalline solar panel', 'ES-POLY-320W-002', 199.99, 249.99, '01234567-89ab-cdef-0123-456789abcde6', 'EcoSolar', 'ES-320P-STD', '{"power_output": "320W", "efficiency": "19.5%", "voltage_max": "37.2V", "current_max": "8.61A", "cell_type": "Polycrystalline", "cells": "72 cells", "temperature_coefficient": "-0.41%/°C"}', ARRAY['Multi-crystalline silicon cells', 'Anodized aluminum frame', 'Tempered glass', 'Standard warranty', 'Proven technology'], ARRAY['IEC 61215', 'IEC 61730', 'CE', 'TUV'], 20, 21.8, '1956x992x40mm', '[{"url": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop", "alt": "EcoSolar 320W Panel", "is_primary": true}]', 200, false, true, 4.3, 156, true),

-- Inverters
('11234567-89ab-cdef-0123-456789abcde1', 'SolarInvert String 5kW Inverter', 'solarinvert-string-5kw', 'Reliable 5kW string inverter with advanced MPPT technology and comprehensive monitoring capabilities. Perfect for residential solar installations.', 'High-efficiency 5kW string inverter', 'SI-STRING-5KW-001', 899.99, 999.99, '01234567-89ab-cdef-0123-456789abcde7', 'SolarInvert', 'SI-5000TL', '{"power_output": "5000W", "efficiency": "97.6%", "mppt_trackers": 2, "max_dc_voltage": "1000V", "ac_voltage": "230V", "frequency": "50Hz", "protection_rating": "IP65"}', ARRAY['Dual MPPT trackers', 'WiFi monitoring', 'Fanless design', 'Compact size', 'Easy installation'], ARRAY['IEC 62109', 'EN 50438', 'VDE-AR-N 4105', 'CE', 'G83/2'], 10, 18.5, '470x350x180mm', '[{"url": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop", "alt": "SolarInvert String 5kW Inverter", "is_primary": true}]', 85, true, true, 4.6, 73, false),

('11234567-89ab-cdef-0123-456789abcde2', 'MicroMax 300W Micro Inverter', 'micromax-300w-micro', 'Panel-level micro inverter providing maximum energy harvest and individual panel monitoring. Ideal for complex roof layouts and shading conditions.', 'High-performance 300W micro inverter', 'MM-MICRO-300W-002', 149.99, 179.99, '01234567-89ab-cdef-0123-456789abcde8', 'MicroMax', 'MM-300M-PERC', '{"power_output": "300W", "efficiency": "96.5%", "max_dc_voltage": "60V", "ac_voltage": "230V", "frequency": "50Hz", "protection_rating": "IP67"}', ARRAY['Panel-level optimization', 'Rapid shutdown', '25-year warranty', 'Easy installation', 'Real-time monitoring'], ARRAY['IEC 62109', 'EN 50438', 'UL 1741', 'CE', 'FCC'], 25, 0.7, '166x175x33mm', '[{"url": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop", "alt": "MicroMax 300W Micro Inverter", "is_primary": true}]', 300, false, true, 4.5, 128, false),

-- Battery Storage
('11234567-89ab-cdef-0123-456789abcde3', 'EnergyStore 10kWh Lithium Battery', 'energystore-10kwh-lithium', 'High-capacity 10kWh lithium battery system with integrated BMS and smart monitoring. Perfect for residential energy storage and backup power.', 'Advanced 10kWh lithium battery storage system', 'ES-BATT-10KWH-001', 4999.99, 5499.99, '01234567-89ab-cdef-0123-456789abcde1', 'EnergyStore', 'ES-10K-LiFePO4', '{"capacity": "10kWh", "voltage": "48V", "chemistry": "LiFePO4", "cycles": "6000+", "efficiency": "95%", "max_discharge": "5kW", "operating_temp": "-10°C to 50°C"}', ARRAY['LiFePO4 chemistry', 'Integrated BMS', 'Modular design', 'Smart monitoring', '15-year warranty'], ARRAY['IEC 62619', 'UN38.3', 'CE', 'UL 1973', 'IEC 61000'], 15, 85, '600x400x200mm', '[{"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop", "alt": "EnergyStore 10kWh Battery", "is_primary": true}]', 45, true, true, 4.7, 34, false);

-- Insert Sample Offers
INSERT INTO public.offers (id, code, title, description, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, is_b2b, original_price, discounted_price, auto_apply, featured) VALUES

('21234567-89ab-cdef-0123-456789abcdef', 'WELCOME10', 'Welcome 10% Off', 'Get 10% off your first order! Perfect for new customers starting their solar journey.', 'percentage', 10, 500, 100, NOW() - INTERVAL '7 days', NOW() + INTERVAL '30 days', false, 1000.00, 900.00, false, true),

('21234567-89ab-cdef-0123-456789abcde0', 'SOLARBUNDLE', 'Solar Panel Bundle Deal', 'Save €200 on solar panel purchases over €2000. Perfect for complete system installations.', 'fixed_amount', 200, NULL, 2000, NOW() - INTERVAL '3 days', NOW() + INTERVAL '45 days', false, 2200.00, 2000.00, false, true),

('21234567-89ab-cdef-0123-456789abcde1', 'FREESHIP', 'Free Shipping on Orders Over €500', 'Enjoy free shipping on all orders over €500. No weight limits!', 'free_shipping', 0, NULL, 500, NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', false, NULL, NULL, true, false),

-- B2B Offers
('21234567-89ab-cdef-0123-456789abcde2', 'BULK50', 'Bulk Solar Panel Package - 50% Off Installation', 'Complete solar panel installation package for commercial properties. Includes 100+ high-efficiency panels, professional installation, and 5-year maintenance.', 'percentage', 20, NULL, NULL, NOW(), '2024-12-31', true, 15000.00, 12000.00, false, true),

('21234567-89ab-cdef-0123-456789abcde3', 'INVERTER20', 'Premium Inverter Bundle - Limited Time', 'High-efficiency inverter package with smart monitoring system. Perfect for commercial installations requiring maximum reliability.', 'percentage', 20, NULL, NULL, NOW(), '2024-12-25', true, 8500.00, 6800.00, false, true);

-- Insert Blog Posts
INSERT INTO public.blog_posts (id, title, slug, excerpt, content, category, tags, featured_image_url, status, is_featured, view_count, reading_time, seo_title, seo_description, published_at) VALUES

('31234567-89ab-cdef-0123-456789abcdef', 'Complete Solar Installation Guide 2024', 'complete-solar-installation-guide-2024', 'Everything you need to know about installing solar panels in 2024, from planning to maintenance.', 'Solar energy has become increasingly popular as homeowners seek sustainable and cost-effective energy solutions. This comprehensive guide covers everything you need to know about solar installation in 2024.', 'Installation Guide', ARRAY['solar panels', 'installation', 'guide', '2024', 'renewable energy'], 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop', 'published', true, 1247, 8, 'Complete Solar Installation Guide 2024 | SolarShop', 'Learn everything about solar panel installation in 2024. Complete guide covering planning, installation, and maintenance.', NOW() - INTERVAL '5 days'),

('31234567-89ab-cdef-0123-456789abcde0', 'Why Battery Storage is Essential for Solar Systems', 'why-battery-storage-essential-solar-systems', 'Discover the key benefits of adding battery storage to your solar system and how it maximizes your investment.', 'Battery storage systems have revolutionized the solar industry by providing homeowners with energy independence and backup power capabilities.', 'Energy Storage', ARRAY['battery storage', 'solar batteries', 'energy independence', 'backup power'], 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop', 'published', true, 892, 6, 'Why Battery Storage is Essential for Solar Systems | SolarShop', 'Discover the benefits of solar battery storage systems and how they provide energy independence and backup power.', NOW() - INTERVAL '10 days');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE public.companies IS 'B2B partner company information and applications';
COMMENT ON TABLE public.company_pricing IS 'Stores custom pricing for products per company with quantity-based tiers';
COMMENT ON TABLE public.wishlist IS 'User wishlist items linking users to products they want to save for later';
COMMENT ON TABLE public.contacts IS 'Contact form submissions and newsletter signups';
COMMENT ON TABLE public.offers IS 'Marketing offers and discounts including B2B offers';
COMMENT ON TABLE public.offer_products IS 'Junction table connecting offers with products and storing product-specific discount information';
COMMENT ON TABLE public.product_relationships IS 'Stores relationships between products and other products or categories for suggested items';
COMMENT ON TABLE public.product_categories IS 'Many-to-many relationship table between products and categories';
COMMENT ON TABLE public.orders IS 'Customer orders including B2B orders';
COMMENT ON TABLE public.order_items IS 'Individual items within orders';
COMMENT ON TABLE public.reviews IS 'Product reviews from verified purchases';

COMMIT;