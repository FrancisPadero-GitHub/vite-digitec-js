// USED IN MEMBER PROFILE; WHEN THE TREASURER/BOARD WANTS TO VIEW THE FINANCIAL RECORDS OF A MEMBER
// 3 TABS; CONTAINS SHARE CAPITAL, CLUB FUND, AND LOANS (ONGOING/PAST AND THEIR PAYMENT SCHEDS)
import Proptypes from "prop-types";
const FinanceTab = ({
  headers = [],
  data = [],
  label,
  icon,
  renderRow,
  isDefault = false,
  isLoading,
  isError,
  error,
}) => {
  return (
    <>
      <label className="tab">
        <input type="radio" name="finances-tab" defaultChecked={isDefault} />{" "}
        {icon} {label}
      </label>

      <div className="tab-content w-full bg-base-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">{label}</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center gap-3">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-sm text-gray-600">
                Loading {label.toLowerCase()}...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center text-error">
              <p className="font-medium">
                Failed to load {label.toLowerCase()}
              </p>
              <p className="text-sm text-gray-600">
                {error?.message || "Something went wrong"}
              </p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="border border-base-content/10 rounded-lg overflow-hidden">
            <div className="max-h-[50vh] min-h-[50vh] overflow-y-auto overflow-x-auto">
              <table className="table w-full">
                <thead className="sticky top-0 bg-base-200/80 z-10">
                  <tr>
                    {headers.map((header, key) => (
                      <th key={key} className="text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{data.map((item) => renderRow(item))}</tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-500">
              No {label.toLowerCase()} records available.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

FinanceTab.propTypes = {
  headers: Proptypes.array,
  data: Proptypes.array,
  label: Proptypes.string,
  icon: Proptypes.node,
  renderRow: Proptypes.func,
  isDefault: Proptypes.bool,
  isLoading: Proptypes.bool,
  isError: Proptypes.bool,
  error: Proptypes.object,
};

export default FinanceTab;
