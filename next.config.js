const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack(config) {
      // debug's optional terminal-color probe is unused by the web application.
      config.resolve.alias = {
        ...config.resolve.alias,
        'supports-color': false,
      };
      return config;
    },
  }
  
  // Builds must not overwrite the chunks used by a running development server.
  module.exports = (phase) => ({
    ...nextConfig,
    distDir: process.env.NEXT_BUILD_DIST_DIR || process.env.npm_config_next_build_dir ||
      (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
  })
