type TableEntry = {
  initialMonth: number;
  finalMonth: number;
  amount: number;
  type: string;
  description?: string;
  adjustment?: number;
  adjustable?: boolean;
};

type Cycle = {
  initialMonth: number;
  finalMonth: number;
  baseAmounts: {
    amount: number;
    type: string;
    description?: string;
    adjustment?: number;
    adjustable?: boolean;
  }[];
};

function groupCycles(tableData: TableEntry[]): Cycle[] {
  const sortedTableData = tableData.sort((a, b) => a.initialMonth - b.initialMonth)

  const cycles = sortedTableData.reduce<Cycle[]>((acc, entry) => {
    const existingCycleIndex = acc.findIndex(
      cycle => cycle.initialMonth <= entry.initialMonth && cycle.finalMonth >= entry.finalMonth
    )

    const entryData = {
      amount: entry.amount,
      type: entry.type,
      description: entry.description || "",
      adjustment: entry.adjustment || 0,
      adjustable: entry.hasOwnProperty("adjustable") ? entry.adjustable : false,
    }

    if (existingCycleIndex >= 0) {
      const existingCycle = acc[existingCycleIndex]

      if (existingCycle.initialMonth < entry.initialMonth) {
        acc.splice(existingCycleIndex, 1, {
          initialMonth: existingCycle.initialMonth,
          finalMonth: entry.initialMonth - 1,
          baseAmounts: existingCycle.baseAmounts,
        })

        acc.splice(existingCycleIndex + 1, 0, {
          initialMonth: entry.initialMonth,
          finalMonth: entry.finalMonth,
          baseAmounts: [
            ...existingCycle.baseAmounts,
            entryData,
          ],
        })

        if (existingCycle.finalMonth > entry.finalMonth) {
          acc.splice(existingCycleIndex + 2, 0, {
            initialMonth: entry.finalMonth + 1,
            finalMonth: existingCycle.finalMonth,
            baseAmounts: existingCycle.baseAmounts,
          })
        }
      } else {
        existingCycle.baseAmounts.push(entryData)
      }
    } else {
      acc.push({
        initialMonth: entry.initialMonth,
        finalMonth: entry.finalMonth,
        baseAmounts: [entryData],
      })
    }

    return acc
  }, [])

  return cycles
}

export default groupCycles


if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('groupCycles', () => {
    it('should group base amounts with the same initialMonth and finalMonth into the same cycle', () => {
      const tableData = [
        {
          initialMonth: 1,
          finalMonth: 12,
          amount: 1000,
          type: "rent",
        },
        {
          initialMonth: 1,
          finalMonth: 12,
          amount: -500,
          type: "rent-discount",
        },
      ]

      const result = groupCycles(tableData)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 12,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
            {
              amount: -500,
              type: "rent-discount",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
      ])
    })

    it('should create separate cycles for base amounts with overlapping months', () => {
      const tableData = [
        {
          initialMonth: 1,
          finalMonth: 12,
          amount: 1000,
          type: "rent",
        },
        {
          initialMonth: 10,
          finalMonth: 12,
          amount: -500,
          type: "rent-discount",
        },
      ]

      const result = groupCycles(tableData)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 9,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 10,
          finalMonth: 12,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
            {
              amount: -500,
              type: "rent-discount",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
      ])
    })

    it('should not group base amounts with non-overlapping months into the same cycle', () => {
      const tableData = [
        {
          initialMonth: 1,
          finalMonth: 12,
          amount: 1000,
          type: "rent",
        },
        {
          initialMonth: 13,
          finalMonth: 24,
          amount: -500,
          type: "rent-discount",
        },
      ]

      const result = groupCycles(tableData)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 12,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 13,
          finalMonth: 24,
          baseAmounts: [
            {
              amount: -500,
              type: "rent-discount",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
      ])
    })

    it('should split existingCycle when entry.finalMonth is less than existingCycle.finalMonth and entry.initialMonth is greater than existingCycle.initialMonth', () => {
      const tableData = [
        {
          initialMonth: 1,
          finalMonth: 12,
          amount: 1000,
          type: "rent",
        },
        {
          initialMonth: 2,
          finalMonth: 6,
          amount: -500,
          type: "rent-discount",
        },
      ]
    
      const result = groupCycles(tableData)
      expect(result).toEqual([
        {
          initialMonth: 1,
          finalMonth: 1,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 2,
          finalMonth: 6,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
            {
              amount: -500,
              type: "rent-discount",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
        {
          initialMonth: 7,
          finalMonth: 12,
          baseAmounts: [
            {
              amount: 1000,
              type: "rent",
              description: "",
              adjustment: 0,
              adjustable: false,
            },
          ],
        },
      ])
    })
  })
}