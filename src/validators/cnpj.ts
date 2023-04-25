export default function validateCNPJ(value: string) {
  if (!value) return false

  if (!isValidFormat(value)) return false

  const numbers = extractNumbers(value)

  if (numbers.length !== 14 || hasRepeatedDigits(numbers) || !isValidCheckDigits(numbers)) return false

  return true
}

function isValidFormat(value: string): boolean {
  const digitsOnly = /^\d{14}$/.test(value)
  const validFormat = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value)

  return digitsOnly || validFormat
}

function extractNumbers(value: string): number[] {
  const match = value.match(/\d/g)
  return Array.isArray(match) ? match.map(Number) : []
}

function hasRepeatedDigits(numbers: number[]): boolean {
  return new Set(numbers).size === 1
}

function isValidCheckDigits(numbers: number[]): boolean {
  const calc = (x: number) => {
    const slice = numbers.slice(0, x)
    let factor = x - 7
    let sum = 0

    for (let i = x; i >= 1; i--) {
      const n = slice[x - i]
      sum += n * factor--
      if (factor < 2) factor = 9
    }

    const result = 11 - (sum % 11)
    return result > 9 ? 0 : result
  }

  const digits = numbers.slice(12)
  return calc(12) === digits[0] && calc(13) === digits[1]
}

// Vitest test suite
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe('flattenObject', () => {
    it('should validate the CNPJ', () => {
      expect(validateCNPJ('02.108.487/0001-56')).toBeTruthy()
      expect(validateCNPJ('02108487000156')).toBeTruthy()
      expect(validateCNPJ('02108487000151')).toBeFalsy()
      expect(validateCNPJ('0210848700015')).toBeFalsy()
      expect(validateCNPJ('021084870001563')).toBeFalsy()
    })
  
    it('should return false if value is empty', () => {
      expect(validateCNPJ('')).toBeFalsy()
    })

    it('should return false for non-numeric and invalid formatted CNPJ', () => {
      expect(validateCNPJ('abcdefghijklop')).toBeFalsy()
    })
    
    it('should return false when the sum is greater than 9', () => {
      expect(validateCNPJ('00.000.000/0001-00')).toBeFalsy()
    })
    
    it('should return false when the calculated check digits are greater than 9', () => {
      expect(validateCNPJ('11.111.111/0001-37')).toBeFalsy()
    })
  })  
}