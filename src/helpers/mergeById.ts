type Item = {
  id?: string;
  [key: string]: any;
};

function mergeById(existingArray: Item[], newArray: Item[]): Item[] {
  const combinedArray: Item[] = [...existingArray]

  newArray.forEach((newItem: Item) => {
    if (!newItem.id){
      combinedArray.push(newItem)
      return
    }
    const index = combinedArray.findIndex(
      (existingItem: Item) => existingItem.id === newItem.id
    )
    if (index !== -1) {
      combinedArray[index] = newItem
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
  })
}

export default mergeById