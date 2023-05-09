interface BaseAmountInlined {
  initialMonth: number;
  finalMonth: number;
  cycleId?: string;
  id?: string;
  amount: string | number;
  type: string;
  description: string;
  adjustment: string | number;
  adjustable: boolean;
}

interface BaseAmount {
  cycleId?: string;
  id?: string;
  amount: string | number;
  type: string;
  description: string;
  adjustment: string | number;
  adjustable: boolean;
}

interface Cycle {
  initialMonth: number;
  finalMonth: number;
  id?: string;
  baseAmounts: BaseAmount[];
}

function ungroupCycles(RentBaseAmount: Cycle[]): BaseAmountInlined[] {
  if (!RentBaseAmount || RentBaseAmount.length === 0) {
    return [
      {
        initialMonth: 0,
        finalMonth: 0,
        amount: 1,
        type: "base-rent",
        description: "",
        adjustment: 0,
        adjustable: false,
      }
    ]
  }
  return RentBaseAmount.flatMap(cycle => {
    if (cycle.baseAmounts.length === 0) {
      const entry: BaseAmountInlined = {
        initialMonth: cycle.initialMonth,
        finalMonth: cycle.finalMonth,
        amount: 0,
        type: "",
        description: "",
        adjustment: 0,
        adjustable: false,
      }
  
      if (cycle.id) {
        entry.cycleId = cycle.id
      }
  
      return [entry]
    }
  
    return cycle.baseAmounts.map(baseAmount => {
      const entry: BaseAmountInlined = {
        initialMonth: cycle.initialMonth,
        finalMonth: cycle.finalMonth,
        amount: baseAmount.amount,
        type: baseAmount.type,
        description: baseAmount.description,
        adjustment: baseAmount.adjustment,
        adjustable: baseAmount.adjustable,
      }
  
      if (baseAmount.id && baseAmount.id !== "") {
        entry.id = baseAmount.id
      }
  
      if (cycle.id) {
        entry.cycleId = cycle.id
      }
  
      return entry
    })
  })
}

export default ungroupCycles

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  function toNumber(value: number | string | undefined | null): number {
    if (value === undefined || value === null) {
      return 0
    }
    return typeof value === "number" ? value : Number(value) || 0
  }

  const createEntry = (
    initialMonth: number | string,
    finalMonth: number | string,
    amount: number | string,
    type: string,
    id: string | undefined,
    cycleId: string | undefined,
    description = "",
    adjustment: number | string = 0,
    adjustable = false
  ) => {
    const entry: BaseAmountInlined = {
      initialMonth: toNumber(initialMonth),
      finalMonth: toNumber(finalMonth),
      amount: toNumber(amount),
      type,
      description,
      adjustment: toNumber(adjustment),
      adjustable,
    }
  
    if (id) {
      entry['id'] = id
    }
    if (cycleId) {
      entry['cycleId'] = cycleId
    }
  
    return entry
  }

  const createBaseAmount: ( 
    id: string,
    amount: number | string,
    type: string,
    description?: string,
    adjustment?: number | string,
    adjustable?: boolean
  ) => BaseAmount = (
    id,
    amount,
    type,
    description = "",
    adjustment: number | string = 0,
    adjustable = false
  ) => ({
    id,
    amount: toNumber(amount),
    type,
    description,
    adjustment: toNumber(adjustment),
    adjustable,
  })

  const createCycle: ( 
    initialMonth: number | string,
    finalMonth: number | string,
    baseAmounts: BaseAmount[],
    id?: string
  ) => Cycle = (
    initialMonth,
    finalMonth,
    baseAmounts,
    id
  ) => ({
    id,
    initialMonth: toNumber(initialMonth),
    finalMonth: toNumber(finalMonth),
    baseAmounts,
  })

  describe("ungroupCycles", () => {
    it.each([
      {
        testName: "should handle empty input",
        input: [],
        expectedResult: [
          createEntry(0, 0, 1, "base-rent", "", "", "", 0, false),
        ],
      },
      {
        testName: "should handle single and multiple cycles with varying baseAmounts",
        input: [
          createCycle(1, 1, [
            createBaseAmount("baseAmount1", 1000, "base-rent"),
          ], "id"),
          createCycle(2, 3, [
            createBaseAmount("baseAmount1", 1000, "base-rent"),
            createBaseAmount("baseAmount2", "-500", "rent-discount"),
          ]),
          createCycle(3, 5, [
            createBaseAmount("baseAmount3", "1100", "base-rent"),
            createBaseAmount("baseAmount4", "600", "maintenance", "", "100", true),
          ]),
          createCycle("6", "7", [createBaseAmount("baseAmount5", "1200", "base-rent")]),
        ],
        expectedResult: [
          createEntry(1, 1, 1000, "base-rent", "baseAmount1", "id"),
          createEntry(2, 3, 1000, "base-rent", "baseAmount1", undefined),
          createEntry(2, 3, -500, "rent-discount", "baseAmount2", undefined),
          createEntry(3, 5, 1100, "base-rent", "baseAmount3", undefined),
          createEntry(3, 5, 600, "maintenance", "baseAmount4", undefined, "", 100, true),
          createEntry(6, 7, 1200, "base-rent", "baseAmount5", undefined),
        ],
      },
      {
        testName: "should handle cycle with empty baseAmounts",
        input: [
          createCycle(1, 1, [])
        ],
        expectedResult: [
          createEntry(1, 1, 0, "", "", "", "", 0, false),
        ],
      },
      {
        testName: "should handle missing cycleId for baseAmount",
        input: [
          createCycle(1, 1, [
            createBaseAmount("baseAmount1", 1000, "base-rent")
          ]),
          createCycle(2, 2, [
            createBaseAmount("baseAmount2", 2000, "base-rent", "", 100, true),
          ]),
          {
            ...createCycle(3, 3, [
              createBaseAmount("baseAmount3", 3000, "base-rent", "", 200, true),
            ]),
            id: undefined,
          },
        ],
        expectedResult: [
          createEntry(1, 1, 1000, "base-rent", "baseAmount1", undefined),
          createEntry(2, 2, 2000, "base-rent", "baseAmount2", undefined, "", 100, true),
          createEntry(3, 3, 3000, "base-rent", "baseAmount3", "", "", 200, true),
        ],
      },
      {
        testName: "should handle invalid number input for adjustment",
        input: [
          createCycle(1, 1, [
            createBaseAmount("baseAmount1", 1000, "base-rent", "", "invalid", true),
          ]),
        ],
        expectedResult: [
          createEntry(1, 1, 1000, "base-rent", "baseAmount1", undefined, "", 0, true),
        ],
      },
    ])("$testName", ({ input, expectedResult }) => {
      const result = ungroupCycles(input as Cycle[]) // You need to do a type assertion here
      expect(result).toEqual(expectedResult)
    })
  })
}