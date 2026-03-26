import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Shield, LogOut, UserCircle2 } from "lucide-react";

const navClass = ({ isActive }) =>
  `rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
    isActive
      ? "border-emerald-300/80 bg-emerald-300/15 text-emerald-100"
      : "border-white/15 text-zinc-300 hover:border-emerald-200/60 hover:text-emerald-100"
  }`;

export default function TopNav({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070d10]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-emerald-300/70 bg-emerald-300/15">
            <Shield size={16} className="text-emerald-200" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-200/70">Skill Merge</p>
            <p className="font-display text-lg uppercase tracking-[0.12em] text-white">Leaderboard Core</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavLink to="/" className={navClass}>
            Leaderboard
          </NavLink>
          {user && user.role === "player" && (
            <NavLink to="/player" className={navClass}>
              Player
            </NavLink>
          )}
          {user && user.role === "admin" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
          )}
          {user && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-100 transition hover:border-rose-200/70"
            >
              <UserCircle2 size={14} /> {user.username}
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
