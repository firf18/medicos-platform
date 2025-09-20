/** @type {import('next').NextConfig} */
const nextConfig = {
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
      
      // Configuración adicional para manejar errores de chunk
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Crear un chunk para los componentes de autenticación
          auth: {
            name: 'auth',
            chunks: 'all',
            test: /[\\/]src[\\/](components|providers)[\\/](auth|providers)[\\/]/,
            priority: 20,
            enforce: true,
          },
          // Crear un chunk para las librerías principales
          vendor: {
            name: 'vendors',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            enforce: true,
          },
        },
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
  
  // Configuración para manejar mejor los errores de carga de chunks
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;