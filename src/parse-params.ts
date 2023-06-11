export const parseParams = (params: string): Record<string, string> => {
  return params.split(/\s+/).reduce<Record<string, string>>((obj, param) => {
    if (!param) return obj
    const splitParam = param.split('=')
    obj[splitParam[0]] = splitParam[1]
    return obj
  }, {})
}
