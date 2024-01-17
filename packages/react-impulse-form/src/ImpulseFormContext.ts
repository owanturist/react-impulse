import { Impulse, type Scope, batch, tap } from "react-impulse"

import type { ImpulseForm } from "./ImpulseForm"

export class ImpulseFormContext {
  private readonly listeners = new Set<() => Promise<unknown>>()
  private readonly submitCount = Impulse.of(0)
  private readonly submitting = Impulse.of(false)

  public constructor(private readonly host: ImpulseForm) {}

  public getSubmitCount(scope: Scope): number {
    return this.submitCount.getValue(scope)
  }

  public isSubmitting(scope: Scope): boolean {
    return this.submitting.getValue(scope)
  }

  public onSubmit(listener: () => Promise<unknown>): VoidFunction {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  public async submit(): Promise<void> {
    batch(() => {
      this.submitCount.setValue((count) => count + 1)
      this.submitting.setValue(true)
    })

    await Promise.all(Array.from(this.listeners).map((listener) => listener()))
  }

  public focusFirstInvalidValue(): void {
    tap((scope) => {
      this.host.getFocusFirstInvalidValue(scope)?.()
    })
  }
}
