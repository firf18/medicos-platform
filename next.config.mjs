/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Mejora el rendimiento del servidor
    optimizePackageImports: ['@radix-ui/react-dialog', 'lucide-react'],
  },
  // Configuración para manejar las rutas de autenticación
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },
  // Configuración de encabezados de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
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
  // Configuración de webpack para optimizar el bundle
  webpack: (config, { isServer }) => {
    // Configuraciones adicionales de webpack si son necesarias
    if (!isServer) {
      // Evita cargar módulos del servidor en el cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
