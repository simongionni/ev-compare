import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const sourceFiles = "*.{js,jsx,ts,tsx,mjs,cjs}";

function restriction(regex, message) {
  return { regex, message };
}

function restrictedImports(...patterns) {
  return ["error", { patterns }];
}

const domainSourceMessage =
  "The domain layer is the lowest source layer and must not depend on calculations or higher application and UI layers.";
const domainRestrictions = [
  restriction(
    "^@/(?:calculations|data|scenarios|application|presentation|components|app|styles)(?:/|$)",
    domainSourceMessage,
  ),
  restriction(
    "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
    "The domain layer must remain independent of frontend frameworks and libraries.",
  ),
];

const calculationsSourceMessage =
  "The calculations layer may depend on domain, but not on higher application, routing, presentation, or UI layers.";
const calculationsRestrictions = [
  restriction(
    "^@/(?:data|scenarios|application|presentation|components|app|styles)(?:/|$)",
    calculationsSourceMessage,
  ),
  restriction(
    "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
    "The calculations layer must remain independent of frontend frameworks and libraries.",
  ),
];

const scenariosSourceMessage =
  "Scenario models and codecs must not depend on application, presentation, or UI layers.";
const scenariosRestrictions = [
  restriction(
    "^@/(?:application|presentation|components|app|styles)(?:/|$)",
    scenariosSourceMessage,
  ),
  restriction(
    "^(?:(?:react|react-dom|next|@reduxjs/toolkit|react-redux|@base-ui/react)(?:/|$)|@visx/)",
    "Scenario models and codecs must remain independent of frontend frameworks and libraries.",
  ),
];

const dataSourceMessage =
  "The data layer must not depend on React components or routes.";
const dataRestrictions = [
  restriction("^@/(?:components|app)(?:/|$)", dataSourceMessage),
  restriction(
    "^(?:@reduxjs/toolkit|react-redux)(?:/|$)",
    "The data layer must not depend on Redux.",
  ),
];

const applicationSourceMessage =
  "Pure application logic must not depend on React components or routes.";
const applicationRestrictions = [
  restriction("^@/(?:components|app)(?:/|$)", applicationSourceMessage),
  restriction(
    "^(?:react|react-dom|@reduxjs/toolkit|react-redux)(?:/|$)",
    "Pure application logic must remain independent of React and Redux.",
  ),
];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [`src/domain/**/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(...domainRestrictions),
    },
  },
  {
    files: [`src/domain/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...domainRestrictions,
        restriction(
          "^\\.\\./(?:calculations|data|scenarios|application|presentation|components|app|styles)(?:/|$)",
          domainSourceMessage,
        ),
      ),
    },
  },
  {
    files: [`src/calculations/**/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(...calculationsRestrictions),
    },
  },
  {
    files: [`src/calculations/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...calculationsRestrictions,
        restriction(
          "^\\.\\./(?:data|scenarios|application|presentation|components|app|styles)(?:/|$)",
          calculationsSourceMessage,
        ),
      ),
    },
  },
  {
    files: [`src/calculations/*/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...calculationsRestrictions,
        restriction(
          "^(?:\\.\\./){2}(?:data|scenarios|application|presentation|components|app|styles)(?:/|$)",
          calculationsSourceMessage,
        ),
      ),
    },
  },
  {
    files: [`src/scenarios/**/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(...scenariosRestrictions),
    },
  },
  {
    files: [`src/scenarios/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...scenariosRestrictions,
        restriction(
          "^\\.\\./(?:application|presentation|components|app|styles)(?:/|$)",
          scenariosSourceMessage,
        ),
      ),
    },
  },
  {
    files: [`src/data/**/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(...dataRestrictions),
    },
  },
  {
    files: [`src/data/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...dataRestrictions,
        restriction("^\\.\\./(?:components|app)(?:/|$)", dataSourceMessage),
      ),
    },
  },
  {
    files: [`src/application/**/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(...applicationRestrictions),
    },
  },
  {
    files: [`src/application/${sourceFiles}`],
    rules: {
      "no-restricted-imports": restrictedImports(
        ...applicationRestrictions,
        restriction(
          "^\\.\\./(?:components|app)(?:/|$)",
          applicationSourceMessage,
        ),
      ),
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
