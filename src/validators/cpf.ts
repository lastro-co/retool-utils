export default function validateCPF(value: string) {
  if (!isValidFormat(value)) return false

  const cpf = extractNumbers(value)

  return cpf.length === 11 && !hasRepeatedDigits(cpf) && validateCheckDigits(cpf)
}

function isValidFormat(value: string): boolean {
  const digitsOnly = /^\d{11}$/.test(value)
  const validFormat = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value)

  return digitsOnly || validFormat
}

function extractNumbers(value: string): number[] {
  const match = value.match(/\d/g)
  return Array.isArray(match) ? match.map(Number) : []
}

function hasRepeatedDigits(numbers: number[]): boolean {
  return new Set(numbers).size === 1
}

function validateCheckDigits(numbers: number[]): boolean {
  const rest = (count: number) =>
    (numbers
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
    11 %
    10

  return rest(10) === numbers[9] && rest(11) === numbers[10]
}

// Vitest test suite
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it.each([
    { value: "493.853.650-10", expected: true },
    { value: "49385365010", expected: true },
    { value: "4938536501", expected: false },
    { value: "49385365013", expected: false },
    { value: "493853650144", expected: false },
  ])("validateCPF($value) => $expected", ({ value, expected }) => {
    expect(validateCPF(value)).toBe(expected)
  })
}