type Listener = () => void

export class Subscribable<TListener extends Function = Listener> {
  protected listeners: Set<TListener>

  constructor() {
    this.listeners = new Set()
  }

  // 进行订阅，这里传入的`listener`就是触发组件重新re-render的函数
  subscribe(listener: TListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
      this.onUnsubscribe()
    }
  }

  hasListeners(): boolean {
    return this.listeners.size > 0
  }

  protected onSubscribe(): void {
    // Do nothing
  }

  protected onUnsubscribe(): void {
    // Do nothing
  }
}
