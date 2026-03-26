import React, { useEffect, useState } from "react";
import { Activity, ArrowRight, Radar } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { LeaderboardTable } from "../components/LeaderboardTable";

export default function LandingPage({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let intervalId;

    const load = async () => {
      try {
        const data = await apiRequest("/leaderboard");
        if (alive) {
          setLeaderboard(data.leaderboard || []);
          setError("");
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Failed to load leaderboard.");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    load();
    intervalId = window.setInterval(load, 20000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const nextRoute = !user ? "/login" : user.role === "admin" ? "/admin" : "/player";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <section className="rounded border border-cyan-200/20 bg-black/45 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-300/85">Real-time CTF Command Surface</p>
            <h1 className="font-display text-5xl uppercase leading-none text-cyan-50 sm:text-6xl">Skill Merge Leaderboard</h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              Authenticate as a player to submit flags and climb rank. Authenticate as an admin to publish new
              challenges with format rules and optional hints.
            </p>
          </div>

          <div className="w-full max-w-sm rounded border border-cyan-200/20 bg-cyan-300/10 p-4">
            <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cyan-100">
              <Activity size={14} />
              Node Status
            </div>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span>Leaderboard feed</span>
                <span className="text-emerald-300">online</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Role system</span>
                <span className="text-emerald-300">active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Flag verifier</span>
                <span className="text-emerald-300">armed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={nextRoute}
            className="inline-flex items-center gap-2 rounded border border-cyan-300/60 bg-cyan-300/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-50 transition hover:border-cyan-200"
          >
            Open {user ? "dashboard" : "login"}
            <ArrowRight size={14} />
          </Link>
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <Radar size={14} />
            Polling board every 20 seconds
          </p>
        </div>
      </section>

      {loading ? (
        <div className="rounded border border-cyan-300/20 bg-black/45 px-5 py-7 text-sm text-slate-300">
          Pulling leaderboard feed...
        </div>
      ) : (
        <LeaderboardTable leaderboard={leaderboard} />
      )}

      {error && (
        <div className="rounded border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-rose-100">
          {error}
        </div>
      )}
    </div>
  );
}
