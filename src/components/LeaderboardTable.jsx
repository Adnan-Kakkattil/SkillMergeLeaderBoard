import React from "react";
import { Trophy } from "lucide-react";

export function LeaderboardTable({ leaderboard = [] }) {
  return (
    <div className="overflow-hidden rounded border border-cyan-200/20 bg-black/35 backdrop-blur">
      <div className="grid grid-cols-12 border-b border-cyan-200/15 px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-slate-400 sm:px-6">
        <div className="col-span-2">Rank</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-2 text-center">Solved</div>
        <div className="col-span-3 text-right">Points</div>
      </div>

      <div className="divide-y divide-cyan-200/10">
        {leaderboard.length ? (
          leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className="grid grid-cols-12 items-center gap-3 px-4 py-4 transition hover:bg-cyan-200/5 sm:px-6"
            >
              <div className="col-span-2 text-2xl font-black text-cyan-50">{entry.rank}</div>
              <div className="col-span-5">
                <p className="font-display text-xl uppercase tracking-tight text-slate-100">{entry.username}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  {entry.rank <= 3 ? "Podium Team" : "Active Candidate"}
                </p>
              </div>
              <div className="col-span-2 text-center">
                <p className="font-display text-2xl text-emerald-200">{entry.solvedCount}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">solved</p>
              </div>
              <div className="col-span-3 text-right">
                <p className="font-display text-3xl text-cyan-100">{Number(entry.score).toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-cyan-300">xp</p>
              </div>

              {entry.rank <= 3 && (
                <div className="pointer-events-none col-span-12 mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-cyan-200/80">
                  <Trophy size={12} />
                  Elite Ranking Tier
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="px-6 py-10 text-center text-sm text-slate-400">
            No player entries yet. Create player accounts and submit flags to populate the board.
          </div>
        )}
      </div>
    </div>
  );
}
