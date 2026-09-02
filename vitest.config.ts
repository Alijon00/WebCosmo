import { defineConfig } from "vitest/config";

// Конфиг тестов ассистента. Полифилл localStorage подключается через setupFiles
// (админ-панель хранит добавленные статьи именно там).
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/__tests__/**/*.test.ts"],
  },
});
