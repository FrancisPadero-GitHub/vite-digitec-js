// VALID ROLES WITH LABELS (DISPLAYED IN UI) AND PATHS (USED IN ROUTES)
export const roleInfo = {
  treasurer: { label: "Treasurer", path: "treasurer" },
  board: { label: "Board of Director", path: "board" },
  "regular-member": { label: "Regular Member", path: "regular-member" },
  "associate-member": { label: "Associate Member", path: "associate-member" },
  admin: { label: "System Admin", path: "admin" },
};

// GET ROLE LABEL AND/OR PATH
export const getRoleLabel = (role) => roleInfo[role].label;
export const getRolePath = (role) => roleInfo[role].path;
