
import { useEffect, useState } from "react";
import api from "../api";

const emptyForm = { name: "", description: "" };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCharities() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/charities");
      setCharities(response.data.data.charities || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load charities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharities();
  }, []);

  function startEdit(charity) {
    setEditingId(charity._id);
    setForm({
      name: charity.name || "",
      description: charity.description || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.patch(`/admin/charities/${editingId}`, form);
        setMessage("Charity updated successfully.");
      } else {
        await api.post("/admin/charities", form);
        setMessage("Charity added successfully.");
      }

      cancelEdit();
      await loadCharities();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save charity.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(charity) {
    if (!window.confirm(`Delete "${charity.name}"? This cannot be undone.`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/admin/charities/${charity._id}`);
      setCharities((current) =>
        current.filter((item) => item._id !== charity._id)
      );
      setMessage("Charity deleted successfully.");

      if (editingId === charity._id) cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete charity.");
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #dce6de",
    borderRadius: 8,
    font: "inherit",
    marginTop: 6,
  };

  const buttonStyle = {
    border: 0,
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div style={{ padding: 24, color: "#203b2c", maxWidth: 1100 }}>
      <h2>Charity Management</h2>
      <p style={{ color: "#718078" }}>
        Add charities and manage existing charity records.
      </p>

      {error && (
        <p role="alert" style={{ color: "#a52d2d" }}>{error}</p>
      )}

      {message && (
        <p role="status" style={{ color: "#237448" }}>{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          padding: 22,
          background: "#fff",
          border: "1px solid #e4ece5",
          borderRadius: 14,
          margin: "24px 0",
        }}
      >
        <h3>{editingId ? "Edit Charity" : "Add New Charity"}</h3>

        <label htmlFor="charity-name">Charity name</label>
        <input
          id="charity-name"
          style={inputStyle}
          value={form.name}
          onChange={(event) =>
            setForm({ ...form, name: event.target.value })
          }
          placeholder="Enter charity name"
          required
          maxLength={120}
        />

        <label htmlFor="charity-description" style={{ display: "block", marginTop: 16 }}>
          Description
        </label>
        <textarea
          id="charity-description"
          style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          placeholder="Describe the charity and its mission"
          required
          maxLength={2000}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="submit"
            disabled={saving}
            style={{ ...buttonStyle, background: "#28563c", color: "#fff" }}
          >
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Charity"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{ ...buttonStyle, background: "#edf2ee", color: "#203b2c" }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>Existing Charities ({charities.length})</h3>

      {loading ? (
        <p>Loading charities...</p>
      ) : charities.length === 0 ? (
        <p>No charities found. Add your first charity above.</p>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {charities.map((charity) => (
            <article
              key={charity._id}
              style={{
                background: "#fff",
                border: "1px solid #e4ece5",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <h4 style={{ margin: "0 0 8px" }}>{charity.name}</h4>
              <p style={{ color: "#718078", whiteSpace: "pre-wrap" }}>
                {charity.description || "No description provided."}
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => startEdit(charity)}
                  style={{ ...buttonStyle, background: "#e8f1eb", color: "#28563c" }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(charity)}
                  style={{ ...buttonStyle, background: "#fff0ee", color: "#963c38" }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
