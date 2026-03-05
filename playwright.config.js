const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  webServer: {
    command: "python3 -m http.server 5500 --bind 127.0.0.1",
    url: "http://127.0.0.1:5500",
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    baseURL: "http://127.0.0.1:5500",
    viewport: { width: 1440, height: 900 }
  }
});
