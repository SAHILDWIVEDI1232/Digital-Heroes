
import { useEffect, useState } from "react";
import api from "../api";

const formatMoney = (amount, currency = "inr") => {
  const value = Number(amount ?? 0) / 100;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: String(currency || "inr").toUpperCase(),
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DonationHistory = () => {
  const [contributions, setContributions] = useState([]);
  const [totalContribution, setTotalContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/subscriptions/contributions"
        );

        const result = response.data?.data;

        setContributions(result?.contributions ?? []);
        setTotalContribution(
          Number(result?.totalContribution ?? 0)
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Donation history load nahi ho paayi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <div className="donation-history">
      <div className="donation-history__header">
        <div>
          <h1>Donation History</h1>
          <p>
            Track your contributions and the charities
            supported through your subscription.
          </p>
        </div>
      </div>

      <div className="donation-history__summary">
        <div className="donation-history__card">
          <span>Total Contributions</span>
          <strong>
            {formatMoney(totalContribution, "inr")}
          </strong>
          <small>Recorded paid contributions</small>
        </div>

        <div className="donation-history__card">
          <span>Total Records</span>
          <strong>{contributions.length}</strong>
          <small>Contribution transactions</small>
        </div>
      </div>

      <section className="donation-history__section">
        <h2>Contribution Records</h2>

        {loading ? (
          <p className="donation-history__message">
            Loading donation history...
          </p>
        ) : error ? (
          <div
            className="donation-history__message donation-history__error"
            role="alert"
          >
            {error}
          </div>
        ) : contributions.length === 0 ? (
          <div className="donation-history__empty">
            <h3>No contributions yet</h3>
            <p>
              Your recorded contributions will appear here
              after a subscription invoice is paid.
            </p>
          </div>
        ) : (
          <div className="donation-history__table-wrap">
            <table className="donation-history__table">
              <thead>
                <tr>
                  <th>Paid Date</th>
                  <th>Charity</th>
                  <th>Percentage</th>
                  <th>Contribution</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {contributions.map((item) => (
                  <tr key={item._id}>
                    <td>{formatDate(item.paidAt)}</td>

                    <td>
                      {item.charity?.name || "Charity"}
                    </td>

                    <td>
                      {Number(item.charityPercentage ?? 0)}%
                    </td>

                    <td>
                      {formatMoney(
                        item.contributionAmount,
                        item.currency
                      )}
                    </td>

                    <td>
                      <span
                        className={`donation-history__status donation-history__status--${item.status}`}
                      >
                        {item.status || "unknown"}
                      </span>
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
};

export default DonationHistory;
