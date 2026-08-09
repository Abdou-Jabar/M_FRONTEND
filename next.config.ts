import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome pour l'image Docker (server.js embarqué).
  output: "standalone",
};

export default nextConfig;
