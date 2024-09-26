export const ilikeSanitizedContains = (v: string) => `%${v.replace("%", "").replace("_", "")}%`;
