// Special fix for MobX proxies
export const ownKeys = (object: {}): string[] => {
  const result: string[] = []

  Reflect.ownKeys(object).map(pathKey => {
    if (typeof (pathKey) === 'string') result.push(pathKey)
    if (typeof (pathKey) === 'number') result.push(pathKey + '')
  })

  return result
}
