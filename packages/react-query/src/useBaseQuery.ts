import { useState, useEffect, useSyncExternalStore, useCallback } from 'react'
import { useQueryClient } from './QueryClientProvider'
import { QueryObserver } from './queryObserver'
import { UseBaseQueryResult, UseBaseQueryOptions } from './types'

export type QueryKey = ReadonlyArray<unknown>

export function useBaseQuery<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseBaseQueryOptions<TQueryFnData, TQueryKey>,
): UseBaseQueryResult<TData> {
  const client = useQueryClient()
  // 保证整个生命周期唯一
  const [observer] = useState(
    () => new QueryObserver<TQueryFnData, TData, TQueryKey>(client, options),
  )

  // 获取查询结果
  const result = observer.getOptimisticResult(options)

  useSyncExternalStore(
    useCallback(
      (onStoreChange) => {
        // 订阅，为了当状态更新时通知组件重新渲染
        const unsubscribe = observer.subscribe(onStoreChange)
        return unsubscribe
      },
      [observer],
    ),
    // 可以看到useSyncExternalStore没有用到返回值，所以其实这里就是为了满足类型要求
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult(),
  )

  useEffect(() => {
    // 发起请求
    observer.setOptions()
  }, [observer])

  return result
}
