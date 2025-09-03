/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `http://localhost:1111/api/:path*`,
        },
      ],
      fallback: [
        {
          source: "/api/:path*/",
          destination: `http://localhost:1111/api/:path*`,
        },
      ],
    };
  },
};

export default config;
