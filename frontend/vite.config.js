import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/auth": "http://localhost:8000",
      "/events": "http://localhost:8000",
      "/providers": "http://localhost:8000",
      "/templates": "http://localhost:8000",
      "/guests": "http://localhost:8000",
      "/event-items": "http://localhost:8000",
      "/user-templates": "http://localhost:8000",
      "/event-tasks": "http://localhost:8000",
      "/cities": "http://localhost:8000",
      "/provider-categories": "http://localhost:8000",
      "/stats": "http://localhost:8000",
      "/admin": "http://localhost:8000",
    },
  },
});