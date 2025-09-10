/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.thegraph.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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

