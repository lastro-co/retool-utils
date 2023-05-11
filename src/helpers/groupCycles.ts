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
  return typeof value === "number" ? value : Number(value) || 0
}

function toBoolean(value: boolean | undefined): boolean {
  return value || false
}

function findExistingCycle(cycles: Cycle[], entry: TableEntry): Cycle | undefined {
  return cycles.find(
    (cycle) =>
      cycle.id === entry.cycleId &&
      cycle.initialMonth <= toNumber(entry.initialMonth) &&
      cycle.finalMonth >= toNumber(entry.finalMonth),
  )
}

function createUpdatedCycle(cycle: Cycle, left: Cycle | undefined, right: Cycle| undefined): Cycle[] {
  return [left, cycle, right].filter((c) => !!c) as Cycle[]
}

function groupCycles(tableData: TableEntry[]): Cycle[] {
  const sortedTableData = tableData.sort(
    (a, b) => toNumber(a.initialMonth) - toNumber(b.initialMonth) ||
      toNumber(b.finalMonth) - toNumber(a.finalMonth),
  )

  return sortedTableData.reduce<Cycle[]>((accumulator, entry) => {
    const entryData = {
      ...(entry.id && { id: entry.id }),
      amount: toNumber(entry.amount),
      type: entry.type,
      description: entry.description || "",
      adjustment: toNumber(entry.adjustment),
      adjustable: toBoolean(entry.adjustable),
    }

    const existingCycle = findExistingCycle(accumulator, entry)
    if (!existingCycle) {
      accumulator.push({
        ...(entry.cycleId && { id: entry.cycleId }),
        initialMonth: toNumber(entry.initialMonth),
        finalMonth: toNumber(entry.finalMonth),
        baseAmounts: [entryData],
      })
      return accumulator
    }

    const left =
      existingCycle.initialMonth < toNumber(entry.initialMonth)
        ? {
            ...existingCycle,
            finalMonth: toNumber(entry.initialMonth) - 1,
          }
        : undefined

    const right =
      existingCycle.finalMonth > toNumber(entry.finalMonth)
        ? {
            ...existingCycle,
            initialMonth: toNumber(entry.finalMonth) + 1,
          }
        : undefined

    const updatedCurrent = {
      ...existingCycle,
      initialMonth: Math.max(existingCycle.initialMonth, toNumber(entry.initialMonth)),
      finalMonth: Math.min(existingCycle.finalMonth, toNumber(entry.finalMonth)),
      baseAmounts: [...existingCycle.baseAmounts, entryData],
    }

    const updatedCycles = createUpdatedCycle(updatedCurrent, left, right)
    accumulator = accumulator.filter((cycle) => cycle !== existingCycle)
    accumulator.push(...updatedCycles)
    
    return accumulator
  }, [])
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
      {
        testName:
          "should properly handle entryData with equal initialMonth and finalMonth",
        tableData: [
          createEntry(1, 36, 3700, "base-rent"),
          createEntry(1, 1, -3700, "rent-free"),
          createEntry(2, 7, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 1, [
            { amount: 3700, type: "base-rent" },
            { amount: -3700, type: "rent-free" },
          ]),
          createCycle(2, 7, [
            { amount: 3700, type: "base-rent" },
            { amount: -500, type: "rent-discount" },
          ]),
          createCycle(8, 36, [{ amount: 3700, type: "base-rent" }]),
        ],
      },
      {
        testName:
          "should properly handle entryData with equal initialMonth and finalMonth (different order)",
        tableData: [
          createEntry(1, 1, -3700, "rent-free"),
          createEntry(1, 36, 3700, "base-rent"),
          createEntry(2, 7, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 1, [
            { amount: 3700, type: "base-rent" },
            { amount: -3700, type: "rent-free" },
          ]),
          createCycle(2, 7, [
            { amount: 3700, type: "base-rent" },
            { amount: -500, type: "rent-discount" },
          ]),
          createCycle(8, 36, [{ amount: 3700, type: "base-rent" }]),
        ],
      },
      {
        testName: "should return id and cycleId properties when they are provided",
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
      }
    ])("$testName", ({ tableData, expectedResult }) => {
      expect(groupCycles(tableData)).toEqual(expectedResult)
    })
  })
}