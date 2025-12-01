import { useLocation } from "react-router-dom";

// const roleTitles = {
//   treasurer: "Treasurer Help",
//   board: "Board Help",
//   "regular-member": "Member Help",
//   "associate-member": "Associate Member Help",
//   admin: "Admin Help",
// };

const roleSections = {
  treasurer: [
    { title: "Releases", desc: "Manage loan releases and validations." },
    {
      title: "Club Funds",
      desc: "Track funds, expenses, and reconciliations.",
    },
    { title: "Payment Schedules", desc: "View and export payment schedules." },
    { title: "Payments", desc: "Record and verify payments." },
  ],
  board: [
    { title: "Applications", desc: "Review and approve loan applications." },
    { title: "Loan Accounts", desc: "Monitor active loans and statuses." },
    { title: "Schedules", desc: "Check amortization and schedules." },
    { title: "Announcements", desc: "Post updates and notices." },
  ],
  "regular-member": [
    { title: "Profile", desc: "Update your member information." },
    { title: "Coop Loans", desc: "Apply for a loan and track status." },
    { title: "Payments", desc: "View dues and payment history." },
    { title: "Reports", desc: "Download statements and reports." },
  ],
  "associate-member": [
    { title: "Coop Loans", desc: "Explore loan options and requirements." },
    { title: "Reports", desc: "Access available documents." },
  ],
  admin: [
    { title: "Users", desc: "Manage user accounts and roles." },
    { title: "Login Credentials", desc: "Create credentials for users." },
    {
      title: "System Settings",
      desc: "Configure products and system options.",
    },
  ],
};

function getRoleFromPathname(pathname) {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (
    [
      "treasurer",
      "board",
      "regular-member",
      "associate-member",
      "admin",
    ].includes(seg)
  )
    return seg;
  return "regular-member"; // default
}

function AdminHelp() {
  const { pathname } = useLocation();
  const role = getRoleFromPathname(pathname);

  const sections = roleSections[role] || [];

  return (
    <div className="m-3 space-y-3">
      <header className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
          Help
        </h1>
        <span className="badge badge-primary capitalize">
          {role.replace("-", " ")}
        </span>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s, i) => (
          <div
            key={i}
            className="card bg-base-100 border border-base-300 shadow-sm"
          >
            <div className="card-body">
              <h2 className="card-title text-base-content">{s.title}</h2>
              <p className="text-sm text-base-content/70">{s.desc}</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">View guide</button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-base-100 border border-base-300 rounded-xl p-4">
        <h3 className="font-medium mb-2">Common Help</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-base-content/80">
          <li>How to change theme (Dark/Light)</li>
          <li>How notifications work</li>
          <li>Account security and password reset</li>
        </ul>
      </section>
    </div>
  );
}

export default AdminHelp;
