export type QueryKey = ReadonlyArray<unknown>

export type QueryFunction<T = unknown> = (
  queryFnContext: QueryFunctionContext,
) => T | Promise<T>

export type UseQueryOptions<
  TQueryFnData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = QueryObserverOptions<TQueryFnData, TQueryKey>

export type UseBaseQueryOptions<
  TQueryFnData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = QueryObserverOptions<TQueryFnData, TQueryKey>

export type QueryObserverOptions<
  TQueryFnData = unknown,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey
  queryFn: QueryFunction<TQueryFnData>
  retry?: number
  retryDelay?: number
  gcTime?: number
}

export type QueryStatus = 'pending' | 'error' | 'success'

export interface QueryObserverPendingResult<TData = unknown, TError = Error> {
  data: undefined
  error: null
  isError: false
  isPending: true
  isSuccess: false
  status: 'pending'
}

export interface QueryObserverLoadingErrorResult<
  TData = unknown,
  TError = Error,
> {
  data: undefined
  error: TError
  isError: true
  isPending: false
  isSuccess: false
  status: 'error'
}

export interface QueryObserverSuccessResult<TData = unknown, TError = Error> {
  data: TData
  error: null
  isError: false
  isPending: false
  isSuccess: true
  status: 'success'
}

export type UseQueryResult<
  TData = unknown,
  TError = Error,
> = UseBaseQueryResult<TData, TError>

export type UseBaseQueryResult<
  TData = unknown,
  TError = Error,
> = QueryObserverResult<TData, TError>

export type QueryObserverResult<TData = unknown, TError = Error> =
  | QueryObserverSuccessResult<TData, TError>
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverPendingResult<TData, TError>

export type QueryFunctionContext = {
  signal: AbortSignal
}
