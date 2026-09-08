import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy';

const REPO_NAME = '/threejs-world-effects-example/'

export default defineConfig({
  base: `${REPO_NAME}`,
  build: {
    sourcemap: true,
  },
  css: {
    devSourceMap: true,
  },
  server: {
    allowedHosts: ['.ngrok-free.dev'],
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@8thwall/engine-binary/dist',
          dest: 'xr'
        }
      ]
    })
  ],
});
