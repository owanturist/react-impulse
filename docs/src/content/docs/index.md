---
title: React Impulse
description: Fine-grained reactivity for React with minimal re-renders
generated:
  from:
    - impulse-concept
    - scope-concept
    - derived-impulse-concept
  type: tutorial
  date: 2025-09-24
  status: published
---

Fine-grained reactivity for React with minimal re-renders.

## Features

- **Tiny Bundle Size** - Lightweight library that won't bloat your bundle
- **Opt-in Reactivity** - Only components using reactive values re-render
- **TypeScript Support** - Built with TypeScript for great DX
- **Automatic Cleanup** - Subscriptions managed with component lifecycle

## Quick Start

```javascript
import { Impulse, useScope } from "react-impulse"

// Create reactive state
const count = Impulse(0)
const doubled = Impulse((scope) => count.getValue(scope) * 2)

// Use in component
function Counter() {
  const scope = useScope()
  const value = doubled.getValue(scope)
  return <div>{value}</div>
}
```
