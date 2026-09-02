import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { createAskMiddleware } from './server/ask'

// ---------------------------------------------------------------------------
//  Плагин резервного контура: поднимает POST /api/ask в dev и preview.
//  Ключ GEMINI_API_KEY читается из .env на стороне Node и в браузер не уходит.
//  В продакшене (статичный GitHub Pages) эндпоинта нет — клиент тихо
//  откатывается на локальную базу знаний (см. src/lib/assistant/external.ts).
// ---------------------------------------------------------------------------
function apiAskPlugin(): PluginOption {
  const middleware = createAskMiddleware()
  return {
    name: 'api-ask-endpoint',
    configureServer(server) {
      server.middlewares.use('/api/ask', middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ask', middleware)
    },
  }
}

export default defineConfig(({ mode }) => {
  // Пробрасываем переменные из .env (в т.ч. без префикса VITE_) в process.env,
  // чтобы серверный middleware увидел GEMINI_API_KEY.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY

  return {
    plugins: [react(), apiAskPlugin()],
    base: '/issTJM/', // Строго по новому названию
    build: {
      chunkSizeWarningLimit: 900,
      // Route-level React.lazy drives the splitting; three.js/@react-three land
      // in the async planetarium chunk automatically (no homepage preload).
    },
  }
})
