import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, IndianRupee, HandHeart } from "lucide-react";
import api from "../api";

export default function AdminContributions() {
  const [contributions, setContributions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadContributions() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/contributions");
      setContributions(response.data?.data?.contributions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Contributions load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContributions();
  }, []);

  const totalPaid = useMemo(
    () =>
      contributions
        .filter((item) => item.status === "paid")
        .reduce(
          (sum, item) => sum + Number(item.contributionAmount || 0),
          0
        ),
    [contributions]
  );

  const filteredContributions = contributions.filter((item) => {
    const query = search.trim().toLowerCase();

    const userName = item.user?.name || "";
    const userEmail = item.user?.email || "";
    const charityName = item.charity?.name || "";
    const status = item.status || "unknown";

    const matchesSearch = [
      userName,
      userEmail,
      charityName,
      status,
      item._id || "",
    ].some((value) => String(value).toLowerCase().includes(query));

    return (
      matchesSearch &&
      (statusFilter === "all" || status === statusFilter)
    );
  });

  return (
    <section className="admin-contributions">
      <div className="admin-contributions-header">
        <div>
          <h2>Contribution Management</h2>
          <p>Donations aur contribution records dekho.</p>
        </div>

        <button
          type="button"
          onClick={loadContributions}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p role="alert" className="admin-error">{error}</p>}

      <div className="admin-contribution-stats">
        <div className="admin-contribution-stat">
          <HandHeart size={23} />
          <div>
            <span>Total Records</span>
            <strong>{contributions.length}</strong>
          </div>
        </div>

        <div className="admin-contribution-stat">
          <IndianRupee size={23} />
          <div>
            <span>Paid Contributions</span>
            <strong>
              {totalPaid.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-contribution-filters">
        <div className="admin-contribution-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search user, charity or status..."
            aria-label="Search contributions"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter contribution status"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading contributions...</p>
      ) : filteredContributions.length === 0 ? (
        <p>No matching contributions found.</p>
      ) : (
        <div className="admin-contributions-table-wrap">
          <table className="admin-contributions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Charity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Reference</th>
              </tr>
            </thead>

            <tbody>
              {filteredContributions.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.user?.name || "Unknown user"}</strong>
                    <small>{item.user?.email || "—"}</small>
                  </td>

                  <td>{item.charity?.name || "—"}</td>

                  <td>
                    {Number(item.contributionAmount || 0).toLocaleString(
                      "en-IN",
                      {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>

                  <td>
                    <span
                      className={`admin-contribution-status status-${String(
                        item.status || "unknown"
                      ).toLowerCase()}`}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>

                  <td title={item._id}>
                    {item._id
                      ? `${String(item._id).slice(-8)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
