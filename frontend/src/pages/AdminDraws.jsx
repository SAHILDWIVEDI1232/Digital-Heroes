import { useEffect, useState } from "react";
import api from "../api";

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    drawDate: "",
  });

  async function loadDraws() {
    try {
      setLoading(true);
      const response = await api.get("/admin/draws");
      setDraws(response.data?.data?.draws || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Draws load nahi ho paaye."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDraws();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api.post("/admin/draws", form);
      setForm({ title: "", drawDate: "" });
      setMessage("Draw create ho gaya.");
      await loadDraws();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Draw create nahi ho paaya. Backend draw fields check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-draws">
      <h2>Draw Management</h2>
      <p>Create aur manage draws from admin panel.</p>

      {error && <p role="alert" style={{ color: "#dc2626" }}>{error}</p>}
      {message && <p style={{ color: "#15803d" }}>{message}</p>}

      <form onSubmit={handleSubmit} className="admin-draw-form">
        <label>
          Draw Title
          <input
            required
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            placeholder="e.g. November 2026 Draw"
          />
        </label>

        <label>
          Draw Date
          <input
            required
            type="date"
            value={form.drawDate}
            onChange={(e) =>
              setForm({ ...form, drawDate: e.target.value })
            }
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Draw"}
        </button>
      </form>

      <h3>Existing Draws</h3>

      {loading ? (
        <p>Loading draws...</p>
      ) : draws.length === 0 ? (
        <p>No draws available.</p>
      ) : (
        <div className="admin-draw-list">
          {draws.map((draw) => (
            <article className="admin-draw-card" key={draw._id}>
              <h4>{draw.title || draw.name || draw.month || "Draw"}</h4>
              <p>
                Date:{" "}
                {draw.drawDate
                  ? new Date(draw.drawDate).toLocaleDateString()
                  : draw.date
                    ? new Date(draw.date).toLocaleDateString()
                    : "Not specified"}
              </p>
              <p>
                Status: {draw.status || (draw.isPublished ? "Published" : "Created")}
              </p>
              {draw.winningNumbers && (
                <p>
                  Winning Numbers:{" "}
                  {Array.isArray(draw.winningNumbers)
                    ? draw.winningNumbers.join(", ")
                    : String(draw.winningNumbers)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
