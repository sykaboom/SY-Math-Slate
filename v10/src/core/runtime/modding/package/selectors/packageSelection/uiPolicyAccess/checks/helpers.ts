export const allowsValueWhenDefined = (
  allowedValues: readonly string[] | null | undefined,
  candidate: string
): boolean => !allowedValues || allowedValues.includes(candidate);
