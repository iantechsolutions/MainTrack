export const UserRoles = {
    orgAdmin: "orgAdmin",
    none: "none", // debería anularse directamente en la db
}

export const UserRolesEnum = [UserRoles.orgAdmin, UserRoles.none] as const;
