import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kreativwp.com",
  trailingSlash: "always",
  build: {
    format: "directory"
  }
});
