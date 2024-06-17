import react from '@vitejs/plugin-react';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),

    copy({
      targets: [
        { src: 'node_modules/charting_library/datafeeds', dest: 'public' },
        { src: 'node_modules/charting_library/charting_library', dest: 'public' },
      ],
    }),
  ],
  build: {
    outDir: 'dist', // Specify the output directory
    rollupOptions: {
      external: ['ccxt', 'https-proxy-agent'],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
