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
  id: string;
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
      return [
        {
          initialMonth: cycle.initialMonth,
          finalMonth: cycle.finalMonth,
          cycleId: cycle.id,
          id: "",
          amount: "",
          type: "",
          description: "",
          adjustment: "",
          adjustable: false,
        },
      ]
    }

    return cycle.baseAmounts.map(baseAmount => {
      return {
        initialMonth: cycle.initialMonth,
        finalMonth: cycle.finalMonth,
        cycleId: cycle.id,
        id: baseAmount.id,
        amount: baseAmount.amount,
        type: baseAmount.type,
        description: baseAmount.description,
        adjustment: baseAmount.adjustment,
        adjustable: baseAmount.adjustable,
      }
    })
  })
}

export default ungroupCycles

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe("ungroupCycles", () => {
    it("should handle empty input", () => {
      const result = ungroupCycles([])
      expect(result).toEqual([
        {
          initialMonth: 0,
          finalMonth: 0,
          amount: 1,
          type: "base-rent",
          description: "",
          adjustment: 0,
          adjustable: false,
        },
      ])
    })

    it("should handle a single cycle with no baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "",
          amount: "",
          type: "",
          description: "",
          adjustment: "",
          adjustable: false,
        },
      ])
    })

    it("should handle a single cycle with one baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount1",
          amount: "1000",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
      ])
    })

    it("should handle a single cycle with two baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount2",
              amount: "500",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount1",
          amount: "1000",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount2",
          amount: "500",
          type: "taxes",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
      ])
    })

    it("should handle a single cycle with three baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount2",
              amount: "500",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount3",
              amount: "200",
              type: "maintenance",
              description: "",
              adjustment: "0",
              adjustable: true,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount1",
          amount: "1000",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount2",
          amount: "500",
          type: "taxes",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount3",
          amount: "200",
          type: "maintenance",
          description: "",
          adjustment: "0",
          adjustable: true,
        },
      ])
    })
    it("should handle three cycles with one baseAmount", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 3,
          finalMonth: 4,
          id: "cycle2",
          baseAmounts: [
            {
              id: "baseAmount2",
              amount: "1100",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 5,
          finalMonth: 6,
          id: "cycle3",
          baseAmounts: [
            {
              id: "baseAmount3",
              amount: "1200",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 2,
          cycleId: "cycle1",
          id: "baseAmount1",
          amount: "1000",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
        {
          initialMonth: 3,
          finalMonth: 4,
          cycleId: "cycle2",
          id: "baseAmount2",
          amount: "1100",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
        {
          initialMonth: 5,
          finalMonth: 6,
          cycleId: "cycle3",
          id: "baseAmount3",
          amount: "1200",
          type: "base-rent",
          description: "",
          adjustment: "0",
          adjustable: false,
        },
      ])
    })

    it("should handle three cycles with two baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount2",
              amount: "500",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 3,
          finalMonth: 4,
          id: "cycle2",
          baseAmounts: [
            {
              id: "baseAmount3",
              amount: "1100",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount4",
              amount: "550",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 5,
          finalMonth: 6,
          id: "cycle3",
          baseAmounts: [
            {
              id: "baseAmount5",
              amount: "1200",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount6",
              amount: "600",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toHaveLength(6)
    })

    it("should handle three cycles with three baseAmounts", () => {
      const input: Cycle[] = [
        {
          initialMonth: 1,
          finalMonth: 2,
          id: "cycle1",
          baseAmounts: [
            {
              id: "baseAmount1",
              amount: "1000",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount2",
              amount: "500",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount3",
              amount: "200",
              type: "maintenance",
              description: "",
              adjustment: "0",
              adjustable: true,
            },
          ],
        },
        {
          initialMonth: 3,
          finalMonth: 4,
          id: "cycle2",
          baseAmounts: [
            {
              id: "baseAmount4",
              amount: "1100",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount5",
              amount: "550",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount6",
              amount: "220",
              type: "maintenance",
              description: "",
              adjustment: "0",
              adjustable: true,
            },
          ],
        },
        {
          initialMonth: 5,
          finalMonth: 6,
          id: "cycle3",
          baseAmounts: [
            {
              id: "baseAmount7",
              amount: "1200",
              type: "base-rent",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount8",
              amount: "600",
              type: "taxes",
              description: "",
              adjustment: "0",
              adjustable: false,
            },
            {
              id: "baseAmount9",
              amount: "240",
              type: "maintenance",
              description: "",
              adjustment: "0",
              adjustable: true,
            },
          ],
        },
      ]
      const result = ungroupCycles(input)
      expect(result).toHaveLength(9)
    })
  })
}