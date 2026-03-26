import React from "react";
import { motion } from "framer-motion";
import { Trophy, Flame } from "lucide-react";

export default function LeaderboardPanel({ rows = [], compact = false }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl uppercase tracking-[0.18em] text-white">Live Rankings</h2>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200/75">
          <Flame size={14} /> points + solves
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">Player</th>
              <th className="px-3 py-2 text-right">Solved</th>
              <th className="px-3 py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <motion.tr
                key={row.userId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="rounded-lg border border-white/10 bg-[#0b1419]"
              >
                <td className="rounded-l-lg border-y border-l border-white/10 px-3 py-3 font-display text-xl text-zinc-300">
                  {row.rank}
                </td>
                <td className="border-y border-white/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    {row.rank <= 3 && <Trophy size={14} className="text-amber-300" />}
                    <span className="font-semibold tracking-wide text-zinc-100">{row.username}</span>
                  </div>
                </td>
                <td className="border-y border-white/10 px-3 py-3 text-right text-zinc-200">{row.solvedCount}</td>
                <td className="rounded-r-lg border-y border-r border-white/10 px-3 py-3 text-right font-display text-lg text-emerald-200">
                  {Number(row.score).toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {!rows.length && (
        <p className="rounded-md border border-dashed border-white/20 p-5 text-center text-sm text-zinc-400">
          No players on leaderboard yet.
        </p>
      )}

      {compact && rows.length > 8 && (
        <p className="mt-3 text-right text-xs uppercase tracking-[0.2em] text-zinc-500">Showing top {rows.length}</p>
      )}
    </section>
  );
}
