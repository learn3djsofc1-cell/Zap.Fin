import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const isDisableHMR = process.env.DISABLE_HMR === 'true';
  const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      hmr: isDisableHMR
        ? false
        : replitDevDomain
          ? {
              protocol: 'wss',
              host: replitDevDomain,
              clientPort: 443,
            }
          : true,
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.local/**',
          '**/.cache/**',
          '**/.replit',
          '**/.agents/**',
          '**/tmp/**',
          '**/dist/**',
        ],
      },
    },
  };
});
