import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["xdttqrvbmxjcmbwazjqi.supabase.co"],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
