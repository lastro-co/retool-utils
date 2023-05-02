import validateCNPJ from "~/validators/cnpj"
import validateCPF from "~/validators/cpf"

export default function validateVatNumber(value: string): boolean {
  const sanitizedValue = value.match(/\d+/g)?.join("") ?? ""
  const valueLength = sanitizedValue.length

  if (![11, 14].includes(valueLength) || !sanitizedValue) {
    return false
  }

  const validationFunction = {
    11: validateCPF,
    14: validateCNPJ,
  }[valueLength]

  return validationFunction ? validationFunction(sanitizedValue) : false
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('validateVatNumber', () => {
    it('should validate CPF numbers', () => {
      expect(validateVatNumber("493.853.650-10")).toBeTruthy()
      expect(validateVatNumber("49385365010")).toBeTruthy()
      expect(validateVatNumber("4938536501")).toBeFalsy()
      expect(validateVatNumber("49385365013")).toBeFalsy()
      expect(validateVatNumber("493853650144")).toBeFalsy()
    })

    it('should validate CNPJ numbers', () => {
      expect(validateVatNumber("02.108.487/0001-56")).toBeTruthy()
      expect(validateVatNumber("02108487000156")).toBeTruthy()
      expect(validateVatNumber("02108487000151")).toBeFalsy()
      expect(validateVatNumber("0210848700015")).toBeFalsy()
      expect(validateVatNumber("021084870001563")).toBeFalsy()
    })
  })
}