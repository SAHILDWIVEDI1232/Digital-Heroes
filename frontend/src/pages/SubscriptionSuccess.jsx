
import { Link } from "react-router-dom";

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-green-500/30 bg-gray-900 p-8 text-center shadow-xl">
        <div className="mb-5 text-6xl">🎉</div>

        <h1 className="mb-3 text-3xl font-bold text-white">
          Subscription Successful!
        </h1>

        <p className="mb-6 text-gray-300">
          Thank you for joining Digital Heroes.
          Your support helps make a difference through charity.
        </p>

        <div className="mb-6 rounded-xl bg-gray-800 p-4">
          <p className="text-sm text-gray-400">
            Payment confirmation
          </p>
          <p className="mt-1 font-semibold text-green-400">
            Your subscription is being confirmed.
          </p>
        </div>

        <Link
          to="/"
          className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}