import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname;

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
  };

  const handleLogin = async () => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(form),
    });

    onLogin(data.token, data.user);
    navigate(redirectPath || (data.user.role === "admin" ? "/admin" : "/player"), { replace: true });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "register") {
        await handleRegister();
        setMessage("Player account created. You can now login.");
        setMode("login");
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="grid md:grid-cols-2">
          <div className="border-b border-white/10 bg-[linear-gradient(140deg,#09211d,#0b1526)] p-6 md:border-b-0 md:border-r md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Access Gate</p>
            <h1 className="mt-4 font-display text-4xl uppercase tracking-[0.13em] text-white">Login Node</h1>
            <p className="mt-4 text-sm text-zinc-300">
              Admin accounts are bootstrapped from environment variables. Players can self-register here.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                  mode === "login"
                    ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
                    : "border-white/20 text-zinc-300"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                  mode === "register"
                    ? "border-cyan-300/70 bg-cyan-300/20 text-cyan-100"
                    : "border-white/20 text-zinc-300"
                }`}
              >
                Register Player
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 p-6 md:p-8">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">Username</label>
              <input
                value={form.username}
                onChange={(event) => updateField("username", event.target.value)}
                required
                minLength={3}
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/60"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-zinc-400">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/60"
              />
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}
            {message && <p className="text-sm text-emerald-300">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md border border-emerald-200/70 bg-emerald-300/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100 transition hover:bg-emerald-300/25 disabled:opacity-50"
            >
              {loading ? "Working..." : mode === "login" ? "Secure Login" : "Create Player"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
