import { Query } from './query'
import { QueryClient } from './queryClient'
import { Subscribable } from './subscribable'
import { QueryKey, QueryObserverOptions, QueryObserverResult } from './types'
import { shallowEqualObjects } from './utils'

export class QueryObserver<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Subscribable {
  #client: QueryClient
  #currentResult: QueryObserverResult<TData> = undefined!
  #currentQuery: Query = undefined!

  constructor(
    client: QueryClient,
    public options: QueryObserverOptions,
  ) {
    super()
    this.#client = client
  }

  setOptions() {
    // 构造query
    this.#updateQuery()
    // 发起请求
    this.#executeFetch()
  }

  updateResult() {
    const prevResult = this.#currentResult
    const nextResult = this.createResult(this.#currentQuery)
    if (shallowEqualObjects(nextResult, prevResult)) {
      return
    }
    this.#currentResult = nextResult
    // 通知组件re-render
    this.#notify()
  }

  #executeFetch() {
    this.#updateQuery()
    let promise = this.#currentQuery.fetch()
    return promise
  }

  getOptimisticResult(
    options: QueryObserverOptions<TQueryFnData, TQueryKey>,
  ): QueryObserverResult<TData> {
    // `build` 实现中会判断 `queryKey` 对应是否有 `query`，有的话会直接拿缓存，不会重复构建
    const query = this.#client.getQueryCache().build(options)
    // 构造返回结果
    const result = this.createResult(query)
    return result
  }

  getCurrentResult(): QueryObserverResult<TData> {
    return this.#currentResult
  }

  destroy(): void {
    // 取消监听
    this.#currentQuery.removeObserver()
  }

  protected onUnsubscribe(): void {
    if (!this.hasListeners()) {
      this.destroy()
    }
  }

  createResult(query: Query): QueryObserverResult<TData> {
    const { state } = query
    let { data, status } = state

    const isPending = status === 'pending'
    const isError = status === 'error'
    const isSuccess = status === 'success'

    const result = {
      data,
      status,
      isPending,
      isError,
      isSuccess,
    }

    return result as QueryObserverResult<TData>
  }

  #notify() {
    this.listeners.forEach((listener) => {
      // re-render 组件
      listener()
    })
  }

  #updateQuery(): void {
    const query = this.#client.getQueryCache().build(this.options)
    if (query === this.#currentQuery) {
      return
    }
    this.#currentQuery = query
    // 一个 `query` 可能会对应多个 `QueryObserver` 实例，因此需要保存到 `query` 上
    // 方便当状态更新时可以借助 `QueryObserver` 通知组件 re-render
    query.addObserver(this)
  }
}
