import consola from 'consola'

// workaround
if (typeof window !== 'undefined') {
  (window as any).consola = consola
}

import validators from '~/validators'
import formatters from '~/formatters'
import helpers from '~/helpers'

export default {
  validators,
  formatters,
  consola,
  helpers
}
