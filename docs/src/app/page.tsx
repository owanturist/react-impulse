import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { HomeLayout } from "fumadocs-ui/layouts/home"

import { ThemeSwitcher } from "@/components/theme-switcher"

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
        <section className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center md:py-24">
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">Signals for React.</h1>
          <p className="max-w-xl text-fd-muted-foreground text-lg">
            A tiny, type-safe reactive state library. Track dependencies automatically. Update only
            what changed.
          </p>
          <div className="mt-4 w-full max-w-md">
            <DynamicCodeBlock lang="bash" code="npm install @owanturist/signal" />
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16">
          {/* Tiny footprint */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Tiny footprint</h2>
            <p className="text-fd-muted-foreground">
              ~2 kB for the core. ~0.5 kB for the React bridge. No bloat, no dependencies — just
              signals.
            </p>
            <DynamicCodeBlock
              lang="bash"
              code={`npm install @owanturist/signal       # ~2 kB
npm install @owanturist/signal-react # ~0.5 kB`}
            />
          </div>

          {/* Framework agnostic */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">
              Enhance JavaScript with reactivity. Use naturally in React.
            </h2>
            <p className="text-fd-muted-foreground">
              Signals are plain JavaScript — no framework required. Plug in React with a tiny bridge
              and the same signals drive your components.
            </p>
            <Tabs items={["Vanilla JS", "React", "Both"]}>
              <Tab value="Vanilla JS">
                <DynamicCodeBlock
                  lang="ts"
                  code={`import { Signal, effect } from "@owanturist/signal"

const count = Signal(0)

effect((monitor) => {
  document.title = \`Count: \${count.read(monitor)}\`
})

count.write((n) => n + 1)`}
                />
              </Tab>
              <Tab value="React">
                <DynamicCodeBlock
                  lang="tsx"
                  code={`import { Signal } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

const count = Signal(0)

function Counter() {
  const value = useComputed((monitor) => count.read(monitor))

  return <button onClick={() => count.write((n) => n + 1)}>{value}</button>
}`}
                />
              </Tab>
              <Tab value="Both">
                <DynamicCodeBlock
                  lang="tsx"
                  code={`import { Signal, effect } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

// one signal, shared across environments
const count = Signal(0)

// vanilla JS — updates the document title
effect((monitor) => {
  document.title = \`Count: \${count.read(monitor)}\`
})

// React — renders the same signal
function Counter() {
  const value = useComputed((monitor) => count.read(monitor))

  return <button onClick={() => count.write((n) => n + 1)}>{value}</button>
}`}
                />
              </Tab>
            </Tabs>
          </div>

          {/* TypeScript */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Types you never write</h2>
            <p className="text-fd-muted-foreground">
              Signal infers types from values — no generics, no annotations, no boilerplate. If
              TypeScript accepts it, Signal tracks it.
            </p>
            <DynamicCodeBlock
              lang="ts"
              code={`const count = Signal(0)
//    ^? Signal<number>

const name = Signal("Alice")
//    ^? Signal<string>

const user = Signal({ name: "Alice", age: 30 })
//    ^? Signal<{ name: string; age: number }>

const doubled = Signal((monitor) => count.read(monitor) * 2)
//    ^? ReadonlySignal<number>`}
            />
          </div>

          {/* Granular */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Update only what changed</h2>
            <p className="text-fd-muted-foreground">
              A signal can hold a complex object, or you can break it into fine-grained signals per
              field. Change one part — only the readers of that part react. No selectors, no
              diffing.
            </p>
            <DynamicCodeBlock
              lang="tsx"
              code={`// coarse: one signal for the whole object
const user = Signal({ name: "Alice", age: 30 })

// granular: separate signals per field
const name = Signal("Alice")
const age = Signal(30)
const user = Signal((monitor) => ({
  name: name.read(monitor),
  age: age.read(monitor),
}))

// this component only re-renders when \`name\` changes
function Name() {
  const value = useComputed((monitor) => name.read(monitor))
  return <span>{value}</span>
}

age.write(31) // Name stays silent`}
            />
          </div>

          {/* Nested signals */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Compose without limits</h2>
            <p className="text-fd-muted-foreground">
              Signals can hold signals. Nest them in arrays, objects, or any structure — the type
              system follows along.
            </p>
            <DynamicCodeBlock
              lang="ts"
              code={`const guests = Signal<ReadonlyArray<{
  email: Signal<string>
  name: Signal<string>
}>>([])

// add a guest — each field is its own signal
guests.write((list) => [
  ...list,
  { email: Signal(""), name: Signal("") },
])

// update one guest's email — nothing else re-renders
guests.read(monitor)[0].email.write("alice@example.com")`}
            />
          </div>
        </section>
      </div>
    </HomeLayout>
  )
}
