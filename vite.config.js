import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBasePath(rawBasePath) {
  if (!rawBasePath) {
    return '/'
  }

  const withLeadingSlash = rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    base: normalizeBasePath(env.VITE_BASE_PATH),
  }
})
