
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function MySubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadSubscription() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/subscriptions/me");

      // Supports both { data: subscription } and
      // { data: { data: subscription } } response formats.
      const result = response.data?.data;
      const subscriptionData = result?.data ?? result ?? null;

      setSubscription(subscriptionData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscription();
  }, []);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription at the end of the billing period?"
    );

    if (!confirmed) return;

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      // Backend route: POST /subscriptions/cancel
      const response = await api.post("/subscriptions/cancel");

      const result = response.data?.data;
      const updatedSubscription = result?.data ?? result;

      if (
        updatedSubscription &&
        typeof updatedSubscription === "object"
      ) {
        setSubscription((current) => ({
          ...current,
          ...updatedSubscription,
        }));
      }

      setMessage(
        response.data?.message ||
          "Your cancellation request was submitted."
      );

      // Reload the latest subscription state from the backend.
      await loadSubscription();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel your subscription."
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 p-8 text-center text-white">
        Loading subscription...
      </main>
    );
  }

  if (!subscription) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <h1 className="mb-3 text-2xl font-bold">
            No Subscription Found
          </h1>

          <p className="mb-6 text-gray-400">
            Subscribe to a plan to support your selected charity.
          </p>

          {error && (
            <p role="alert" className="mb-4 text-red-400">
              {error}
            </p>
          )}

          <Link
            to="/subscription"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold hover:bg-green-700"
          >
            View Plans
          </Link>
        </div>
      </main>
    );
  }

  const status = String(subscription.status || "unknown").toLowerCase();

  const selectedCharity = subscription.selectedCharity;

  const charity =
    typeof selectedCharity === "object" && selectedCharity !== null
      ? selectedCharity.name || selectedCharity.title
      : typeof selectedCharity === "string"
        ? selectedCharity
        : null;

  const periodEnd =
    subscription.currentPeriodEnd ||
    subscription.current_period_end ||
    subscription.endDate;

  const formattedEndDate = periodEnd
    ? (() => {
        const date = new Date(periodEnd);

        return Number.isNaN(date.getTime())
          ? "Not available"
          : date.toLocaleDateString();
      })()
    : "Not available";

  const canCancel =
    ["active", "trialing", "past_due"].includes(status) &&
    !subscription.cancelAtPeriodEnd &&
    !subscription.cancel_at_period_end;

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold">
          My Subscription
        </h1>

        <p className="mb-8 text-gray-400">
          Manage your plan and charity contribution.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-950 p-4 text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-4 rounded-lg bg-green-950 p-4 text-green-300"
          >
            {message}
          </div>
        )}

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Subscription Details
            </h2>

            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm capitalize">
              {status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-400">Plan</p>
              <p className="mt-1 font-semibold capitalize">
                {subscription.plan || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Charity</p>
              <p className="mt-1 font-semibold">
                {charity || "Charity information unavailable"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Charity Contribution
              </p>
              <p className="mt-1 font-semibold">
                {subscription.charityPercentage ??
                  subscription.contributionPercentage ??
                  10}
                %
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Renewal / End Date
              </p>
              <p className="mt-1 font-semibold">
                {formattedEndDate}
              </p>
            </div>
          </div>

          {(subscription.cancelAtPeriodEnd ||
            subscription.cancel_at_period_end) && (
            <p className="mt-6 rounded-lg bg-yellow-950 p-3 text-yellow-300">
              Your subscription is scheduled to cancel at the end
              of the current billing period.
            </p>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="mt-8 rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelling
                ? "Processing..."
                : "Cancel Subscription"}
            </button>
          )}
        </section>

        <Link
          to="/dashboard"
          className="mt-6 inline-block text-green-400 hover:text-green-300"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
