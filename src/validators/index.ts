import validateVatNumber from "~/validators/vatNumber"
import validateCNPJ from "~/validators/cnpj"
import validateCPF from "~/validators/cpf"

function validateInputVatNumberCustomRule (value: string){
  const isValid = validateVatNumber(value)
  return (value && !isValid) ? 'CPF/CNPJ inválido' : ''
}

export default {
  validateVatNumber,
  validateCNPJ,
  validateCPF,
  validateInputVatNumberCustomRule
}


if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('validateCPF', () => {
    expect(validateInputVatNumberCustomRule('493.853.650-10')).toBe('')
    expect(validateInputVatNumberCustomRule('02.108.487/0001-56')).toBe('')
    expect(validateInputVatNumberCustomRule('')).toBe('')
    expect(validateInputVatNumberCustomRule('49385365013')).toBe('CPF/CNPJ inválido')
  })
}