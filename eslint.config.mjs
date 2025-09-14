// eslint.config.mjs
import js from "@eslint/js";
import tsplugin from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import preact from "eslint-config-preact";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", ".tmp-tests/**", ".tmp-web/**", ".parcel-cache/**", "node_modules/**"],
  },

  js.configs.recommended,
  ...preact,

  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.spec.ts", "**/*.spec.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { "@typescript-eslint": tsplugin },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/react-in-jsx-scope": "off",
    },
  },

  {
    files: [
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
      "tests/**/*.spec.ts",
      "tests/**/*.spec.tsx",
      "__tests__/**/*.spec.ts",
      "__tests__/**/*.spec.tsx",
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ["./tsconfig.test.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { "@typescript-eslint": tsplugin },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/react-in-jsx-scope": "off",
    },
  },
];
