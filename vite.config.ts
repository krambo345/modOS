import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: '/modOS-VT/',
  resolve: {
    alias: {
  "@kernel": resolve(__dirname, "src/modOS/kernel"),
}
  },
});