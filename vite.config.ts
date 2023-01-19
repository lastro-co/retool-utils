import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'

type Env = Record<string, string>

const config = {
  production: (env: Env) => ({
    define: {
      'import.meta.vitest': 'undefined'
    },
    build: {
      manifest: true,
      minify: true,
      reportCompressedSize: true,
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        fileName: 'index',
        formats: ['es', 'cjs', 'umd', 'iife'],
        name: 'lastroUtils',
      },
      rollupOptions: {
        external: ['lodash', 'moment', 'numbro', 'papaparse'],
        output: {
          globals: {
            lodash: 'lodash',
            moment: 'moment',
            numbro: 'numbro',
            papaparse: 'papaparse',
          },
        },
      },
    },
  }),
  development: (env: Env) => ({
    build: {
      target: 'esnext',
    },
    server: {
      port: 3000,
    },
  }),
  test: (env: Env) => ({
    build: {
      target: 'esnext',
    },
    server: {
      port: 3000,
    },
    test: {
      coverage: {
        provider: 'c8'
      },
      includeSource: ['src/**/*.ts']
    }
  }),
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      tsconfigPaths(),
    ],
    define: {
      '__APP_VERSION__': JSON.stringify(process.env.npm_package_version)
    },
    ...config[mode](env),
  }
})
