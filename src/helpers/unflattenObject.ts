type FlatObject = { [key: string]: string | number | boolean | null }
type UnflatObject = { [key: string]: any }

function unflattenObject(flatObject: FlatObject): UnflatObject {
  const unflatten = (result: UnflatObject, key: string, value: any): UnflatObject => {
    const parts = key.split(/\.|\[|\]/).filter(part => part.length > 0)
    let currentObj = result

    for (let i = 0; i < parts.length - 1; i++) {
      const subKey = parts[i]
      const nextKey = parts[i + 1]

      if (!currentObj[subKey]) {
        if (/^\d+$/.test(nextKey)) {
          currentObj[subKey] = []
        } else {
          currentObj[subKey] = {}
        }
      }

      currentObj = currentObj[subKey]
    }

    currentObj[parts[parts.length - 1]] = value

    return result
  }

  const result: UnflatObject = Object.entries(flatObject).reduce((accumulator: UnflatObject, [key, value]: [string, any]) => unflatten(accumulator, key, value),
    {}
  )

  // Adicione o seguinte trecho para verificar se precisamos retornar uma matriz
  const keys = Object.keys(result)
  if (keys.every(key => /^\d+$/.test(key))) {
    return keys.map(key => result[key])
  }

  return result
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('unflattenObject', () => {
    it('should unflat a simple object', () => {
      const flatObject = { a: 1, b: 2 }
      const result = unflattenObject(flatObject)
      expect(result).toEqual({ a: 1, b: 2 })
    })
  
    it('should unflat a nested object', () => {
      const flatObject = { a: 1, 'b.c': 2 }
      const result = unflattenObject(flatObject)
      expect(result).toEqual({ a: 1, b: { c: 2 } })
    })
  
    it('should unflat an array', () => {
      const flatObject = { '[0]': 1, '[1]': 2, '[2][0]': 3, '[2][1]': 4 }
    const result = unflattenObject(flatObject)
    expect(result).toEqual([1, 2, [3, 4]])
    })
  
    it('should preserve null when unflat', () => {
      const flatObject = { a: 1, b: null, 'c.d': 2, 'c.e': null }
      const result = unflattenObject(flatObject)
      expect(result).toEqual({ a: 1, b: null, c: { d: 2, e: null } })
    })
  })
}

export default unflattenObject