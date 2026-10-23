
import { Link } from "react-router-dom";

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-8 text-center shadow-xl">
        <div className="mb-5 text-6xl">↩️</div>

        <h1 className="mb-3 text-3xl font-bold text-white">
          Checkout Cancelled
        </h1>

        <p className="mb-6 text-gray-300">
          No worries! Your checkout was cancelled.
          You can return and subscribe whenever you're ready.
        </p>

        <Link
          to="/subscription"
          className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
