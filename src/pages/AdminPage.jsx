import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

const initialForm = {
  title: "",
  description: "",
  category: "",
  points: 100,
  answer: "",
  answerFormat: "",
  hint: "",
};

export default function AdminPage({ token }) {
  const [form, setForm] = useState(initialForm);
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [status, setStatus] = useState({ error: "", message: "", loading: false });

  const load = async () => {
    try {
      const [challengeData, submissionData] = await Promise.all([
        apiRequest("/admin/challenges", {}, token),
        apiRequest("/admin/submissions?limit=60", {}, token),
      ]);
      setChallenges(challengeData.challenges || []);
      setSubmissions(submissionData.submissions || []);
    } catch (err) {
      setStatus((prev) => ({ ...prev, error: err.message }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCreate = async (event) => {
    event.preventDefault();
    setStatus({ error: "", message: "", loading: true });

    try {
      await apiRequest(
        "/admin/challenges",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        token
      );
      setForm(initialForm);
      setStatus({ error: "", message: "Challenge created successfully.", loading: false });
      await load();
    } catch (err) {
      setStatus({ error: err.message, message: "", loading: false });
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:px-6 md:py-10">
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
        <h1 className="mb-4 font-display text-3xl uppercase tracking-[0.12em] text-white">Admin Control</h1>

        <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Title</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Category</span>
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              required
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              required
              rows={3}
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Points</span>
            <input
              type="number"
              min={1}
              value={form.points}
              onChange={(event) => updateField("points", Number(event.target.value))}
              required
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Answer</span>
            <input
              value={form.answer}
              onChange={(event) => updateField("answer", event.target.value)}
              required
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Answer Format (optional)</span>
            <input
              value={form.answerFormat}
              onChange={(event) => updateField("answerFormat", event.target.value)}
              placeholder="FLAG{*} or /^FLAG\{.+\}$/"
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-[0.22em] text-zinc-400">Hint (optional)</span>
            <input
              value={form.hint}
              onChange={(event) => updateField("hint", event.target.value)}
              className="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </label>

          <div className="md:col-span-2">
            {status.error && <p className="mb-2 text-sm text-rose-300">{status.error}</p>}
            {status.message && <p className="mb-2 text-sm text-emerald-300">{status.message}</p>}
            <button
              type="submit"
              disabled={status.loading}
              className="rounded-md border border-emerald-200/70 bg-emerald-300/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100 hover:bg-emerald-300/25 disabled:opacity-50"
            >
              {status.loading ? "Saving..." : "Create Challenge"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
        <h2 className="mb-3 font-display text-2xl uppercase tracking-[0.1em] text-white">Challenge Inventory</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2 text-right">Points</th>
                <th className="p-2 text-right">Solves</th>
                <th className="p-2 text-right">Failed</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="border-t border-white/10 text-zinc-200">
                  <td className="p-2">{challenge.title}</td>
                  <td className="p-2">{challenge.category}</td>
                  <td className="p-2 text-right">{challenge.points}</td>
                  <td className="p-2 text-right">{challenge.solveCount}</td>
                  <td className="p-2 text-right">{challenge.failedAttempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 md:p-6">
        <h2 className="mb-3 font-display text-2xl uppercase tracking-[0.1em] text-white">Recent Submissions</h2>
        <div className="max-h-72 overflow-auto rounded-md border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[#0d1318] text-left text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              <tr>
                <th className="p-2">User</th>
                <th className="p-2">Challenge</th>
                <th className="p-2">Result</th>
                <th className="p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                  <td className="p-2">{item.username}</td>
                  <td className="p-2">{item.challengeTitle}</td>
                  <td className={`p-2 ${item.isCorrect ? "text-emerald-300" : "text-rose-300"}`}>
                    {item.isCorrect ? "Correct" : "Wrong"}
                  </td>
                  <td className="p-2">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
