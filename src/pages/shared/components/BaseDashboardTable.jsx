import { Link } from "react-router-dom";

export default function BaseDashboardTable() {
  const title = "Recent Transactions";
  const linkPath = "/transactions";
  const headers = ["ID", "User", "Amount", "Status"];

  const data = [
    { id: "#T-001", user: "Lara Valdez", amount: "$120.00", status: "Completed" },
    { id: "#T-002", user: "Victor Santos", amount: "$75.50", status: "Pending" },
    { id: "#T-003", user: "Celia Ramos", amount: "$200.00", status: "Failed" },
  ];

  return (
    <section className="overflow-x-auto border border-base-content/5 bg-base-100 rounded-2xl shadow-md">
      <div className="flex flex-row justify-between items-center">
        <h2 className="p-4">
          <span className="text-xl font-semibold">{title}</span>
          <span className="text-gray-400"> | This Week</span>
        </h2>
        <Link
          to={linkPath}
          className="btn btn-link no-underline text-primary hover:underline p-4"
        >
          See More ➜
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr className="bg-base-200/30 text-center">
            {headers.map((h, i) => (
              <th key={i} className="text-center">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="text-center">
              <td>{item.id}</td>
              <td>{item.user}</td>
              <td>{item.amount}</td>
              <td>
                <span
                  className={`badge ${item.status === "Completed"
                    ? "badge-success"
                    : item.status === "Pending"
                      ? "badge-warning"
                      : "badge-error"
                    }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
