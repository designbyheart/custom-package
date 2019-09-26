// @flow

// TODO:KS
// Explain the need for this function

export const flattenAsync = (
  fn: (...variableArgs: any[]) => Promise<any>
) => async (
  ...args: Array<any>
): Promise<[null | typeof Error, null | any]> => {
  try {
    const response = await fn(...args)
    return [null, response]
  } catch (e) {
    return [e, null]
  }
}
