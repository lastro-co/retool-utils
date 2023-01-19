const formatVatNumber = (string: string) => {
  const s = string.replace(/\D/g, '')
  return {
    11: `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9, 11)}`,
    14: `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12, 14)}`
  }[s.length] || string
}

export {
  formatVatNumber
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('validateCNPJ', () => {
    expect(formatVatNumber('02.108.487/0001-56')).toBe('02.108.487/0001-56')
    expect(formatVatNumber('02108487000156')).toBe('02.108.487/0001-56')
    expect(formatVatNumber('493.853.650-10')).toBe('493.853.650-10')
    expect(formatVatNumber('49385365010')).toBe('493.853.650-10')
    expect(formatVatNumber('4938536501')).toBe('4938536501')
  })
}