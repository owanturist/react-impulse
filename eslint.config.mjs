import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import importPlugin from "eslint-plugin-import"
import vitestPlugin from "eslint-plugin-vitest"
import { globalIgnores } from "eslint/config"

export default tseslint.config([
  globalIgnores(["**/node_modules/**", "**/dist/**/*", "**/*.d.ts", "**/*.md"]),

  // Base configuration for all files
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },

  // JS files base config
  {
    ...eslint.configs.recommended,
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      globals: {
        ...eslint.configs.recommended.globals,
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "*",
          next: "return",
        },
      ],
      // Possible Errors
      "no-template-curly-in-string": "error",
      // Best Practices
      "array-callback-return": "error",
      "consistent-return": "error",
      curly: "error",
      "default-param-last": "error",
      "dot-notation": [
        "error",
        {
          allowKeywords: true,
        },
      ],
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore",
        },
      ],
      "guard-for-in": "error",
      "no-alert": "error",
      "no-caller": "error",
      "no-constructor-return": "error",
      "no-console": "error",
      "no-debugger": "error",
      "no-else-return": "warn",
      "no-empty-function": [
        "warn",
        {
          allow: ["constructors"],
        },
      ],
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-floating-decimal": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-invalid-this": "error",
      "no-iterator": "error",
      "no-labels": "error",
      "no-lone-blocks": "error",
      "no-loop-func": "error",
      "no-multi-str": "warn",
      "no-new": "error",
      "no-new-func": "error",
      "no-new-wrappers": "warn",
      "no-octal-escape": "warn",
      "no-param-reassign": "error",
      "no-proto": "error",
      "no-return-assign": "error",
      "no-script-url": "error",
      "no-self-compare": "warn",
      "no-sequences": "error",
      "no-unmodified-loop-condition": "error",
      "no-useless-call": "warn",
      "no-useless-concat": "warn",
      "no-useless-return": "warn",
      "no-void": ["error", { allowAsStatement: true }],
      "no-warning-comments": "warn",
      "prefer-arrow-callback": "error",
      radix: "error",
      "require-await": "warn",

      // Variables
      "init-declarations": "error",
      "no-shadow": "error",
      "no-unused-vars": "warn",

      // ECMAScript 6
      "no-var": "error",

      // Import
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          pathGroups: [
            {
              pattern: "~/**",
              group: "internal",
            },
          ],
          "newlines-between": "always",
        },
      ],
      "import/no-relative-packages": "error",
      "import/no-default-export": "error",
      "import/newline-after-import": ["error", { considerComments: true }],
      "import/no-anonymous-default-export": "error",
      "import/no-empty-named-blocks": "error",
      "import/no-mutable-exports": "error",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "./*.{js,ts,mjs,cjs}",
            "./packages/*/*.{js,ts}",
            "./packages/*/tests/**/*.{ts,tsx}",
          ],
        },
      ],
      "import/no-cycle": ["error"],
    },
  },

  // TypeScript files config
  tseslint.configs.strict,
  tseslint.configs.stylistic,

  {
    files: ["**/*.ts?(x)"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json", "./packages/*/tsconfig.json"],
        ecmaVersion: 2018,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
    },
    rules: {
      "array-callback-return": "off",
      "consistent-return": "off",
      "no-shadow": "off",
      "no-unused-vars": "off",

      // Typescript Eslint
      "@typescript-eslint/no-shadow": ["error", { allow: ["scope"] }],
      "@typescript-eslint/array-type": [
        "error",
        {
          default: "generic",
          readonly: "generic",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
        },
      ],
      "@typescript-eslint/unbound-method": [
        "error",
        {
          ignoreStatic: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-confusing-non-null-assertion": "error",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        {
          ignoreArrowShorthand: true,
        },
      ],
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-non-null-asserted-nullish-coalescing": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/no-unnecessary-qualifier": "warn",
      "@typescript-eslint/no-unnecessary-type-arguments": "warn",
      "@typescript-eslint/non-nullable-type-assertion-style": "warn",
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-literal-enum-member": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "warn",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/require-array-sort-compare": "error",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-generic-constructors": "warn",
      "@typescript-eslint/no-this-alias": [
        "error",
        {
          allowedNames: ["that"],
        },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
    },
  },

  // Config files overrides
  {
    files: ["*.{ts,mjs}", "packages/*/*.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },

  // React files config
  {
    files: ["packages/*/src/**/*.ts?(x)", "packages/*/tests/**/*.ts?(x)"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["react", "use-sync-external-store", "react-impulse"],
              message:
                "Import dependencies from dependencies.ts. It makes the imported deps appear only ones in the bundle.",
            },
          ],
        },
      ],

      // React Eslint
      "react/button-has-type": ["warn", { reset: false }],
      "react/prop-types": "off",
      "react/jsx-curly-brace-presence": "error",
      "react/display-name": "off",

      // React Hooks
      "react-hooks/exhaustive-deps": [
        "error",
        {
          additionalHooks: "(use(\\w+)(Memo|Effect)|useScoped)",
        },
      ],
      "react-hooks/rules-of-hooks": "error",
    },
  },

  // Test files config
  {
    files: ["packages/*/tests/**/*.ts?(x)"],
    plugins: {
      vitest: vitestPlugin,
    },
    languageOptions: {
      globals: {
        ...vitestPlugin.environments.env.globals,
      },
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      "vitest/no-done-callback": "off",
      "vitest/no-deprecated-functions": "off",
      "vitest/no-duplicate-hooks": "warn",
      "vitest/no-test-return-statement": "error",
      "vitest/prefer-comparison-matcher": "warn",
      "vitest/prefer-equality-matcher": "warn",
      "vitest/prefer-hooks-on-top": "warn",
      "vitest/prefer-hooks-in-order": "warn",
      "vitest/prefer-spy-on": "error",
      "vitest/prefer-strict-equal": "error",
      "vitest/prefer-todo": "warn",
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
      "vitest/no-commented-out-tests": "error",
      "vitest/consistent-test-it": ["error", { fn: "it" }],
      "vitest/expect-expect": [
        "warn",
        {
          assertFunctionNames: ["expect*"],
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-shadow": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../src/*"],
              message: "Import only ../src for tests",
            },
          ],
        },
      ],
    },
  },
])
