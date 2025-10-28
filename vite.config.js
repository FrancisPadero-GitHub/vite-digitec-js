import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./", // this is for the vite to serve and show the image or something

  // so i don't have to wait for 5 mins every time i import an icon haha 
  // resolves the [vite] optimized deps changed, reloading...
  optimizeDeps: {
    include: [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
    persist: true, // keep optimization cache across restarts
  },

  // optional but can speed up hot reloads
  server: {
    fs: {
      strict: false,
    },
  },
});

