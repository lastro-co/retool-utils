export default function validateCNPJ(value: string) {
  switch (true) {
    case !value:
    case !isValidFormat(value):
      return false

    default:
      const numbers = extractNumbers(value)

      return (
        numbers.length === 14 &&
        !hasRepeatedDigits(numbers) &&
        isValidCheckDigits(numbers)
      )
  }
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

// ... (restante do código)

// Vitest test suite
if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest

  describe("validateCNPJ", () => {
    it.each([
      {
        value: "02.108.487/0001-56",
        expected: true
      },
      {
        value: "02108487000156",
        expected: true
      },
      {
        value: "02108487000151",
        expected: false
      },
      {
        value: "0210848700015",
        expected: false
      },
      {
        value: "021084870001563",
        expected: false
      },
      {
        value: "",
        expected: false
      },
      {
        value: "abcdefghijklop",
        expected: false
      },
      {
        value: "00.000.000/0001-00",
        expected: false
      },
      {
        value: "11.111.111/0001-37",
        expected: false
      },
    ])("validateCNPJ($value) => $expected", ({ value, expected }) => {
      expect(validateCNPJ(value)).toBe(expected)
    })
  })
}