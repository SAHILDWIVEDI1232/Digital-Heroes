
import { useState } from "react";
import { Flag, Heart, ArrowLeft, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import "./Auth.css";

export default function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/auth/register"
        : "/auth/login";

      const payload = isRegister
        ? form
        : {
            email: form.email,
            password: form.password,
          };

      const response = await api.post(endpoint, payload);
      const data = response.data?.data;

      const token =
        data?.token ??
        data?.accessToken ??
        response.data?.token ??
        response.data?.accessToken;

      if (!token) {
        setError(
          "Account request succeeded, but no token was returned. Check your backend response format."
        );
        return;
      }

      localStorage.setItem("dh_token", token);

      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Unable to connect. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-art">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <Flag size={22} />
          </span>
          <span>
            <strong>Digital Heroes</strong>
            <small>PLAY WITH PURPOSE</small>
          </span>
        </Link>

        <div className="auth-art-content">
          <div className="auth-eyebrow">
            GOLF THAT GIVES BACK
          </div>
          <h1>
            Make every
            <br />
            round <em>count.</em>
          </h1>
          <p>
            Track your game, follow monthly draws and help
            support causes that matter.
          </p>
          <div className="auth-heart">
            <Heart size={24} />
            <span>Good golf. Greater good.</span>
          </div>
        </div>

        <div className="auth-art-footer">
          Digital Heroes · Member portal
        </div>
      </section>

      <section className="auth-form-side">
        <Link to="/" className="auth-back">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="auth-form-wrap">
          <div className="auth-mobile-logo">
            <span className="auth-brand-icon">
              <Flag size={22} />
            </span>
            <strong>Digital Heroes</strong>
          </div>

          <div className="auth-eyebrow">
            MEMBER ACCESS
          </div>
          <h2>
            {isRegister ? "Join the community." : "Welcome back."}
          </h2>
          <p className="auth-subtitle">
            {isRegister
              ? "Create your account and start making an impact."
              : "Sign in to continue your golf journey."}
          </p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <label className="auth-field">
                Full name
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              Password
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                required
              />
            </label>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading && (
                <LoaderCircle className="auth-spinner" size={17} />
              )}
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister
              ? "Already have an account?"
              : "New to Digital Heroes?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create account"}
            </Link>
          </p>

          <p className="auth-legal">
            By continuing, you agree to use Digital Heroes
            responsibly and in accordance with its terms.
          </p>
        </div>
      </section>
    </main>
  );
}
