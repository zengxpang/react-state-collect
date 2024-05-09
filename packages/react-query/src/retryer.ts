import { abort } from 'process'
import { sleep } from './utils'

interface RetryerConfig<TData = unknown, TError = Error> {
  fn: () => TData | Promise<TData>
  abort: () => void
  onError?: (error: TError) => void
  onSuccess?: (data: TData) => void
  retry?: number
  retryDelay?: number
}

export interface Retryer<TData = unknown> {
  promise: Promise<TData>
  cancel: () => void
}

function defaultRetryDelay(failureCount: number) {
  return Math.min(1000 * 2 ** failureCount, 30000)
}

export function createRetryer<TData = unknown, TError = Error>(
  config: RetryerConfig<TData, TError>,
): Retryer<TData> {
  let failureCount = 0

  let promiseResolve: (data: TData) => void
  let promiseReject: (error: TError) => void

  const promise = new Promise<TData>((outerResolve, outerReject) => {
    promiseResolve = outerResolve
    promiseReject = outerReject
  })

  const cancel = () => {
    config.abort()
  }

  const resolve = (value: any) => {
    config.onSuccess?.(value)
    promiseResolve(value)
  }

  const reject = (value: any) => {
    config.onError?.(value)
    promiseReject(value)
  }

  const run = () => {
    let promiseOrValue: any
    try {
      promiseOrValue = config.fn()
    } catch (error) {
      promiseOrValue = Promise.reject(error)
    }
    Promise.resolve(promiseOrValue)
      .then(resolve)
      .catch((error) => {
        // 默认重试次数
        const retry = config.retry ?? 3
        // 默认在出错后重试间隔
        const delay = config.retryDelay ?? defaultRetryDelay(failureCount)
        const shouldRetry = failureCount < retry
        if (!shouldRetry) {
          reject(error)
          return
        }

        failureCount++

        sleep(delay).then(() => {
          run()
        })
      })
  }

  run()

  return {
    promise,
    cancel,
  }
}
