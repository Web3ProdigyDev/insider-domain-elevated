export function solFirst<T>(list: readonly T[], getSymbol: (item: T) => string): T[] {
  const index = list.findIndex((item) => getSymbol(item).toUpperCase() === "SOL");
  if (index <= 0) return [...list];
  return [list[index], ...list.slice(0, index), ...list.slice(index + 1)];
}
