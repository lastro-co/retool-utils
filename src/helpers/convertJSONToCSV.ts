function convertJSONToCSV(jsonArr: Array<Object>): string {
  if (jsonArr.length === 0) {
    return ''
  }
  
  const uniqueKeys = new Set<string>()
  const rows: string[] = []

  jsonArr.forEach(obj => {
    Object.keys(obj).forEach(key => {
      uniqueKeys.add(key)
    })
  })

  const headers = Array.from(uniqueKeys)

  jsonArr.forEach(obj => {
    const row: (string | number)[] = new Array(headers.length).fill('')
    Object.entries(obj).forEach(([key, value]) => {
      const columnIndex = headers.indexOf(key)
      row[columnIndex] = typeof value === 'string' ? `"${value}"` : value
    })
    rows.push(row.join(','))
  })

  return `${headers.join(',')}\n${rows.join('\n')}`
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest

  describe('convertJSONToCSV', () => {
    const jsonData = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 }
    ]

    const expectedCSV = 'id,name,age\n1,"John",30\n2,"Jane",25'

    it('converts JSON array to CSV string', () => {
      const csv = convertJSONToCSV(jsonData)
      expect(csv).toEqual(expectedCSV)
    })

    it('handles empty JSON array', () => {
      const emptyData: Array<Object> = []
      const emptyCSV = convertJSONToCSV(emptyData)
      expect(emptyCSV).toEqual('')
    })

    it('handles JSON array with inconsistent keys', () => {
      const inconsistentData = [
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane' }
      ]

      const expectedInconsistentCSV = 'id,name,age\n1,"John",30\n2,"Jane",'

      const csv = convertJSONToCSV(inconsistentData)
      expect(csv).toEqual(expectedInconsistentCSV)
    })
  })
}

export default convertJSONToCSV