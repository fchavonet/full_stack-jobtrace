import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "coverage",
    "dist",
  ]),
  {
    files: [
      "**/*.{js,jsx}",
    ],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      quotes: [
        "error",
        "double",
      ],
      semi: [
        "error",
        "always",
      ],
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^[A-Z_]",
        },
      ],
    },
  },
  {
    files: [
      "tests/**/*.{js,jsx}",
      "vite.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
