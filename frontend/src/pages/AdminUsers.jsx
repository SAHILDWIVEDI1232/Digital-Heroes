import { useEffect, useState } from "react";
import { Search, Users, RefreshCw } from "lucide-react";
import api from "../api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      setUsers(response.data?.data?.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Users load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    return (
      (user.name || "").toLowerCase().includes(query) ||
      (user.email || "").toLowerCase().includes(query) ||
      (user.role || "").toLowerCase().includes(query)
    );
  });

  return (
    <section className="admin-users">
      <div className="admin-users-header">
        <div>
          <h2>User Management</h2>
          <p>Registered users aur unke account details dekho.</p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="admin-refresh-btn"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="admin-users-summary">
        <Users size={25} />
        <div>
          <strong>{users.length}</strong>
          <span>Users loaded</span>
        </div>
      </div>

      <div className="admin-users-search">
        <Search size={18} />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email or role..."
          aria-label="Search users"
        />
      </div>

      {error && <p role="alert" className="admin-users-error">{error}</p>}

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id}>
                  <td>
                    <div className="admin-user-name">
                      <span className="admin-user-avatar">
                        {(user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      {user.name || "Unnamed User"}
                    </div>
                  </td>

                  <td>{user.email || "—"}</td>

                  <td>
                    <span className={`admin-role ${user.role === "admin" ? "admin-role-admin" : ""}`}>
                      {user.role || "user"}
                    </span>
                  </td>

                  <td>
                    <span className={`admin-status ${user.isActive === false ? "admin-status-inactive" : ""}`}>
                      {user.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
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
