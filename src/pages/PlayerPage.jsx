import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api";
import LeaderboardPanel from "../components/LeaderboardPanel";

export default function PlayerPage({ token, user }) {
  const [challenges, setChallenges] = useState([]);
  const [board, setBoard] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [challengeData, boardData] = await Promise.all([
        apiRequest("/challenges", {}, token),
        apiRequest("/leaderboard"),
      ]);
      setChallenges(challengeData.challenges || []);
      setBoard(boardData.leaderboard || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const currentStanding = useMemo(
    () => board.find((row) => row.username === user.username),
    [board, user.username]
  );

  const submitAnswer = async (challengeId) => {
    const answer = (answers[challengeId] || "").trim();

    if (!answer) {
      setFeedback((prev) => ({ ...prev, [challengeId]: "Enter a flag before submitting." }));
      return;
    }

    setFeedback((prev) => ({ ...prev, [challengeId]: "Submitting..." }));

    try {
      const result = await apiRequest(
        "/submissions",
        {
          method: "POST",
          body: JSON.stringify({ challengeId, answer }),
        },
        token
      );

      setFeedback((prev) => ({
        ...prev,
        [challengeId]: result.correct ? `Correct. +${result.pointsAwarded} points.` : result.message,
      }));
      setAnswers((prev) => ({ ...prev, [challengeId]: "" }));
      await load();
    } catch (err) {
      setFeedback((prev) => ({ ...prev, [challengeId]: err.message }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6 md:py-10">
      <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-3 md:p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Player</p>
          <p className="font-display text-3xl uppercase tracking-[0.1em] text-emerald-100">{user.username}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Rank</p>
          <p className="font-display text-3xl uppercase tracking-[0.1em] text-cyan-100">
            #{currentStanding?.rank || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Score</p>
          <p className="font-display text-3xl uppercase tracking-[0.1em] text-amber-100">
            {currentStanding ? Number(currentStanding.score).toLocaleString() : 0}
          </p>
        </div>
      </section>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {loading && <p className="text-sm text-zinc-400">Loading challenges...</p>}

      <section className="grid gap-4">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="rounded-xl border border-white/10 bg-[#0a1217] p-4 md:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-white">{challenge.title}</h2>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{challenge.category}</p>
              </div>
              <div className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-100">
                {challenge.points} pts
              </div>
            </div>

            <p className="mb-3 text-sm text-zinc-300">{challenge.description}</p>
            {challenge.answerFormat && (
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                Required format: {challenge.answerFormat}
              </p>
            )}
            {challenge.hint && <p className="mb-3 text-xs text-amber-200/90">Hint: {challenge.hint}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={answers[challenge.id] || ""}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [challenge.id]: event.target.value,
                  }))
                }
                disabled={challenge.solved}
                placeholder={challenge.solved ? "Solved" : "Enter flag / answer"}
                className="min-w-[200px] flex-1 rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => submitAnswer(challenge.id)}
                disabled={challenge.solved}
                className="rounded-md border border-cyan-200/60 bg-cyan-300/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-300/25 disabled:opacity-40"
              >
                {challenge.solved ? "Solved" : "Submit"}
              </button>
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Failed attempts: {challenge.failedAttempts}
              </span>
            </div>

            {feedback[challenge.id] && <p className="mt-2 text-sm text-zinc-200">{feedback[challenge.id]}</p>}
          </article>
        ))}
      </section>

      <LeaderboardPanel rows={board} compact />
    </div>
  );
}
