import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    // 配置优化选项
    target: 'esnext', // 确保现代浏览器支持
    assetsInlineLimit: 100000000, // 增大资源内联限制
    cssCodeSplit: false, // 禁止 CSS 分离
  },
});
