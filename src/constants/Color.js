// STATIC CATEGORIES USED IN DROPDOWNS, FILTERS, BADGES

// SHARE CAPITAL PAYMENT CATEGORIES
export const CAPITAL_CATEGORY = ["Initial", "Monthly", "System"];

export const CAPITAL_CATEGORY_COLORS = {
  Initial: "badge-info",
  Monthly: "badge-secondary",
  System: "badge-warning"
};

export const INCOME_SOURCE = [
  "Loan Retention",
  "Renewal Fee",
  "Penalties",
  "Initial Membership Fee",
];

export const INCOME_SOURCE_COLORS = {
  "Loan Retention": "badge-primary",
  "Renewal Fee": "badge-neutral",
  Penalties: "badge-accent",
  Interest: "badge-info",
};


// CLUB FUNDS PAYMENT CATEGORIES
export const CLUB_CATEGORY = [
  "GMM",
  "Monthly Dues",
  "Activities",
  "Alalayang Agila",
  "Community Service",
  "Others",
];

export const CLUB_CATEGORY_COLORS = {
  GMM: "text-[#6366F1]", // Indigo
  "Monthly Dues": "text-[#22C55E]", // Green
  Activities: "text-[#FACC15]", // Yellow
  "Alalayang Agila": "text-[#F97316]", // Orange
  "Community Service": "text-[#EC4899]", // Pink
  Others: "text-[#14B8A6]", // Teal
};


// PAYMENT METHODS FROM MEMBERS
export const PAYMENT_METHODS = ["GCash", "Cash", "Bank"];

export const PAYMENT_METHOD_COLORS = {
  GCash: "badge-info",
  Cash: "badge-success",
  Bank: "badge-neutral",
};

// ECTEC MEMBER TYPES
export const MEMBER_TYPES = ["Regular", "Associate"];

export const MEMBER_TYPE_COLORS = {
  Regular: "badge-primary",
  Associate: "badge-secondary",
};

// LOAN APPLICATION STATUSES
export const LOAN_APPLICATION_STATUSES = ["Pending", "On Review", "Approved", "Denied"];

export const LOAN_APPLICATION_STATUS_COLORS = {
  Pending: "badge-warning",
  "On Review": "badge-info",
  Approved: "badge-success",
  Denied: "badge-error",
};

export const LOAN_PRODUCTS = ["Regular Loan", "Short Term Loan"]

export const LOAN_PRODUCT_COLORS = {
  "Regular Loan": "text-info",
  "Short Term Loan": "text-secondary",
};

// LOAN ACCOUNT STATUSES
export const LOAN_ACCOUNT_STATUSES = ["Active", "Closed", "Pending Release"];

export const LOAN_ACCOUNT_STATUS_COLORS = {
  Active: "badge-success",
  Closed: "badge-info",
  "Pending Release": "badge-accent",
};

export const ACTIVITY_LOGS_TYPE = ["CREATE", "UPDATE", "DELETE"];

// ACTIVITY LOGS TYPE COLORS
export const ACTIVITY_LOGS_TYPE_COLORS = {
  CREATE: "badge-success",
  UPDATE: "badge-info",
  DELETE: "badge-error",
};

// ACCOUNT STATUS OPTIONS
export const ACCOUNT_STATUS_OPTIONS = ["Active", "Inactive", "Revoked"];

export const ACCOUNT_STATUS_COLORS = {
  Active: "badge-success",
  Inactive: "badge-ghost text-gray-500",
  Revoked: "badge-error",
};

// SORT DIRECTION OPTIONS
export const SORT_DIRECTION_OPTIONS = [
  { label: "Latest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

// ROLE COLORS
export const ROLE_COLORS = {
  "treasurer": "badge-info",
  "board": "badge-accent",
  "regular-member": "badge-primary",
  "associate-member": "badge-secondary",
  "admin": "badge-neutral",
};
