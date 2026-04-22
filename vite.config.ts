import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js + R3F is the heaviest dependency — isolate it so the rest
          // of the app can parse and execute before the 3D scene boots
          if (id.includes('node_modules/three/')) return 'three-core';
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'three-fiber';
          // Animation library
          if (id.includes('framer-motion')) return 'framer';
          // React core + router
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router')) return 'react-vendor';
          // Charts
          if (id.includes('node_modules/d3') || id.includes('node_modules/recharts')) return 'charts';
        },
      },
    },
  },
});
