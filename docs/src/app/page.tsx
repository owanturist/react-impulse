import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { HomeLayout } from "fumadocs-ui/layouts/home"

import { MDXComponents } from "@/components/mdx-components"
import { ThemeSwitcher } from "@/components/theme-switcher"

import "@/styles.css"

import ComposeExample from "./compose-nested-example.mdx"
import BothExample from "./reactive-js-both-example.mdx"
import ReactExample from "./reactive-js-react-example.mdx"
import VanillaJsExample from "./reactive-js-vanilla-example.mdx"
import FullObjectRerenderExample from "./selective-update-full-example.mdx"
import SelectiveRerenderExample from "./selective-update-partial-example.mdx"
import SignalPropExample from "./skip-rerenders-signal-prop-example.mdx"
import StringPropExample from "./skip-rerenders-string-prop-example.mdx"
import TypeInferenceExample from "./type-inference-example.mdx"

export default function HomePage() {
  return (
    <HomeLayout
      nav={{
        title: "@owanturist/signal",
      }}
      links={[
        {
          text: "Documentation",
          url: "/docs",
        },
      ]}
      themeSwitch={{
        mode: "light-dark-system",
        component: <ThemeSwitcher className="p-1" />,
      }}
    >
      <div className="prose">
        {/* Hero */}
        <section className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 py-16 text-center md:py-24">
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">Signals for React</h1>
          <p className="max-w-xl text-fd-muted-foreground text-lg">
            Angular, Solid, Svelte, and Preact have signals built in.
            <br />
            React doesn&apos;t - until now.
          </p>
          <div className="mt-4 w-full text-left">
            <DynamicCodeBlock
              lang="bash"
              code={`
npm install @owanturist/signal       # ~2 kB
npm install @owanturist/signal-react # ~0.5 kB
`.trim()}
            />
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
          {/* Pass signals, skip re-renders */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Pass signals, skip re-renders</h2>
            <p className="text-fd-muted-foreground">
              Pass a signal through any number of components - if a component doesn&apos;t read the
              value, it doesn&apos;t re-render. Only components that actually read the signal react
              to changes.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <SignalPropExample components={MDXComponents} />
              </div>
              <div>
                <StringPropExample components={MDXComponents} />
              </div>
            </div>
          </div>

          {/* Update only what changed */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Update only what changed</h2>
            <p className="text-fd-muted-foreground">
              The compute function decides what your component subscribes to. Read only what you
              need - everything else can change without causing a re-render.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <SelectiveRerenderExample components={MDXComponents} />
              </div>
              <div>
                <FullObjectRerenderExample components={MDXComponents} />
              </div>
            </div>
          </div>

          {/* Compose without limits */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Compose without limits</h2>
            <p className="text-fd-muted-foreground">
              Signals can store signals. Nest them in arrays, objects, or any structure - the type
              system follows along. Each nested signal updates independently, so only the specific
              reader that cares about a change re-renders.
            </p>
            <ComposeExample components={MDXComponents} />
          </div>

          {/* TypeScript */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Types you never write</h2>
            <p className="text-fd-muted-foreground">
              Every type is inferred - no generics, no annotations, no boilerplate. The only limit
              is TypeScript itself.
            </p>
            <TypeInferenceExample components={MDXComponents} />
          </div>

          {/* Reactive JavaScript */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">
              Reactive JavaScript. No framework required.
            </h2>
            <p className="text-fd-muted-foreground">
              Signals are plain JavaScript objects that live outside React&apos;s runtime. Use them
              in vanilla JS with effects, or let React subscribe to them through a single hook. The
              same signal works in both worlds.
            </p>
            <Tabs items={["Vanilla JS", "React", "Both"]}>
              <Tab value="Vanilla JS">
                <VanillaJsExample components={MDXComponents} />
              </Tab>
              <Tab value="React">
                <ReactExample components={MDXComponents} />
              </Tab>
              <Tab value="Both">
                <BothExample components={MDXComponents} />
              </Tab>
            </Tabs>
          </div>
        </section>
      </div>
    </HomeLayout>
  )
}
