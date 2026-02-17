export default {
  getKeys: (keys: string[]) => {
    if (typeof keys === 'object') {
      const storageInstance = localStorage

      return keys.reduce((a, v) => ({ ...a, [v]: storageInstance.getItem(v) }), {})
    }

    return new Error('Expect array input keys')
  },
  fillOutKeys: (data: any) => {
    for (const [key] of Object.entries(data)) {
      data[key] = localStorage.getItem(key)
    }
    return data
  },
  getItem: (key: string) => {
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    return localStorage.setItem(key, value)
  },
  removeItem: (key: string) => {
    return localStorage.removeItem(key)
  }
}
