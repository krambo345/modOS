import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
  "@kernel": resolve(__dirname, "src/modOS/kernel"),
}
  },
});