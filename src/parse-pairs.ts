export function parsePairs(pairs: string) {
  return pairs.split(/\s+/).reduce<Record<string, string>>((obj, pair) => {
    if (!pair) return obj
    const splitPair = pair.split('=')
    obj[splitPair[0]] = splitPair[1]
    return obj
  }, {})
}
