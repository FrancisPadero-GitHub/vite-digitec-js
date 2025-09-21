// VALID ROLES WITH LABELS (DISPLAYED IN UI) AND PATHS (USED IN ROUTES)

/**
 * Update
 *
 * Only topbar is using this now to render the member role under the name
 * Temporary existence
 * will implement a better way to do this wihout this one
 *
 */

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
