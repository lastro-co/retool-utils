import consola from 'consola'

// workaround
if (typeof window !== 'undefined') {
  (window as any).consola = consola
}

import validators from '~/validators'
import formatters from '~/formatters'

export default {
  validators,
  formatters,
  consola
}
