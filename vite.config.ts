import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/issTJM/', // Строго по новому названию
  build: {
    chunkSizeWarningLimit: 900,
    // Route-level React.lazy drives the splitting; three.js/@react-three land
    // in the async planetarium chunk automatically (no homepage preload).
  },
})
