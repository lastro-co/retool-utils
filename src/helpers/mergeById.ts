type Item = {
  id?: string;
  [key: string]: any;
};

function mergeById(existingArray: Item[], newArray: Item[]): Item[] {
  const combinedArray: Item[] = [...existingArray]

  newArray.forEach((newItem: Item) => {
    if (!newItem.id) {
      combinedArray.push(newItem)
      return
    }
    const index = combinedArray.findIndex(
      (existingItem: Item) => existingItem.id === newItem.id
    )
    if (index !== -1) {
      combinedArray[index] = { ...combinedArray[index], ...newItem }
    } else {
      combinedArray.push(newItem)
    }
  })

  return combinedArray
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe("mergeById", () => {
    it("should handle merging empty arrays", () => {
      const result = mergeById([], [])
      expect(result).toEqual([])
    })

    it("should merge two arrays with no duplicate IDs", () => {
      const existingArray: Item[] = [{ id: "1", value: "a" }]
      const newArray: Item[] = [{ id: "2", value: "b" }]
      const result = mergeById(existingArray, newArray)
      expect(result).toEqual([
        { id: "1", value: "a" },
        { id: "2", value: "b" },
      ])
    })

    it("should overwrite items with the same ID", () => {
      const existingArray: Item[] = [{ id: "1", value: "a" }]
      const newArray: Item[] = [{ id: "1", value: "b" }]
      const result = mergeById(existingArray, newArray)
      expect(result).toEqual([{ id: "1", value: "b" }])
    })

    it("should overwrite items with the same ID and add the one with missing id", () => {
      const existingArray: Item[] = [{ id: "1", value: "a" }]
      const newArray: Item[] = [{ id: "1", value: "b" }, { value: "c" }]
      const result = mergeById(existingArray, newArray)
      expect(result).toEqual([{ id: "1", value: "b" }, { value: "c" }])
    })

    it("should handle a combination of cases", () => {
      const existingArray: Item[] = [
        { id: "1", value: "a" },
        { id: "2", value: "b" },
      ]
      const newArray: Item[] = [
        { id: "2", value: "c" },
        { id: "3", value: "d" },
      ]
      const result = mergeById(existingArray, newArray)
      expect(result).toEqual([
        { id: "1", value: "a" },
        { id: "2", value: "c" },
        { id: "3", value: "d" },
      ])
    })

    it("should handle a combination of cases", () => {
      const existingArray: Item[] = [
        {
          adjustable: true,
          adjustment: "0",
          amount: "1100",
          cycleId: "ea4312e4-7eb1-4eb0-83d9-4eebe6fa066b",
          description: "",
          finalMonth: 12,
          id: "3ba3895c-490b-447c-9015-c1bd819fe381",
          initialMonth: 1,
          type: "base-rent"
        },
        {
          adjustable: true,
          adjustment: "0",
          amount: "-100",
          cycleId: "ea4312e4-7eb1-4eb0-83d9-4eebe6fa066b",
          description: "",
          finalMonth: 12,
          id: "1fb852a6-1ddf-47d2-9544-af6eb59a5d95",
          initialMonth: 1,
          type: "rent-discount"
        },
      ]
      const newArray: Item[] = [
        {
          adjustable: true,
          adjustment: "0",
          amount: "-110",
          description: "",
          id: "1fb852a6-1ddf-47d2-9544-af6eb59a5d95",
          type: "rent-discount"
        },
      ]
      const result = mergeById(existingArray, newArray)
      expect(result).toEqual([
        {
          adjustable: true,
          adjustment: "0",
          amount: "1100",
          cycleId: "ea4312e4-7eb1-4eb0-83d9-4eebe6fa066b",
          description: "",
          finalMonth: 12,
          id: "3ba3895c-490b-447c-9015-c1bd819fe381",
          initialMonth: 1,
          type: "base-rent"
        },
        {
          adjustable: true,
          adjustment: "0",
          amount: "-110",
          cycleId: "ea4312e4-7eb1-4eb0-83d9-4eebe6fa066b",
          description: "",
          finalMonth: 12,
          id: "1fb852a6-1ddf-47d2-9544-af6eb59a5d95",
          initialMonth: 1,
          type: "rent-discount"
        },
      ])
    })
  })
}

export default mergeById