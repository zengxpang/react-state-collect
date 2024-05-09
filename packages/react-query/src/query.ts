import { QueryCache } from './queryCache'
import { QueryObserver } from './queryObserver'
import { Removable } from './removable'
import { createRetryer, Retryer } from './retryer'
import {
  QueryFunctionContext,
  QueryKey,
  QueryObserverOptions,
  QueryStatus,
} from './types'

interface QueryConfig<TQueryKey extends QueryKey = QueryKey> {
  cache: QueryCache
  queryHash: string
  queryKey: TQueryKey
  options: QueryObserverOptions
}

interface SuccessAction<TData> {
  data: TData | undefined
  type: 'success'
}

interface ErrorAction<TError> {
  type: 'error'
  error: TError
}

export type Action<TData, TError> = SuccessAction<TData> | ErrorAction<TError>

export interface QueryState<TData = unknown, TError = Error> {
  data: TData | undefined
  status: QueryStatus
  error: TError | null
}

export class Query<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> extends Removable {
  queryKey: TQueryKey
  queryHash: string
  options: QueryObserverOptions
  #promise?: Promise<TData>
  #cache: QueryCache
  state: QueryState<TData, TError>
  #retryer?: Retryer<TData>
  #initialState: QueryState<TData, TError>
  #observers: Array<QueryObserver>

  constructor(config: QueryConfig<TQueryKey>) {
    super()

    this.queryHash = config.queryHash
    this.queryKey = config.queryKey
    this.options = config.options
    this.#cache = config.cache
    this.#initialState = getDefaultState()
    this.state = this.#initialState
    this.#observers = []
  }

  cancel() {
    // 取消请求
    this.#retryer?.cancel()
  }

  removeObserver() {
    // 取消请求
    this.#retryer?.cancel()
  }

  addObserver(observer: QueryObserver) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer)
    }
  }

  #dispatch(action: Action<TData, TError>): void {
    const reducer = (
      state: QueryState<TData, TError>,
    ): QueryState<TData, TError> => {
      switch (action.type) {
        case 'success':
          return {
            ...state,
            data: action.data,
            status: 'success',
          }
        case 'error':
          const error = action.error
          return {
            ...state,
            error: error,
            status: 'error',
          }
      }
    }
    // 更新状态
    this.state = reducer(this.state)
    // 触发组件 re-render
    this.#observers.forEach((observer) => {
      observer.updateResult()
    })
  }

  setData(data: TData) {
    this.#dispatch({
      data,
      type: 'success',
    })
  }

  fetch() {
    // 更新 `query` 回收时间
    this.updateGcTime(this.options.gcTime)

    // 用于取消请求
    const abortController = new AbortController()

    const queryFnContext: QueryFunctionContext = {
      signal: abortController.signal,
    }

    // 发起请求函数
    const fetchFn = () => {
      return this.options.queryFn(queryFnContext)
    }
    const context = {
      fetchFn,
      options: this.options,
    }
    this.#retryer = createRetryer({
      fn: context.fetchFn as () => Promise<TData>,
      abort: abortController.abort.bind(abortController),
      onSuccess: (data) => {
        // 请求成功后更新状态
        this.setData(data)
        // 请求成功后调度 `scheduleGc` 来垃圾回收
        this.scheduleGc()
      },
      onError: (error: TError) => {
        // 更新状态
        this.#dispatch({
          type: 'error',
          error: error as TError,
        })
      },
      // 重试次数
      retry: context.options.retry,
      // 重试间隔时间
      retryDelay: context.options.retryDelay,
    })
    this.#promise = this.#retryer.promise
    return this.#promise
  }

  protected optionalRemove() {
    this.#cache.remove(this)
  }
}

function getDefaultState<TData, TError>(): QueryState<TData, TError> {
  return {
    data: undefined as TData,
    status: 'pending',
    error: null,
  }
}
