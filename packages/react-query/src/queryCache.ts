import { Query } from './query'
import type { QueryKey } from './types'

export type MutationKey = ReadonlyArray<unknown>

// 判断是否是对象且不为 `null`
function isObject(val: unknown): boolean {
  return typeof val === 'object' && val !== null
}

export function hashKey(queryKey: QueryKey | MutationKey): string {
  return JSON.stringify(queryKey, (_, val) =>
    isObject(val)
      ? Object.keys(val) // 如果是对象的话就进行排序，得到稳定的一致的字符串结果
          .sort()
          .reduce((result, key) => {
            result[key] = val[key]
            return result
          }, {} as any)
      : val,
  )
}

export class QueryCache {
  #queries: Map<string, Query>

  constructor() {
    // 缓存，queryKey -> query 的映射
    this.#queries = new Map<string, Query>()
  }

  has(queryKey: Array<unknown>): boolean {
    return Array.from(this.#queries.keys()).some(
      (queryHash) => queryHash === hashKey(queryKey),
    )
  }

  // queryHash —> query
  get(queryHash: string) {
    return this.#queries.get(queryHash)
  }

  add(query: Query): void {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query)
    }
  }

  remove(query: Query<any, any, any, any>): void {
    const queryInMap = this.#queries.get(query.queryHash)

    if (queryInMap) {
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash)
      }
    }
  }

  build(options: any) {
    const queryKey = options.queryKey
    const queryHash = hashKey(queryKey)
    let query = this.get(queryHash)
    // 保障了在相同 `queryKey` 下对应同一个query
    if (!query) {
      query = new Query({
        queryKey,
        queryHash,
        options,
        cache: this,
      })
      this.add(query)
    }
    return query
  }
}
