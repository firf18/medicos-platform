/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para Tailwind CSS
  transpilePackages: [],
  
  // Configuración para desarrollo
  reactStrictMode: true,
  
  // Configuración para Vercel
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', 'lucide-react'],
  },
  
  // Configuración de logging para desarrollo
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Configuración de imágenes
  images: {
    domains: ['localhost'],
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
    ignoreBuildErrors: false,
  },
  
  // Configuración para manejar mejor los errores de carga de chunks
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;