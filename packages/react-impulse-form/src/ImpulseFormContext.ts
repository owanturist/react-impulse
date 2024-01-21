import { Impulse, type Scope, batch, tap } from "./dependencies"
import type { ImpulseForm } from "./ImpulseForm"

/**
 * @private
 */
export class ImpulseFormContext {
  private readonly _listeners = new Set<() => Promise<unknown>>()
  private readonly _submitCount = Impulse.of(0)
  private readonly _submitting = Impulse.of(false)

  public constructor(private readonly _host: ImpulseForm) {}

  public _getSubmitCount(scope: Scope): number {
    return this._submitCount.getValue(scope)
  }

  public _isSubmitting(scope: Scope): boolean {
    return this._submitting.getValue(scope)
  }

  public _onSubmit(listener: () => Promise<unknown>): VoidFunction {
    this._listeners.add(listener)

    return () => {
      this._listeners.delete(listener)
    }
  }

  public async _submit(): Promise<void> {
    batch(() => {
      this._submitCount.setValue((count) => count + 1)
      this._submitting.setValue(true)
    })

    await Promise.all(Array.from(this._listeners).map((listener) => listener()))
  }

  public _focusFirstInvalidValue(): void {
    tap((scope) => {
      this._host._getFocusFirstInvalidValue(scope)?.()
    })
  }
}
