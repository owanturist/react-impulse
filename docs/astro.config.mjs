import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import typedoc from "starlight-typedoc"

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        typedoc({
          // https://starlight-typedoc.vercel.app/configuration/
          tsconfig: "../packages/react-impulse/tsconfig.json",
          entryPoints: ["../packages/react-impulse/src/index.ts"],
          output: "reference",

          typeDoc: {
            // https://typedoc.org/documents/Options.Input.html
            gitRevision: "master",
            // https://typedoc.org/documents/Options.Output.html
            router: "category",
            cleanOutputDir: true,
            // https://typedoc.org/documents/Options.Other.html
            skipErrorChecking: true,
            // https://typedoc-plugin-markdown.org/docs/options/file
            entryFileName: "",
            // https://typedoc-plugin-markdown.org/docs/options/display
            useCodeBlocks: true,
            parametersFormat: "list",
            interfacePropertiesFormat: "list",
            classPropertiesFormat: "list",
            enumMembersFormat: "table",
            // https://typedoc-plugin-markdown.org/docs/options/utility
            formatWithPrettier: true,
            prettierConfigFile: "../.prettierrc.json",
          },
        }),
      ],

      title: "React Impulse",
      description: "Fine-grained reactivity for React",

      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              label: "Introduction",
              link: "/",
            },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            {
              label: "Understanding Impulses",
              link: "/explanation/impulse-overview/",
            },
            {
              label: "Reactivity System",
              link: "/explanation/reactivity-system/",
            },
            {
              label: "Derived Computations",
              link: "/explanation/derived-computations/",
            },
          ],
        },
        {
          label: "API Reference",
          collapsed: true,
          autogenerate: { directory: "reference", collapsed: false },
        },
      ],
    }),
  ],
})
