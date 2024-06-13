import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path';

const resolve = (module: string) => path.resolve(__dirname, 'node_modules', module);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    // nodePolyfills({ protocolImports: true })
  ],

  build: {
    outDir: 'dist', // Specify the output directory
  },
  resolve: {
    alias: {
      // 'https-proxy-agent': resolve('https-proxy-agent'),
      // 'node:net': 'node-stdlib-browser/esm/net.js', // Alias for the `net` module
      // Additional aliases for other Node.js modules if needed
    },
  },
  server: {
    port: 3000,
    open: true,
  }
})
