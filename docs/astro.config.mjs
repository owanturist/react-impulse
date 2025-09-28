import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "React Impulse",
      description: "Fine-grained reactivity for React with minimal re-renders",
      sidebar: [
        {
          label: "Getting Started",
          items: [{ label: "Introduction", link: "/" }],
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
          label: "Reference",
          items: [{ label: "API Reference", link: "/reference/impulse-api/" }],
        },
      ],
    }),
  ],
})
