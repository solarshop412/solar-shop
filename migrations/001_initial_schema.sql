-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
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
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD' NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
    subcategory TEXT,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    specifications JSONB DEFAULT '[]'::jsonb NOT NULL,
    features TEXT[] DEFAULT '{}' NOT NULL,
    in_stock BOOLEAN DEFAULT true NOT NULL,
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')) NOT NULL,
    weight DECIMAL(8,2),
    dimensions JSONB,
    warranty_duration INTEGER,
    warranty_unit TEXT CHECK (warranty_unit IN ('months', 'years')),
    warranty_description TEXT,
    energy_rating TEXT,
    energy_efficiency DECIMAL(5,2),
    power_output DECIMAL(10,2),
    power_unit TEXT CHECK (power_unit IN ('W', 'kW', 'MW')),
    certifications TEXT[] DEFAULT '{}' NOT NULL,
    installation_required BOOLEAN DEFAULT false NOT NULL,
    free_shipping BOOLEAN DEFAULT false NOT NULL,
    shipping_cost DECIMAL(8,2),
    estimated_delivery_days INTEGER DEFAULT 7 NOT NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    rating_average DECIMAL(3,2) DEFAULT 0 NOT NULL,
    rating_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_on_sale BOOLEAN DEFAULT false NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create offers table (consolidates coupons and offers)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'percentage_discount', 'fixed_amount_discount', 'buy_x_get_y', 
        'free_shipping', 'bundle_deal', 'flash_sale', 'seasonal_sale', 
        'clearance', 'loyalty_reward', 'referral_bonus', 'first_time_customer', 'bulk_discount'
    )),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'expired', 'cancelled')) NOT NULL,
    priority INTEGER DEFAULT 0 NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    image_url TEXT,
    banner_image_url TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    coupon_code TEXT UNIQUE,
    auto_apply BOOLEAN DEFAULT false NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_order_amount DECIMAL(10,2),
    applicable_product_ids UUID[],
    applicable_category_ids UUID[],
    excluded_product_ids UUID[],
    excluded_category_ids UUID[],
    max_total_usage INTEGER,
    max_usage_per_customer INTEGER,
    current_usage INTEGER DEFAULT 0 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
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
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}' NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}' NOT NULL,
    reading_time INTEGER,
    view_count INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON public.products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_coupon_code ON public.offers(coupon_code);
CREATE INDEX IF NOT EXISTS idx_offers_start_date ON public.offers(start_date);
CREATE INDEX IF NOT EXISTS idx_offers_end_date ON public.offers(end_date);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (is_active = true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (is_active = true);

-- Offers policies (public read for active offers)
CREATE POLICY "Active offers are viewable by everyone" ON public.offers
    FOR SELECT USING (is_active = true AND status = 'active');

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
    FOR SELECT USING (status = 'published');

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'firstName', ''),
        COALESCE(NEW.raw_user_meta_data->>'lastName', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data

-- Sample categories
INSERT INTO public.categories (name, slug, description, is_active, sort_order) VALUES
('Solar Panels', 'solar-panels', 'High-efficiency solar panels for residential and commercial use', true, 1),
('Inverters', 'inverters', 'Solar inverters to convert DC to AC power', true, 2),
('Batteries', 'batteries', 'Energy storage solutions for solar systems', true, 3),
('Mounting Systems', 'mounting-systems', 'Roof and ground mounting solutions', true, 4),
('Monitoring', 'monitoring', 'Solar system monitoring and optimization tools', true, 5);

-- Sample products
INSERT INTO public.products (
    name, description, short_description, price, original_price, sku, brand, category_id,
    images, specifications, features, stock_quantity, power_output, power_unit,
    energy_efficiency, certifications, installation_required, free_shipping,
    estimated_delivery_days, tags, is_featured, is_on_sale
) VALUES
(
    'SolarMax Pro 400W Panel',
    'High-efficiency monocrystalline solar panel with 21.5% efficiency rating. Perfect for residential installations with limited roof space.',
    'Premium 400W solar panel with industry-leading efficiency',
    299.99, 349.99, 'SM-PRO-400W', 'SolarMax',
    (SELECT id FROM public.categories WHERE slug = 'solar-panels' LIMIT 1),
    '[{"id": "1", "url": "/images/solarmax-pro-400w.jpg", "alt": "SolarMax Pro 400W Panel", "is_primary": true, "order": 1, "type": "main"}]'::jsonb,
    '[{"name": "Power Output", "value": "400", "unit": "W", "category": "Performance", "order": 1}, {"name": "Efficiency", "value": "21.5", "unit": "%", "category": "Performance", "order": 2}]'::jsonb,
    ARRAY['High efficiency', 'Weather resistant', '25-year warranty', 'Easy installation'],
    150, 400, 'W', 21.5,
    ARRAY['IEC 61215', 'IEC 61730', 'UL 1703'],
    true, true, 5,
    ARRAY['solar', 'panel', 'residential', 'high-efficiency'],
    true, true
),
(
    'PowerInvert 5000W String Inverter',
    'Advanced string inverter with MPPT technology and WiFi monitoring. Suitable for residential solar installations up to 5kW.',
    'Smart 5kW string inverter with monitoring',
    899.99, null, 'PI-5000W-STR', 'PowerInvert',
    (SELECT id FROM public.categories WHERE slug = 'inverters' LIMIT 1),
    '[{"id": "1", "url": "/images/powerinvert-5000w.jpg", "alt": "PowerInvert 5000W Inverter", "is_primary": true, "order": 1, "type": "main"}]'::jsonb,
    '[{"name": "Max Power", "value": "5000", "unit": "W", "category": "Performance", "order": 1}, {"name": "Efficiency", "value": "97.5", "unit": "%", "category": "Performance", "order": 2}]'::jsonb,
    ARRAY['MPPT technology', 'WiFi monitoring', 'Weather resistant', '10-year warranty'],
    75, 5000, 'W', 97.5,
    ARRAY['UL 1741', 'IEEE 1547', 'FCC Part 15'],
    true, true, 7,
    ARRAY['inverter', 'string', 'residential', 'monitoring'],
    true, false
);

-- Sample offers
INSERT INTO public.offers (
    title, description, short_description, type, status, priority, featured,
    discount_type, discount_value, coupon_code, auto_apply, min_order_amount,
    start_date, end_date, is_active
) VALUES
(
    'Summer Solar Sale',
    'Get 15% off all solar panels during our summer promotion. Perfect time to start your solar journey!',
    '15% off all solar panels',
    'seasonal_sale', 'active', 1, true,
    'percentage', 15.00, 'SUMMER15', false, 500.00,
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', true
),
(
    'Free Shipping on Orders Over $1000',
    'Enjoy free shipping on all orders over $1000. No code needed, discount applied automatically.',
    'Free shipping on orders over $1000',
    'free_shipping', 'active', 2, false,
    'free_shipping', 0.00, null, true, 1000.00,
    NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', true
);

-- Sample blog posts
INSERT INTO public.blog_posts (
    title, slug, content, excerpt, author_id, tags, status, published_at,
    seo_title, seo_description, reading_time, is_featured
) VALUES
(
    'Complete Guide to Solar Panel Installation',
    'complete-guide-solar-panel-installation',
    'Solar panel installation is a significant investment that can provide decades of clean energy...',
    'Everything you need to know about installing solar panels on your home.',
    (SELECT id FROM public.profiles LIMIT 1),
    ARRAY['solar', 'installation', 'guide', 'residential'],
    'published', NOW() - INTERVAL '5 days',
    'Complete Guide to Solar Panel Installation | Solar Shop',
    'Learn everything about solar panel installation with our comprehensive guide. Tips, costs, and best practices.',
    8, true
),
(
    'Top 5 Benefits of Solar Energy',
    'top-5-benefits-solar-energy',
    'Solar energy offers numerous benefits for homeowners and businesses...',
    'Discover the top benefits of switching to solar energy for your home.',
    (SELECT id FROM public.profiles LIMIT 1),
    ARRAY['solar', 'benefits', 'energy', 'savings'],
    'published', NOW() - INTERVAL '10 days',
    'Top 5 Benefits of Solar Energy | Solar Shop',
    'Explore the key benefits of solar energy including cost savings, environmental impact, and energy independence.',
    5, false
); 