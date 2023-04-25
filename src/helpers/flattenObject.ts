type FlatObject = { [key: string]: string | number | boolean | null }

function flattenObject(obj: any, prefix: string = '', result: FlatObject = {}, keepNull: boolean = true): FlatObject {
  const isValue = (val: any): boolean =>
    typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || (keepNull && val === null)

  const handleArray = (index: number | string): string => `${prefix}[${index}]`
  const handleObjectKey = (key: string): string => (prefix ? `${prefix}.${key}` : key)

  if (isValue(obj)) {
    result[prefix] = obj
    return result
  }

  if (Array.isArray(obj) || isPlainObject(obj)) {
    for (const key in obj) {
      const newPrefix = Array.isArray(obj) ? handleArray(key) : handleObjectKey(key)
      flattenObject(obj[key], newPrefix, result, keepNull)
    }
    return result
  }

  return result
}

function isPlainObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('flattenObject', () => {
    it('should flat a simple object', () => {
      const obj = { a: 1, b: 2 }
      const result = flattenObject(obj)
      expect(result).toEqual(obj)
    })
  
    it('should flat a nested object', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
        },
      }
      const result = flattenObject(obj)
      expect(result).toEqual({ a: 1, 'b.c': 2 })
    })
  
    it('should flat an array', () => {
      const arr = [1, 2, [3, 4]]
      const result = flattenObject(arr)
      expect(result).toEqual({ '[0]': 1, '[1]': 2, '[2][0]': 3, '[2][1]': 4 })
    })
  
    it('should remove null values if keepNull is false', () => {
      const obj = { a: 1, b: null, c: { d: 2, e: null } }
      const result = flattenObject(obj, '', {}, false)
      expect(result).toEqual({ a: 1, 'c.d': 2 })
    })
  })

}

export default flattenObject