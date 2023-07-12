---
"react-impulse": patch
---

Introduce an implicit `Scope` injection by replacing internal `WatchContext` and `SetValueContext` with `ScopeEmitter`. It drastically simplifies the internal API and makes it possible for further improvements (eg: [#378](https://github.com/owanturist/react-impulse/issues/378)).
