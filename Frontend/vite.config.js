import react from '@vitejs/plugin-react';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'import-meta-resolve';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';


function reactVirtualized() {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
  return {
    name: 'my:react-virtualized',
    async configResolved() {
      const reactVirtualizedPath = path.dirname(
        fileURLToPath(resolve('react-virtualized', import.meta.url))
      );
      const brokenFilePath = path.join(
        reactVirtualizedPath,
        '..', // back to dist
        'es',
        'WindowScroller',
        'utils',
        'onScroll.js'
      );
      const brokenCode = await readFile(brokenFilePath, 'utf-8');
      const fixedCode = brokenCode.replace(WRONG_CODE, '');
      await writeFile(brokenFilePath, fixedCode);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  // Ensuring a default base path if VITE_BASE_PATH is undefined
  const basePath = env.VITE_BASE_PATH || '/';

  return {
    base: basePath,
    plugins: [
      react(),
      reactVirtualized(),
      {
        name: 'kktnn-transform-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) {
            return null;
          }
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
    ],
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Setting to 'es' ensures code-splitting compatibility
          format: 'es',
        },
      },
    },
    worker: {
      // Ensures Web Workers are built as ES modules
      format: 'es',
    },
  };
});
