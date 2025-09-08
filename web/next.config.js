/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `http://localhost:1111/api/v1/:path*`,
      },
    ];
  },
};

export default config;
