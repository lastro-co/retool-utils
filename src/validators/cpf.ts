export default function validateCPF(value: string) {
  // https://gist.github.com/joaohcrangel/8bd48bcc40b9db63bef7201143303937#gistcomment-4006668
  value = value.replace(/[^\d]+/g, '')

  if (value.length !== 11 || !!value.match(/(\d)\1{10}/)) {
    return false
  }

  const cpf = value.split('').map(el => +el)

  const rest = (count: number) => (
    Array.from(cpf.slice(0, count - 12))
      .reduce((soma, el, index) => (soma + el * (count - index)), 0) * 10) % 11 % 10

  return rest(10) === cpf[9] && rest(11) === cpf[10]
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest
  it('validateCPF', () => {
    expect(validateCPF('493.853.650-10')).toBeTruthy()
    expect(validateCPF('49385365010')).toBeTruthy()
    expect(validateCPF('4938536501')).toBeFalsy()
    expect(validateCPF('49385365013')).toBeFalsy()
    expect(validateCPF('493853650144')).toBeFalsy()
  })
}