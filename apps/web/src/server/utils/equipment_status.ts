export const EquipmentStatus = {
    Operational: "operational",
    Maintenance: "maintenance",
    OutOfService: "outofservice"
}

export const EquipmentStatusEnum = [
    EquipmentStatus.Operational,
    EquipmentStatus.Maintenance,
    EquipmentStatus.OutOfService
] as const;
