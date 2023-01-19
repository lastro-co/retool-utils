import consola from 'consola'

// workaround
if (typeof window !== 'undefined') {
  (window as any).consola = consola
}

import validators from '~/validators'

export default {
  validators,
  consola
}
