export const isMethodWithBody = (method: string | undefined): boolean => {
  return method !== 'GET' && method !== 'DELETE'
}
