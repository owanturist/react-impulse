import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { HomeLayout } from "fumadocs-ui/layouts/home"
import Link from "next/link"

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
    >
      <Hero />
      <Features />
      <CTA />
    </HomeLayout>
  )
}

function Hero() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 px-4 py-16 text-center md:py-24">
      <h1 className="font-bold text-4xl tracking-tight md:text-5xl">Signals for React.</h1>
      <p className="max-w-xl text-fd-muted-foreground text-lg">
        A tiny, type-safe reactive state library. Track dependencies automatically. Update only what
        changed.
      </p>
      <div className="mt-4 w-full max-w-md">
        <DynamicCodeBlock lang="bash" code="npm install @owanturist/signal" />
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16">
      <FeatureTinyFootprint />
      <FeatureFrameworkAgnostic />
      <FeatureTypeScript />
      <FeatureGranular />
      <FeatureNestedSignals />
    </section>
  )
}

function FeatureTinyFootprint() {
  return (
    <Feature title="Tiny footprint">
      <p className="text-fd-muted-foreground">
        ~2 kB for the core. ~0.5 kB for the React bridge. No bloat, no dependencies — just signals.
      </p>
      <DynamicCodeBlock
        lang="bash"
        code={`npm install @owanturist/signal       # ~2 kB
npm install @owanturist/signal-react # ~0.5 kB`}
      />
    </Feature>
  )
}

const frameworkAgnosticTabs = [
  {
    label: "Vanilla JS",
    lang: "ts",
    code: `import { Signal, effect } from "@owanturist/signal"

const count = Signal(0)

effect((monitor) => {
  document.title = \`Count: \${count.read(monitor)}\`
})

count.write((n) => n + 1)`,
  },
  {
    label: "React",
    lang: "tsx",
    code: `import { Signal } from "@owanturist/signal"
import { useComputed } from "@owanturist/signal-react"

const count = Signal(0)

function Counter() {
  const value = useComputed((monitor) => count.read(monitor))

  return <button onClick={() => count.write((n) => n + 1)}>{value}</button>
}`,
  },
  {
    label: "Both",
    lang: "tsx",
    code: `import { Signal, effect } from "@owanturist/signal"
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
}`,
  },
] as const

function FeatureFrameworkAgnostic() {
  return (
    <Feature title="Enhance JavaScript with reactivity. Use naturally in React.">
      <p className="text-fd-muted-foreground">
        Signals are plain JavaScript — no framework required. Plug in React with a tiny bridge and
        the same signals drive your components.
      </p>
      <Tabs items={frameworkAgnosticTabs.map((tab) => tab.label)}>
        {frameworkAgnosticTabs.map((tab) => (
          <Tab key={tab.label} value={tab.label}>
            <DynamicCodeBlock lang={tab.lang} code={tab.code} />
          </Tab>
        ))}
      </Tabs>
    </Feature>
  )
}

function FeatureTypeScript() {
  return (
    <Feature title="Types you never write">
      <p className="text-fd-muted-foreground">
        Signal infers types from values — no generics, no annotations, no boilerplate. If TypeScript
        accepts it, Signal tracks it.
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
    </Feature>
  )
}

function FeatureGranular() {
  return (
    <Feature title="Update only what changed">
      <p className="text-fd-muted-foreground">
        A signal can hold a complex object, or you can break it into fine-grained signals per field.
        Change one part — only the readers of that part react. No selectors, no diffing.
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
    </Feature>
  )
}

function FeatureNestedSignals() {
  return (
    <Feature title="Compose without limits">
      <p className="text-fd-muted-foreground">
        Signals can hold signals. Nest them in arrays, objects, or any structure — the type system
        follows along.
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
    </Feature>
  )
}

function CTA() {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-16 text-center md:flex-row md:justify-center md:gap-6">
      <Link
        href="/docs/getting-started"
        className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
      >
        Get Started
        <span aria-hidden="true">&rarr;</span>
      </Link>
      <Link
        href="/docs/api/signal"
        className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-6 py-3 font-medium text-fd-foreground text-sm transition-colors hover:bg-fd-accent"
      >
        API Reference
      </Link>
    </section>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
      {children}
    </div>
  )
}
