const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5500",
    url: "http://127.0.0.1:5500",
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:5500",
    viewport: { width: 1440, height: 900 }
  }
});
