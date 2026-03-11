export interface OrderedItem {
  id: string
  order: number
}

export function sortByOrder<T extends OrderedItem>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order)
}

export function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length))
}

export function insertAtIndex<T>(items: T[], item: T, index: number): T[] {
  const next = [...items]
  next.splice(clampIndex(index, next.length), 0, item)
  return next
}

export function reindexItemsInDisplayOrder<T extends OrderedItem>(items: T[]): T[] {
  return items.map((item, index) => (
    item.order === index ? item : { ...item, order: index }
  ))
}
