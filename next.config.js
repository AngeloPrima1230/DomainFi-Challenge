/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.thegraph.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Expose DOMA API variables to the client (only those safe to expose)
    NEXT_PUBLIC_DOMA_SUBGRAPH_URL: process.env.NEXT_PUBLIC_DOMA_SUBGRAPH_URL,
    DOMA_API_KEY: process.env.DOMA_API_KEY,
    NEXT_PUBLIC_DOMA_API_KEY: process.env.NEXT_PUBLIC_DOMA_API_KEY || process.env.DOMA_API_KEY,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    // Prevent client bundling errors from optional pino dependencies
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'pino-abstract-transport': false,
      'sonic-boom': false,
      'thread-stream': false,
    };
    // Use browser build of pino on the client if anything imports it
    if (!isServer) {
      config.resolve.alias['pino'] = 'pino/browser';
    }
    return config;
  },
  // Disable webpack build worker to avoid build issues
  experimental: {},
};

module.exports = nextConfig;

