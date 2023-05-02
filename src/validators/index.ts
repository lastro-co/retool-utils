import validateVatNumber from "~/validators/vatNumber"
import validateCNPJ from "~/validators/cnpj"
import validateCPF from "~/validators/cpf"

function validateInputVatNumberCustomRule (value: string){
  const isValid = validateVatNumber(value)
  return (value && !isValid) ? 'CPF/CNPJ inválido' : ''
}

export {
  validateVatNumber,
  validateCNPJ,
  validateCPF,
  validateInputVatNumberCustomRule
}

export default {
  validateVatNumber,
  validateCNPJ,
  validateCPF,
  validateInputVatNumberCustomRule
}


if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  const createTestParams = (value: string, expected: string) => ({ value, expected })

  it.each([
    createTestParams("493.853.650-10", ""),
    createTestParams("02.108.487/0001-56", ""),
    createTestParams("", ""),
    createTestParams("49385365013", "CPF/CNPJ inválido"),
  ])("validateInputVatNumberCustomRule($value) => $expected", ({ value, expected }) => {
    expect(validateInputVatNumberCustomRule(value)).toBe(expected)
  })
}