import {
  QueryKey,
  QueryObserverResult,
  UseQueryOptions,
  UseQueryResult,
} from './types'
import { useBaseQuery } from './useBaseQuery'

export function useQuery<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TQueryKey>): UseQueryResult<TData> {
  return useBaseQuery(options)
}
