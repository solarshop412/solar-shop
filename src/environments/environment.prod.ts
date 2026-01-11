export const environment = {
    production: true,
    // Production Supabase Configuration
    supabaseUrl: 'https://efmzuxsxgnhzhczhqfpn.supabase.co', // Update with production Supabase URL
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbXp1eHN4Z25oemhjemhxZnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTk3OTEsImV4cCI6MjA2ODY3NTc5MX0.7DIYIyEt-zz7nV4p7-R-daiBOVPgME0AgIfeCKUcKPM', // Update with production Supabase anon key

    // App Configuration
    appUrl: 'https://solar-shop-rose.vercel.app/', // Update this with your production domain
    adminEmail: 'adminshop@sharklasers.com',

    // Monri Payment Gateway Configuration (Production)
    monri: {
        key: 'key-f25071b2cc293b8308d5b6497a0ebbbc', // This is a TEST key - get production key from Monri
        authenticityToken: 'e37b555f1dfc10efaf075be6b1bce2cae6ecb571', // This is a TEST token - get production token from Monri
        endpoint: 'https://ipg.monri.com', // Use TEST endpoint for now
        formEndpoint: 'https://ipg.monri.com/v2/form', // Use TEST form endpoint for now
        debug: false, // Keep debug off in production
        successUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=approved',
        cancelUrl: 'https://solar-shop-rose.vercel.app/payment-callback?status=cancelled',
        redirectToSuccessUrl: true,
        terminalRedirectToSuccessUrl: true
    },

    // ERP Integration Configuration
    // Using Vercel serverless proxy to bypass SSL certificate issues
    erp: {
        baseUrl: 'https://solar-shop-rose.vercel.app/api/erp-proxy',
        authToken: '', // Auth handled by proxy
        enabled: true
    }
}; 