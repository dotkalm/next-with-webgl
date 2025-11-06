// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Turbopack configuration (default in Next.js 16)
  turbopack: {
    rules: {
      // Load shader files as raw text
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vs': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.fs': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  
  // Keep webpack config as fallback if you explicitly run with --webpack
  webpack: (config) => {
    // Add rule for shader files
    config.module.rules.push({
      test: /\.(glsl|vert|frag|vs|fs)$/,
      use: 'raw-loader',
    });
    return config;
  },
};

export default nextConfig;