
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, CreditCard, RefreshCw } from "lucide-react";
import api from "../api";

export default function Subscription() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [percentage, setPercentage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadCharities() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/charities");
      const list = (response.data.data || []).filter(
        (charity) => charity.isActive !== false
      );

      setCharities(list);
      setCharityId((current) =>
        list.some((charity) => charity._id === current)
          ? current
          : list[0]?._id || ""
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load charities. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCharities();
  }, []);

  
async function handleSubscribe(event) {
  event.preventDefault();
  setError("");
  setMessage("");

  const selectedId = String(charityId || "").trim();

  if (!selectedId) {
    setError("Please select a charity first.");
    return;
  }

  setSubmitting(true);

  try {
    const response = await api.post("/subscriptions/checkout", {
      plan,
      selectedCharity: selectedId,
      charityPercentage: Number(percentage),
    });

    const data = response.data?.data || {};
    const checkoutUrl =
      data.url || data.checkoutUrl || data.session?.url;

    if (checkoutUrl) {
      window.location.assign(checkoutUrl);
      return;
    }

    setMessage(
      "Checkout URL nahi mila. Backend response check karo."
    );
  } catch (err) {
    console.error(
      "Subscription checkout error:",
      err.response?.data || err
    );

    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to start checkout. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: "#43805b", fontWeight: 700, fontSize: 12 }}>
          PLAY. WIN. GIVE.
        </p>
        <h2 style={{ color: "#173e2b", marginBottom: 8 }}>
          Subscription & Charity
        </h2>
        <p style={{ color: "#68796f" }}>
          Choose a cause you care about and decide how much to contribute.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: "#fff0ee",
            color: "#963c38",
            padding: 14,
            borderRadius: 10,
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div role="status" style={{ padding: 14, marginBottom: 18 }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubscribe}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #e4ebe5",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: "#173e2b" }}>
            <Heart size={19} style={{ verticalAlign: "middle" }} /> Select
            your charity
          </h3>

          {loading ? (
            <p>Loading charities…</p>
          ) : charities.length === 0 ? (
            <div>
              <p>No active charities found.</p>
              <button type="button" onClick={loadCharities}>
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginTop: 16,
              }}
            >
              {charities.map((charity) => {
                const selected = charityId === charity._id;

                return (
                  <button
                    key={charity._id}
                    type="button"
                    onClick={() => setCharityId(charity._id)}
                    aria-pressed={selected}
                    style={{
                      textAlign: "left",
                      padding: 16,
                      borderRadius: 12,
                      border: selected
                        ? "2px solid #32744d"
                        : "1px solid #dfe8e1",
                      background: selected ? "#f0f8f1" : "#fff",
                      cursor: "pointer",
                      color: "#244b35",
                    }}
                  >
                    <strong>{charity.name}</strong>
                    <p style={{ margin: "8px 0", fontSize: 13 }}>
                      {charity.category}
                    </p>
                    <span style={{ fontSize: 13 }}>
                      {selected ? "✓ Selected" : "Choose this charity"}
                    </span>
                    {charity.description && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#68796f",
                          lineHeight: 1.5,
                        }}
                      >
                        {charity.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e4ebe5",
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <h3 style={{ color: "#173e2b" }}>
            <CreditCard size={19} style={{ verticalAlign: "middle" }} /> Choose
            your plan
          </h3>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {["monthly", "yearly"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPlan(option)}
                aria-pressed={plan === option}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 12,
                  border:
                    plan === option
                      ? "2px solid #32744d"
                      : "1px solid #dfe8e1",
                  background: plan === option ? "#f0f8f1" : "#fff",
                  cursor: "pointer",
                  color: "#244b35",
                  fontWeight: 700,
                }}
              >
                {option === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>

          <label
            htmlFor="charityPercentage"
            style={{
              display: "block",
              marginTop: 24,
              marginBottom: 8,
              color: "#244b35",
              fontWeight: 600,
            }}
          >
            Charity contribution percentage
          </label>

          <select
            id="charityPercentage"
            value={percentage}
            onChange={(event) => setPercentage(Number(event.target.value))}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 9,
              border: "1px solid #dfe8e1",
              background: "#fff",
            }}
          >
            {[10, 15, 20, 25, 50, 75, 100].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>

          <p style={{ fontSize: 12, color: "#68796f", lineHeight: 1.6 }}>
            At least 10% is required. Your final subscription price will be
            shown by Stripe at checkout.
          </p>
        </section>

        <button
          type="submit"
          disabled={loading || submitting || !charityId}
          style={{
            width: "100%",
            padding: 15,
            border: 0,
            borderRadius: 10,
            background: "#245d3c",
            color: "#fff",
            fontWeight: 700,
            cursor:
              loading || submitting || !charityId ? "not-allowed" : "pointer",
            opacity: loading || submitting || !charityId ? 0.6 : 1,
          }}
        >
          {submitting ? "Connecting to Stripe…" : "Continue to secure checkout"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: 16,
          padding: "10px 0",
          border: 0,
          background: "transparent",
          color: "#32744d",
          cursor: "pointer",
        }}
      >
        ← Back to dashboard
      </button>
    </div>
  );
}
