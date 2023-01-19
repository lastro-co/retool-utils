import validateCNPJ from "~/validators/cnpj"
import validateCPF from "~/validators/cpf"

export default function validateVatNumber(value: string) {
  value = String(value.match(/\d+/g)?.join(''))

  if(![11, 14].includes(value.length)) {
    return false
  }
  return {
    11: validateCPF(value),
    14: validateCNPJ(value)
  }[value.length]
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('validateCPF', () => {
    expect(validateVatNumber('493.853.650-10')).toBeTruthy()
    expect(validateVatNumber('49385365010')).toBeTruthy()
    expect(validateVatNumber('4938536501')).toBeFalsy()
    expect(validateVatNumber('49385365013')).toBeFalsy()
    expect(validateVatNumber('493853650144')).toBeFalsy()
    expect(validateVatNumber('02.108.487/0001-56')).toBeTruthy()
    expect(validateVatNumber('02108487000156')).toBeTruthy()
    expect(validateVatNumber('02108487000151')).toBeFalsy()
    expect(validateVatNumber('0210848700015')).toBeFalsy()
    expect(validateVatNumber('021084870001563')).toBeFalsy()
  })
}