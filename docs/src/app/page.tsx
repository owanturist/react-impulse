import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { HomeLayout } from "fumadocs-ui/layouts/home"

import { MDXComponents } from "@/components/mdx-components"
import { ThemeSwitcher } from "@/components/theme-switcher"

import "@/styles.css"

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
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">Signals for React.</h1>
          <p className="max-w-xl text-fd-muted-foreground text-lg">
            A tiny, type-safe reactive state library. Track dependencies automatically. Update only
            what changed.
          </p>
          <p className="text-fd-muted-foreground text-sm">
            Angular, Solid, and Preact have signals built in. React doesn&apos;t — until now.
          </p>
          <div className="mt-4 w-full text-left">
            <DynamicCodeBlock
              lang="bash"
              code={`npm install @owanturist/signal       # ~2 kB
npm install @owanturist/signal-react # ~0.5 kB`}
            />
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-16">
          {/* Pass signals, skip re-renders */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Pass signals, skip re-renders</h2>
            <p className="text-fd-muted-foreground">
              Pass a signal through any number of components — if a component doesn&apos;t read the
              value, it doesn&apos;t re-render. Only components that actually read the signal react
              to changes.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <DynamicCodeBlock
                  lang="tsx"
                  code={`interface Props {
  // 👍 signal prop: only Child re-renders
  name: Signal<string>
}

function Grandparent({ name }: Props) {
  console.log("Grandparent render")

  return <Parent name={name} />
}

function Parent({ name }: Props) {
  console.log("Parent render")

  return <Child name={name} />
}

function Child({ name }: Props) {
  const monitor = useMonitor()

  console.log("Child render")

  return <span>{name.read(monitor)}</span>
}

const name = Signal("Astrid")

name.write("Astrid 🌟")
// Console: "Child render"`}
                />
              </div>
              <div>
                <DynamicCodeBlock
                  lang="tsx"
                  code={`interface Props {
  // 👎 plain string prop: every layer re-renders
  name: string
}

function Grandparent({ name }: Props) {
  console.log("Grandparent render")

  return <Parent name={name} />
}

function Parent({ name }: Props) {
  console.log("Parent render")

  return <Child name={name} />
}

function Child({ name }: Props) {
  console.log("Child render")

  return <span>{name}</span>
}

const [name, setName] = useState("Astrid")

setName("Astrid 🌟")
// Console: "Grandparent render"
// Console: "Parent render"
// Console: "Child render"`}
                />
              </div>
            </div>
          </div>

          {/* Update only what changed */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Update only what changed</h2>
            <p className="text-fd-muted-foreground">
              The compute function decides what your component subscribes to. Read only what you
              need — everything else can change without causing a re-render.
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <DynamicCodeBlock
                  lang="tsx"
                  code={`const user = Signal({
  name: "Astrid",
  age: 30,
})

function Name() {
  // 👏 reads only the name field
  const name = useComputed((monitor) => user.read(monitor).name)

  console.log("Name render")

  return <span>{name}</span>
}

user.write((prev) => ({ ...prev, age: 31 }))
// Console: (nothing) — Name stays silent`}
                />
              </div>
              <div>
                <DynamicCodeBlock
                  lang="tsx"
                  code={`const user = Signal({
  name: "Astrid",
  age: 30,
})

function Name() {
  // 👍 reads the entire object
  const { name } = useComputed((monitor) => user.read(monitor))

  console.log("Name render")

  return <span>{name}</span>
}

user.write((prev) => ({ ...prev, age: 31 }))
// Console: "Name render"  — even though name didn't change`}
                />
              </div>
            </div>
          </div>

          {/* Compose without limits */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Compose without limits</h2>
            <p className="text-fd-muted-foreground">
              Signals can store signals. Nest them in arrays, objects, or any structure — the type
              system follows along. Each nested signal updates independently, so only the specific
              reader that cares about a change re-renders.
            </p>
            <DynamicCodeBlock
              lang="ts"
              code={`const guests = Signal<ReadonlyArray<{
  email: Signal<string>
  name: Signal<string>
}>>([])

effect((monitor) => {
  console.log("Guests:", guests.read(monitor).length)
})

effect((monitor) => {
  const first = guests.read(monitor).at(0)
  if (first) {
    console.log(first.name.read(monitor), first.email.read(monitor))
  }
})

guests.write((list) => [
  ...list,
  { email: Signal(""), name: Signal("Astrid") },
])
// Console: "Guests: 1"
// Console: "Astrid "

guests.read().at(0)?.email.write("astrid@example.com")
// Console: "Astrid astrid@example.com"`}
            />
          </div>

          {/* TypeScript */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-2xl tracking-tight">Types you never write</h2>
            <p className="text-fd-muted-foreground">
              Every type is inferred — no generics, no annotations, no boilerplate. The only limit
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
              in vanilla JS with effects, or let React subscribe to them through a tiny bridge. The
              same signal works in both worlds.
            </p>
            <Tabs items={["Vanilla JS", "React", "Both"]}>
              <Tab value="Vanilla JS">
                <DynamicCodeBlock
                  lang="ts"
                  code={`import { Signal, effect } from "@owanturist/signal"

const counter = Signal(0)

effect((monitor) => {
  document.title = \`Count: \${counter.read(monitor)}\`
})

counter.write((count) => count + 1)`}
                />
              </Tab>
              <Tab value="React">
                <DynamicCodeBlock
                  lang="tsx"
                  code={`import { Signal } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

const counter = Signal(0)

function Counter() {
  const value = useComputed((monitor) => counter.read(monitor))

  return <button onClick={() => counter.write((count) => count + 1)}>{value}</button>
}`}
                />
              </Tab>
              <Tab value="Both">
                <DynamicCodeBlock
                  lang="tsx"
                  code={`import { Signal, effect } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

// one signal, shared across environments
const counter = Signal(0)

// vanilla JS — updates the document title
effect((monitor) => {
  document.title = \`Count: \${counter.read(monitor)}\`
})

// React — renders the same signal
function Counter() {
  const value = useComputed((monitor) => counter.read(monitor))

  return <button onClick={() => counter.write((count) => count + 1)}>{value}</button>
}`}
                />
              </Tab>
            </Tabs>
          </div>
        </section>
      </div>
    </HomeLayout>
  )
}
