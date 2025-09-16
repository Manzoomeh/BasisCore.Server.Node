import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // {
  //   files: ["**/*.{js,mjs,cjs}"],
  //   plugins: { js },
  //   extends: ["js/recommended"],
  //   languageOptions: { globals: globals.browser },
  // },
  {
    plugins: { import: importPlugin },
    rules: {
      "import/no-unresolved": ["error", { caseSensitive: true }],
    },
  },
]);
