import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    strictPort: true, // Fail if port is already in use instead of trying another port
    https: false, // Frontend runs on HTTP, proxy handles HTTPS backend
    proxy: {
      // Proxy API requests to the .NET backend
      '/api': {
        target: 'https://localhost:7183', // Updated to match Visual Studio HTTPS port
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in development
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    // Serve static files from images folder
    fs: {
      allow: ['..']
    }
  },
  publicDir: 'public',
  // Define environment variables (can be overridden by .env file)
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || '/api' // Use proxy instead of direct HTTPS
    ),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
