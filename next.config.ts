import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "https://dashboard.aspirelearning.app/api/proxy/ds/:path*",
        destination: "https://api-dev.landau.app/v1/ds/:path*",
      },
    ];
  },
};

export default nextConfig;
