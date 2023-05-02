type TableEntry = {
  initialMonth: number | string;
  finalMonth: number | string;
  amount: number | string;
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
  const sortedTableData = tableData.sort((a, b) => Number(a.initialMonth) - Number(b.initialMonth))

  const cycles = sortedTableData.reduce<Cycle[]>((acc, entry) => {
    const existingCycleIndex = acc.findIndex(
      cycle => cycle.initialMonth <= Number(entry.initialMonth) && cycle.finalMonth >= Number(entry.finalMonth)
    )

    const entryData = {
      amount: Number(entry.amount),
      type: entry.type,
      description: entry.description || "",
      adjustment: entry.adjustment || 0,
      adjustable: entry.adjustable || false,
    }

    if (existingCycleIndex >= 0) {
      const existingCycle = acc[existingCycleIndex]

      if (existingCycle.initialMonth < Number(entry.initialMonth)) {
        acc.splice(existingCycleIndex, 1, {
          initialMonth: existingCycle.initialMonth,
          finalMonth: Number(entry.initialMonth) - 1,
          baseAmounts: existingCycle.baseAmounts,
        })

        acc.splice(existingCycleIndex + 1, 0, {
          initialMonth: Number(entry.initialMonth),
          finalMonth: Number(entry.finalMonth),
          baseAmounts: [
            ...existingCycle.baseAmounts,
            entryData,
          ],
        })

        if (existingCycle.finalMonth > Number(entry.finalMonth)) {
          acc.splice(existingCycleIndex + 2, 0, {
            initialMonth: Number(entry.finalMonth) + 1,
            finalMonth: existingCycle.finalMonth,
            baseAmounts: existingCycle.baseAmounts,
          })
        }
      } else {
        existingCycle.baseAmounts.push(entryData)
      }
    } else {
      acc.push({
        initialMonth: Number(entry.initialMonth),
        finalMonth: Number(entry.finalMonth),
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
    type: string
  ) => ({
    initialMonth,
    finalMonth,
    amount,
    type,
  })

  const createCycle = (
    initialMonth: number,
    finalMonth: number,
    baseAmounts: Array<{
      amount: number;
      type: string;
    }>
  ) => ({
    initialMonth,
    finalMonth,
    baseAmounts: baseAmounts.map(b => ({
      amount: b.amount,
      type: b.type,
      description: "",
      adjustment: 0,
      adjustable: false,
    })),
  })

  describe("groupCycles", () => {
    it.each([
      {
        testName:
          "should group base amounts with the same initialMonth and finalMonth into the same cycle",
        tableData: [
          createEntry(1, 12, 1000, "rent"),
          createEntry(1, 12, -500, "rent-discount"),
        ],
        expectedResult: [
          createCycle(1, 12, [
            { amount: 1000, type: "rent" },
            { amount: -500, type: "rent-discount" },
          ]),
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