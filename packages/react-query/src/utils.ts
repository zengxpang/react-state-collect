export function shallowEqualObjects<T>(a: T, b: T): boolean {
  if ((a && !b) || (b && !a)) {
    return false
  }

  for (const key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }

  return true
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
