import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isGh = mode === 'gh';
  return {
    base: isGh ? '/SY-Math-Slate/' : './',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
