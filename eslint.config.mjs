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
              regex:
                "^(?:@/|(?:\\.\\./)+)(?:calculations|data|scenarios|application|presentation|components|app|styles)(?:/|$)",
              message:
                "The domain layer is the lowest source layer and must not depend on calculations or higher application and UI layers.",
            },
            {
              regex:
                "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
              message:
                "The domain layer must remain independent of frontend frameworks and libraries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/calculations/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?:@/|(?:\\.\\./)+)(?:data|scenarios|application|presentation|components|app|styles)(?:/|$)",
              message:
                "The calculations layer may depend on domain, but not on higher application, routing, presentation, or UI layers.",
            },
            {
              regex:
                "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
              message:
                "The calculations layer must remain independent of frontend frameworks and libraries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/scenarios/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(?:@/|(?:\\.\\./)+)(?:application|presentation|components|app|styles)(?:/|$)",
              message:
                "Scenario models and codecs must not depend on application, presentation, or UI layers.",
            },
            {
              regex:
                "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
              message:
                "Scenario models and codecs must remain independent of frontend frameworks and libraries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/data/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:@/|(?:\\.\\./)+)(?:components|app)(?:/|$)",
              message:
                "The data layer must not depend on React components or routes.",
            },
            {
              regex: "^(?:@reduxjs/toolkit|react-redux)(?:/|$)",
              message: "The data layer must not depend on Redux.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:@/|(?:\\.\\./)+)(?:components|app)(?:/|$)",
              message:
                "Pure application logic must not depend on React components or routes.",
            },
            {
              regex: "^(?:react|react-dom|@reduxjs/toolkit|react-redux)(?:/|$)",
              message:
                "Pure application logic must remain independent of React and Redux.",
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
