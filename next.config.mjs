/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Vercel
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', 'lucide-react'],
  },
  
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuración de webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;