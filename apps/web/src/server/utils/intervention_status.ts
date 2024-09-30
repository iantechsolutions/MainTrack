export const IntStatus = {
  Pending: "pending",
};

export const IntStatusText: { [key: string]: string } = {
  pending: "Pendiente",
};

export const IntStatusEnum = [IntStatus.Pending] as const;
