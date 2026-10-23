
import { useEffect, useState } from "react";
import api from "../api";

const sections = [
  { key: "users", title: "Users", endpoint: "/admin/users", listKey: "users" },
  { key: "charities", title: "Charities", endpoint: "/admin/charities", listKey: "charities" },
  { key: "draws", title: "Draws", endpoint: "/admin/draws", listKey: "draws" },
  {
    key: "contributions",
    title: "Contributions",
    endpoint: "/admin/contributions",
    listKey: "contributions",
  },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [lists, setLists] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.all([
        api.get("/admin/overview"),
        ...sections.map((section) => api.get(section.endpoint)),
      ]);

      setOverview(results[0].data.data);

      const nextLists = {};
      sections.forEach((section, index) => {
        const responseData = results[index + 1].data.data;
        nextLists[section.key] = responseData?.[section.listKey] ?? [];
      });

      setLists(nextLists);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load admin data. Please check your admin login."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const cards = overview
    ? [
        ["Total users", overview.totalUsers],
        ["Charities", overview.totalCharities],
        ["Draws", overview.totalDraws],
        ["Winners", overview.totalWinners],
        ["Contributions", overview.totalContributions],
        [
          "Paid contribution amount",
          `₹${Number(overview.totalPaidContributions ?? 0).toLocaleString("en-IN")}`,
        ],
      ]
    : [];

  return (
    <div style={{ padding: 24, color: "#203b2c" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ marginBottom: 6 }}>Admin Dashboard</h2>
          <p style={{ margin: 0, color: "#718078" }}>
            Manage and review Digital Heroes platform data.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={loading}
          style={{
            padding: "10px 16px",
            border: 0,
            borderRadius: 8,
            background: "#28563c",
            color: "#fff",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Refresh data"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 8,
            background: "#fff0ee",
            color: "#963c38",
          }}
        >
          {error}
        </div>
      )}

      {loading && !overview ? (
        <p>Loading admin overview...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 30,
          }}
        >
          {cards.map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: 20,
                background: "#fff",
                border: "1px solid #e7eee8",
                borderRadius: 12,
                boxShadow: "0 3px 12px rgba(25, 55, 35, 0.04)",
              }}
            >
              <div style={{ color: "#718078", fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>
                {value ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.map((section) => {
        const items = lists[section.key] ?? [];

        return (
          <section key={section.key} style={{ marginBottom: 28 }}>
            <h3>{section.title} ({items.length})</h3>

            {loading && !lists[section.key] ? (
              <p>Loading {section.title.toLowerCase()}...</p>
            ) : items.length === 0 ? (
              <p style={{ color: "#718078" }}>No records found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                  }}
                >
                  <thead>
                    <tr>
                      {Object.keys(items[0]).slice(0, 5).map((key) => (
                        <th
                          key={key}
                          style={{
                            textAlign: "left",
                            padding: 12,
                            background: "#f4f8f4",
                            borderBottom: "1px solid #e7eee8",
                          }}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item._id ?? item.id ?? index}>
                        {Object.keys(items[0]).slice(0, 5).map((key) => {
                          const value = item[key];
                          const display =
                            value == null
                              ? "—"
                              : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value);

                          return (
                            <td
                              key={key}
                              style={{
                                padding: 12,
                                borderBottom: "1px solid #edf1ed",
                                fontSize: 13,
                                maxWidth: 260,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {display.length > 100
                                ? `${display.slice(0, 100)}…`
                                : display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
