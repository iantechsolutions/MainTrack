export const OtType = {
  A: "A",
  B: "B",
};

export const OtTypeText: { [key: string]: string } = {
  A: "A",
  B: "B",
};

export const OtTypeEnum = [OtType.A, OtType.B] as const;
