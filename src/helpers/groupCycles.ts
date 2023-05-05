type TableEntry = {
  initialMonth: number | string;
  finalMonth: number | string;
  amount: number | string;
  type: string;
  description?: string;
  adjustment?: number | string;
  adjustable?: boolean;
  cycleId?: string;
  id?: string;
};

type Cycle = {
  id?: string;
  initialMonth: number;
  finalMonth: number;
  baseAmounts: {
    id?: string;
    amount: number;
    type: string;
    description?: string;
    adjustment?: number;
    adjustable?: boolean;
  }[];
};

function toNumber(value: number | string | undefined | null): number {
  if (value === undefined || value === null) {
    return 0
  }
  return typeof value === 'number' ? value : Number(value) || 0
}

function toBoolean(value: boolean | undefined): boolean {
  return value || false
}

function groupCycles(tableData: TableEntry[]): Cycle[] {
  const sortedTableData = tableData.sort((a, b) => toNumber(a.initialMonth) - toNumber(b.initialMonth))

  const cycles = sortedTableData.reduce<Cycle[]>((acc, entry) => {
    const existingCycleIndex = acc.findIndex(
      cycle => (cycle.id && entry.cycleId ? cycle.id === entry.cycleId : true) && cycle.initialMonth <= toNumber(entry.initialMonth) && cycle.finalMonth >= toNumber(entry.finalMonth)
    )

    const entryData = {
      id: entry.id ?? undefined,
      amount: toNumber(entry.amount),
      type: entry.type,
      description: entry.description || "",
      adjustment: toNumber(entry.adjustment),
      adjustable: toBoolean(entry.adjustable),
    }

    if (existingCycleIndex >= 0) {
      const existingCycle = acc[existingCycleIndex]

      if (existingCycle.initialMonth < toNumber(entry.initialMonth)) {
        acc.splice(existingCycleIndex, 1, {
          id: existingCycle.id,
          initialMonth: existingCycle.initialMonth,
          finalMonth: toNumber(entry.initialMonth) - 1,
          baseAmounts: existingCycle.baseAmounts,
        })

        acc.splice(existingCycleIndex + 1, 0, {
          id: existingCycle.id,
          initialMonth: toNumber(entry.initialMonth),
          finalMonth: toNumber(entry.finalMonth),
          baseAmounts: [
            ...existingCycle.baseAmounts,
            entryData,
          ],
        })

        if (existingCycle.finalMonth > toNumber(entry.finalMonth)) {
          acc.splice(existingCycleIndex + 2, 0, {
            id: existingCycle.id,
            initialMonth: toNumber(entry.finalMonth) + 1,
            finalMonth: existingCycle.finalMonth,
            baseAmounts: existingCycle.baseAmounts,
          })
        }
      } else {
        existingCycle.baseAmounts.push(entryData)
      }
    } else {
      acc.push({
        id: entry.cycleId ?? undefined,
        initialMonth: toNumber(entry.initialMonth),
        finalMonth: toNumber(entry.finalMonth),
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

  const createEntry = (
    initialMonth: number | string,
    finalMonth: number | string,
    amount: number | string,
    type: string,
    id?: string,
    cycleId?: string
  ) => ({
    id,
    cycleId,
    initialMonth,
    finalMonth,
    amount,
    type,
  })

  const createCycle = (
    initialMonth: number,
    finalMonth: number,
    baseAmounts: Array<{
      id?: string,
      amount: number;
      type: string;
      description?: string;
      adjustment?: number;
      adjustable?: boolean;
    }>,
    id?: string
  ) => ({
    id,
    initialMonth,
    finalMonth,
    baseAmounts: baseAmounts.map(b => ({
      id: b.id,
      amount: b.amount,
      type: b.type,
      description: b.description || "",
      adjustment: b.adjustment || 0,
      adjustable: b.adjustable || false,
    })),
  })

  describe("groupCycles", () => {
    it.each([
      {
        testName:
          "should group base amounts with the same initialMonth and finalMonth into the same cycle",
        tableData: [
          createEntry(1, 12, 1000, "rent", "base-amount-1", "cycle-1"),
          createEntry(1, 12, -500, "rent-discount", "base-amount-2", "cycle-1"),
        ],
        expectedResult: [
          createCycle(1, 12, [
            { id: "base-amount-1", amount: 1000, type: "rent" },
            { id: "base-amount-2", amount: -500, type: "rent-discount" },
          ], "cycle-1"),
        ],
      },
      {
        testName:
          "should create separate cycles for base amounts with overlapping months",
        tableData: [
          createEntry(1, 12, 1000, "rent"),
          createEntry(10, 12, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 9, [{ amount: 1000, type: "rent" }]),
          createCycle(10, 12, [
            { amount: 1000, type: "rent" },
            { amount: -500, type: "rent-discount" },
          ]),
        ],
      },
      {
        testName:
          "should not group base amounts with non-overlapping months into the same cycle",
        tableData: [
          createEntry(1, 12, 1000, "rent"),
          createEntry(13, 24, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 12, [{ amount: 1000, type: "rent" }]),
          createCycle(13, 24, [{ amount: -500, type: "rent-discount" }]),
        ],
      },
      {
        testName:
          "should split existingCycle when entry.finalMonth is less than existingCycle.finalMonth and entry.initialMonth is greater than existingCycle.initialMonth",
        tableData: [
          createEntry(1, 12, 1000, "rent"),
          createEntry(2, 6, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 1, [{ amount: 1000, type: "rent" }]),
          createCycle(2, 6, [
            { amount: 1000, type: "rent" },
            { amount: -500, type: "rent-discount" },
          ]),
          createCycle(7, 12, [{ amount: 1000, type: "rent" }]),
        ],
      },
    ])("$testName", ({ tableData, expectedResult }) => {
      expect(groupCycles(tableData)).toEqual(expectedResult)
    })
  })
}