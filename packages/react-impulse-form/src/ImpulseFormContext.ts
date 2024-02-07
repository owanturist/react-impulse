import { Impulse } from "./dependencies"

/**
 * @private
 */
export class ImpulseFormContext {
  // private readonly _listeners = new Set<() => Promise<unknown>>()
  public readonly _submitCount = Impulse.of(0)
  public readonly _submitting = Impulse.of(false)

  // public _getSubmitCount(scope: Scope): number {
  //   return this._submitCount.getValue(scope)
  // }

  // public _isSubmitting(scope: Scope): boolean {
  //   return this._submitting.getValue(scope)
  // }

  // public _onSubmit(listener: () => Promise<unknown>): VoidFunction {
  //   this._listeners.add(listener)

  //   return () => {
  //     this._listeners.delete(listener)
  //   }
  // }

  // public async _submit(): Promise<void> {
  //   batch(() => {
  //     this._submitCount.setValue((count) => count + 1)
  //     this._submitting.setValue(true)
  //   })

  //   try {
  //     await Promise.all(
  //       Array.from(this._listeners).map((listener) => listener()),
  //     )
  //   } finally {
  //     this._submitting.setValue(false)
  //   }
  // }
}
