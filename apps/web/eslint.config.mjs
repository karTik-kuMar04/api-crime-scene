import js from "@eslint/js";
import tseslint from "typescript-eslint";

const harSurfaces = [
  "src/lib/har/**/*.{ts,tsx}",
  "src/lib/sessions/**/*.{ts,tsx}",
  "src/app/request-explorer/**/*.{ts,tsx}",
  "src/app/new-investigation/**/*.{ts,tsx}",
  "src/components/redaction-bar.tsx",
  "src/components/waterfall-ruler.tsx",
];

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "next-env.d.ts",
      "postcss.config.js",
      "tailwind.config.ts",
    ],
  },
  {
    files: harSurfaces,
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "Never render HAR content as HTML.",
        },
      ],
    },
  }
);
