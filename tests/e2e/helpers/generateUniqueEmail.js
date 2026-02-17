export function generateUniqueEmail() {
  const hash = Math.random().toString(36).substr(2, 8)
  return `test-${hash}.test-${hash}@gmail.com`
}