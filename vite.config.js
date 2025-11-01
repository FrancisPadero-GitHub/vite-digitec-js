import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // so i don't have to wait for 5 mins every time i import an icon haha 
  // resolves the [vite] optimized deps changed, reloading...
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "@tanstack/react-query",
      "react-hook-form",
      "dayjs",
    ],
    persist: true, // keep optimization cache across restarts
  },

  // Performance optimizations
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          forms: ['react-hook-form'],
          utils: ['dayjs', 'date-fns'],
        },
      },
    },
  },

  // optional but can speed up hot reloads
  server: {
    fs: {
      strict: false,
    },
    // Improve HMR performance
    hmr: {
      overlay: false, // Disable error overlay that can cause performance issues
    },
  },
});

