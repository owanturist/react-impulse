---
"react-impulse": minor
---

Introduce transmitting Impulse.

- `Impulse.transmit` static method that creates a new transmitting Impulse. A transmitting Impulse is an Impulse that does not have its own value but reads it from an external source and writes it back to the source when the value changes. An external source is usually another Impulse or other Impulses.

  ```dart
  Impulse.transmit<T>(
    getter: () => T,
    options?: TransmittingImpulseOptions<T>,
  ): ReadonlyImpulse<T>

  Impulse.transmit<T>(
    getter: () => T,
    setter: (value: T) => void,
    options?: TransmittingImpulseOptions<T>,
  ): Impulse<T>
  ```

  - `getter` is a function to read the transmitting value from a source.
  - `[setter]` is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
  - `[options]` is an optional `TransmittingImpulseOptions` object.
    - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the `Object.is` function applies to compare the values.

- `useTransmittingImpulse` react that initialize a stable (never changing) transmitting Impulse. Look at the `Impulse.transmit` method for more details and examples.

  ```dart
  function useTransmittingImpulse<T>(
    getter: () => T,
    dependencies: DependencyList,
    options?: TransmittingImpulseOptions<T>,
  ): ReadonlyImpulse<T>

  function useTransmittingImpulse<T>(
    getter: () => T,
    dependencies: DependencyList,
    setter: (value: T) => void,
    options?: TransmittingImpulseOptions<T>,
  ): Impulse<T>
  ```

  - `getter` is a function to read the transmitting value from a source.
  - `dependencies` an array of values triggering the re-read of the transmitting value.
  - `[setter]` is an optional function to write the transmitting value back to the source. When not defined, the Impulse is readonly.
  - `[options]` is an optional `TransmittingImpulseOptions` object.
    - `[options.compare]` when not defined it uses the `compare` function from the origin Impulse, when `null` the `Object.is` function applies to compare the values.

- `type ReadonlyImpulse`

  A type alias for `Impulse` that does not have the `Impulse#setValue` method. It might be handy to store some value inside an Impulse, so the value change trigger a host component re-render only if the component reads the value from the Impulse.
