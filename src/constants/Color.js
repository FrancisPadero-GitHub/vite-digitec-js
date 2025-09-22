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
  "Loan Retention": "bg-[#6366F1] text-white", // Indigo
  "Renewal Fee": "bg-[#22C55E] text-white", // Green
  Penalties: "bg-[#F97316] text-white", // Orange
  "Initial Membership Fee": "bg-[#EC4899] text-white", // Pink
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
export const LOAN_APPLICATION_STATUSES = ["Pending", "Approved", "Rejected"];

export const LOAN_APPLICATION_STATUS_COLORS = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-error",
};

// SORT DIRECTION OPTIONS
export const SORT_DIRECTION_OPTIONS = [
  { label: "Latest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

// ROLE COLORS
export const ROLE_COLORS = {
  Treasurer: "badge-info",
  "Board of Director": "badge-accent",
  "Regular Member": "badge-primary",
  "Associate Member": "badge-secondary",
  "System Admin": "badge-error",
};
