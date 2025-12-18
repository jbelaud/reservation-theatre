import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisation de la compilation
  experimental: {
    // Optimiser les imports des packages volumineux
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-accordion',
      '@radix-ui/react-popover',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'date-fns',
    ],
  },
  // Désactiver les source maps en dev pour plus de rapidité (optionnel)
  // productionBrowserSourceMaps: false,
};

export default nextConfig;
