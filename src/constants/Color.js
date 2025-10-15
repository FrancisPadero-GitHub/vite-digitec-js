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
export const PAYMENT_METHODS = ["GCash", "Cash"];

export const PAYMENT_METHOD_COLORS = {
  GCash: "badge-info",
  Cash: "badge-success",
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

export const LOAN_ACCOUNTS_STATUSES = ["Active", "Defaulted", "Renewed"];

export const LOAN_ACCOUNT_STATUS_COLORS = {
  Active: "badge-success",
  Defaulted: "badge-error",
  Renewed: "badge-warning",
};

// SORT DIRECTION OPTIONS
export const SORT_DIRECTION_OPTIONS = [
  { label: "Latest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

// ROLE COLORS
export const ROLE_COLORS = {
  Treasurer: "badge-info",
  "Board": "badge-accent",
  "Regular": "badge-primary",
  "Associate": "badge-secondary",
  "Admin": "badge-error",
};
