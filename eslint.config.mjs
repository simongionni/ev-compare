import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/domain/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/calculations/*"],
              message:
                "The domain layer must not depend on the calculations layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.types.ts"],
    rules: {
      // Compile-time assertions and type declarations are checked by TypeScript, not consumed at runtime.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  prettier,
  globalIgnores([".next/**", "out/**", "coverage/**", "next-env.d.ts"]),
]);
