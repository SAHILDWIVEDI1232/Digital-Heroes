
import { useCallback, useEffect, useState } from "react";
import { Trophy, RefreshCw, CalendarDays, ArrowUpRight } from "lucide-react";
import api from "../api";
import "./Draws.css";

function formatMonth(month) {
  if (!month) return "Monthly draw";

  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "—";

  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    "Unable to load draw results. Please try again."
  );
}

export default function Draws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDraws = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/draws/published");
      setDraws(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraws();
  }, [loadDraws]);

  return (
    <div className="draws-page">
      <header className="draws-page-header">
        <div>
          <span className="draws-eyebrow">PLAYER WORKSPACE</span>
          <h2>Draw Results</h2>
          <p>
            View officially published winning numbers and monthly draw details.
          </p>
        </div>

        <button
          type="button"
          className="draws-refresh"
          onClick={loadDraws}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="draws-intro">
        <div className="draws-intro-icon">
          <Trophy size={24} />
        </div>
        <div>
          <h3>Every draw makes a difference</h3>
          <p>
            Winning numbers appear here after the draw has been published by
            an administrator.
          </p>
        </div>
      </section>

      {error && (
        <div className="draws-message draws-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadDraws} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      {!error && loading ? (
        <div className="draws-state">
          <RefreshCw size={22} />
          <p>Loading published results...</p>
        </div>
      ) : !error && draws.length === 0 ? (
        <div className="draws-empty">
          <div className="draws-empty-icon">
            <CalendarDays size={28} />
          </div>
          <h3>No published draws yet</h3>
          <p>
            Once an administrator publishes a monthly draw, its official
            winning numbers and prize details will appear here.
          </p>
          <button
            type="button"
            className="draws-empty-button"
            onClick={loadDraws}
            disabled={loading}
          >
            Check again
            <ArrowUpRight size={16} />
          </button>
        </div>
      ) : !error ? (
        <section className="draws-results">
          <div className="draws-results-heading">
            <div>
              <h3>Published draws</h3>
              <p>{draws.length} result{draws.length === 1 ? "" : "s"} available</p>
            </div>
            <span className="draws-published-badge">Official results</span>
          </div>

          {draws.map((draw) => (
            <article className="draw-result-card" key={draw._id}>
              <div className="draw-result-top">
                <div className="draw-result-month">
                  <div className="draw-result-icon">
                    <Trophy size={19} />
                  </div>
                  <div>
                    <h4>{formatMonth(draw.month)}</h4>
                    <p>
                      Published {formatDate(draw.publishedAt)}
                    </p>
                  </div>
                </div>

                <span className="draw-result-status">Published</span>
              </div>

              <div className="draw-result-divider" />

              <div className="draw-winning-label">WINNING NUMBERS</div>
              {Array.isArray(draw.winningNumbers) &&
              draw.winningNumbers.length > 0 ? (
                <div className="draw-winning-numbers">
                  {draw.winningNumbers.map((number) => (
                    <span key={number}>{number}</span>
                  ))}
                </div>
              ) : (
                <p className="draw-no-numbers">
                  No winning numbers are available for this draw.
                </p>
              )}

              <div className="draw-prize-grid">
                <div className="draw-prize-item">
                  <span>Prize pool</span>
                  <strong>{formatAmount(draw.prizePool)}</strong>
                </div>
                <div className="draw-prize-item">
                  <span>Jackpot rollover</span>
                  <strong>{formatAmount(draw.jackpotRollover)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
