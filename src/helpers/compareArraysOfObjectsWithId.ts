import _ from 'lodash'

enum Status {
  CREATED = 'create',
  UPDATED = 'update',
  DELETED = 'delete',
}

interface Action {
  action: Status,
  payload: Record<string, any>
}

function compareArraysOfObjectsWithId(baseArray: Record<string, any>[], newArray: Record<string, any>[]): Set<Action> {
  const actions = new Set<Action>([])

  if (_.isEqual(baseArray, newArray)) {
    return actions
  }

  for (let key in baseArray) {
    const currentValue = baseArray[key]
    const parentValue = newArray.find(el => el.id === currentValue.id)

    if (!parentValue) {
      actions.add({
        action: Status.DELETED,
        payload: currentValue
      })
      continue
    }

    if (!_.isEqual(currentValue, parentValue)) {
      actions.add({
        action: Status.UPDATED,
        payload: parentValue
      })
      continue
    }

  }

  for (let key in newArray) {
    const currentValue = newArray[key]
    const parentValue = baseArray.find(el => el.id === currentValue.id)

    if (!parentValue) {
      actions.add({
        action: Status.CREATED,
        payload: currentValue
      })
      continue
    }
  }
  return actions
}

export default compareArraysOfObjectsWithId

export {
  compareArraysOfObjectsWithId
}

if (import.meta.vitest) {
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  type BaseAmount = {
    adjustable?: boolean
    adjustment?: number,
    amount?: number,
    description?: string,
    id?: string,
    type?: string
  }
  function baseAmount(object?: BaseAmount) {
    const {
      adjustable = true,
      adjustment = 0,
      amount = 1000,
      description = "",
      id = uuidv4(),
      type = "base-rent"
    } = object || {}

    return { adjustable, adjustment, amount, description, id, type }
  }

  const { it, expect, describe } = import.meta.vitest

  describe('compareArrays', () => {
    it('should return empty', () => {
      const arrayA = [baseAmount()]
      const arrayB = [...arrayA]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([]))
    })

    it('should return one delete action', () => {
      const arrayA = [baseAmount()]
      const arrayB = [] as []
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'delete',
        payload: arrayA[0]
      }]))
    })

    it('should return two delete action', () => {
      const arrayA = [baseAmount(), baseAmount({ amount: 100, type: 'rent-discount' })]
      const arrayB = [] as []
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'delete',
        payload: arrayA[0]
      },
      {
        action: 'delete',
        payload: arrayA[1]
      }]))
    })

    it('should return one update action', () => {
      const arrayA = [baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' })]
      const arrayB = arrayA.map((el, index) => index === 1 ? { ...el, amount: -200 } : el)
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'update',
        payload: arrayB[1]
      }]))
    })

    it('should return two update action', () => {
      const arrayA = [baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' }), baseAmount({ amount: 200, type: 'other' })]
      const arrayB = [arrayA[0], { ...arrayA[1], amount: -200 }, { ...arrayA[2], amount: 500 }]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'update',
        payload: arrayB[1]
      }, {
        action: 'update',
        payload: arrayB[2]
      }]))
    })

    it('should return one delete action and one update', () => {
      const arrayA = [baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' }), baseAmount({ amount: 200, type: 'other' })]
      const arrayB = [arrayA[0], { ...arrayA[1], amount: -200 }]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'update',
        payload: arrayB[1]
      }, {
        action: 'delete',
        payload: arrayA[2]
      }]))
    })

    it('should return one create action', () => {
      const arrayA = [] as []
      const arrayB = [baseAmount()]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'create',
        payload: arrayB[0]
      }]))
    })

    it('should return two create action', () => {
      const arrayA = [] as []
      const arrayB = [baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' })]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'create',
        payload: arrayB[0]
      }, {
        action: 'create',
        payload: arrayB[1]
      }]))
    })

    it('should return one create action, one delete action, one update action', () => {
      const arrayA = [baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' })]
      const arrayB = [{ ...arrayA[0], amount: 900 }, baseAmount({ amount: 500, type: 'other' })]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'update',
        payload: arrayB[0]
      }, {
        action: 'delete',
        payload: arrayA[1]
      }, {
        action: 'create',
        payload: arrayB[1]
      }]))
    })

    it('should return two create actions, two delete actions, two update actions', () => {
      const arrayA = [baseAmount(), baseAmount(), baseAmount({ amount: -100, type: 'rent-discount' }), baseAmount({ amount: -200, type: 'rent-discount' })]
      const arrayB = [{ ...arrayA[0], amount: 900 }, { ...arrayA[1], amount: 850 }, baseAmount({ amount: 500, type: 'other' }), baseAmount({ amount: 750, type: 'other' })]
      const result = compareArraysOfObjectsWithId(arrayA, arrayB)

      expect(result).toStrictEqual(new Set([{
        action: 'update',
        payload: arrayB[0]
      },{
        action: 'update',
        payload: arrayB[1]
      }, {
        action: 'delete',
        payload: arrayA[2]
      }, {
        action: 'delete',
        payload: arrayA[3]
      }, {
        action: 'create',
        payload: arrayB[2]
      }, {
        action: 'create',
        payload: arrayB[3]
      }]))
    })
  })
}