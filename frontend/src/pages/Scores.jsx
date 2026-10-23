
import { useCallback, useEffect, useState } from "react";
import { Flag, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import api from "../api";
import "./Scores.css";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    "Request failed. Please check that the backend is running."
  );
}

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [score, setScore] = useState("36");
  const [playedAt, setPlayedAt] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadScores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/scores");
      setScores(response.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const resetForm = () => {
    setScore("36");
    setPlayedAt(new Date().toLocaleDateString("en-CA"));
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const numericScore = Number(score);

    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 45) {
      setError("Score must be a whole number between 1 and 45.");
      return;
    }

    if (!playedAt) {
      setError("Please select the date you played.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`/scores/${editingId}`, {
          score: numericScore,
        });
        setNotice("Score updated successfully.");
      } else {
        await api.post("/scores", {
          score: numericScore,
          playedAt,
        });
        setNotice("Score added successfully.");
      }

      resetForm();
      await loadScores();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setScore(String(item.score));
    setPlayedAt(item.playedAt);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete the score ${item.score} recorded on ${item.playedAt}?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/scores/${item.id}`);
      setNotice("Score deleted successfully.");
      if (editingId === item.id) resetForm();
      await loadScores();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="scores-page">
      <header className="scores-page-header">
        <div>
          <span className="scores-eyebrow">PLAYER WORKSPACE</span>
          <h1>My Scores</h1>
          <p>Record your Stableford scores and track your golf journey.</p>
        </div>

        <button
          className="scores-refresh"
          onClick={loadScores}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <div className="scores-message scores-error">{error}</div>}
      {notice && <div className="scores-message scores-success">{notice}</div>}

      <section className="scores-form-card">
        <div className="scores-card-heading">
          <div className="scores-heading-icon"><Flag size={20} /></div>
          <div>
            <h2>{editingId ? "Edit score" : "Record a round"}</h2>
            <p>
              {editingId
                ? "Update the score for this round."
                : "Enter your score and the date you played."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="scores-form">
          <label>
            Stableford score
            <input
              type="number"
              min="1"
              max="45"
              step="1"
              required
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="Enter 1–45"
            />
          </label>

          <label>
            Date played
            <input
              type="date"
              required
              max={new Date().toLocaleDateString("en-CA")}
              disabled={Boolean(editingId)}
              value={playedAt}
              onChange={(event) => setPlayedAt(event.target.value)}
            />
          </label>

          <div className="scores-form-actions">
            <button className="scores-submit" type="submit" disabled={saving}>
              <Plus size={17} />
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Add score"}
            </button>

            {editingId && (
              <button
                className="scores-cancel"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <p className="scores-form-note">
          Scores must be between 1 and 45. Only one score per date is allowed.
          Your latest five scores are retained.
        </p>
      </section>

      <section className="scores-list-card">
        <div className="scores-list-heading">
          <div>
            <h2>Recent rounds</h2>
            <p>Your latest five recorded scores.</p>
          </div>
          <span className="scores-count">{scores.length} / 5</span>
        </div>

        {loading ? (
          <div className="scores-empty">Loading your scores...</div>
        ) : scores.length === 0 ? (
          <div className="scores-empty">
            <div className="scores-empty-icon"><Flag size={25} /></div>
            <h3>No scores yet</h3>
            <p>Add your first round using the form above.</p>
          </div>
        ) : (
          <div className="scores-table-wrap">
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Date played</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(`${item.playedAt}T12:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td><span className="score-value">{item.score}</span></td>
                    <td>
                      <div className="scores-row-actions">
                        <button
                          type="button"
                          className="score-action"
                          onClick={() => startEdit(item)}
                          aria-label="Edit score"
                          title="Edit score"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="score-action score-delete"
                          onClick={() => handleDelete(item)}
                          aria-label="Delete score"
                          title="Delete score"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
