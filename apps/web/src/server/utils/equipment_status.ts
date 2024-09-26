export const EquipmentStatus = {
  Operational: "operational",
  Maintenance: "maintenance",
  OutOfService: "outofservice",
};

export const EquipmentStatusText: { [key: string]: string } = {
  operational: "Operativo",
  maintenance: "En mantenimiento",
  outofservice: "Fuera de servicio",
};

export const EquipmentStatusEnum = [EquipmentStatus.Operational, EquipmentStatus.Maintenance, EquipmentStatus.OutOfService] as const;
