import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

// So far this is the correct way to setup react with eslint in flat config
// Prettier-eslint is buggy as hell and doesn't support latest eslint@9 versions
// Do not put prettier on the extends array, it breaks react rules. It doesn't show the errors at all.

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
    // Add this object for react settings
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
]);
