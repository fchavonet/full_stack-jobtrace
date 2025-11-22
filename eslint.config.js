import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginImport from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module"
      },
    },
    plugins: {
      import: eslintPluginImport,
    },
    rules: {
      "eqeqeq": ["error", "always"],
      "import/order": [
        "error",
        {
          "alphabetize": { "order": "asc", "caseInsensitive": true },
          "newlines-between": "always",
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ]
        }
      ],
      "indent": ["error", 2],
      "no-multiple-empty-lines": ["error", { "max": 1 }],
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "no-var": "error",
      "prefer-const": "error",
      "quotes": ["error", "double"],
      "semi": ["error", "always"],
    },
  },
]);
