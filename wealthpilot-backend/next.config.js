/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow Anthropic API calls from server-side routes
  serverRuntimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Expose only safe public vars to the browser
  publicRuntimeConfig: {
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Silence noisy Plaid/Supabase peer dep warnings during build
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
