import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Trophy,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Globe,
  Lock,
  Cpu,
} from "lucide-react";

/**
 * CYBER_SYNTH: Professional SFX for CTF environments.
 */
const playCyberSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "rank-up") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "point-gain") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch {
    // Audio can fail in some browser environments before user interaction.
  }
};

const INITIAL_TEAMS = [
  {
    id: "1",
    name: "ZeroDay_Ghost",
    points: 14200,
    challenges: 14,
    country: "GLOBAL",
    status: "idle",
  },
  {
    id: "2",
    name: "Root_Access",
    points: 13950,
    challenges: 12,
    country: "ACADEMY",
    status: "idle",
  },
  {
    id: "3",
    name: "NullPointer",
    points: 13800,
    challenges: 11,
    country: "ELITE",
    status: "idle",
  },
  {
    id: "4",
    name: "ShadowByte",
    points: 12500,
    challenges: 10,
    country: "CORE",
    status: "idle",
  },
  {
    id: "5",
    name: "SynFlood",
    points: 11200,
    challenges: 9,
    country: "GLOBAL",
    status: "idle",
  },
  {
    id: "6",
    name: "KernelPanic",
    points: 9800,
    challenges: 8,
    country: "ACADEMY",
    status: "idle",
  },
  {
    id: "7",
    name: "BufferOverflow",
    points: 8500,
    challenges: 7,
    country: "ELITE",
    status: "idle",
  },
  {
    id: "8",
    name: "XSS_Lord",
    points: 7100,
    challenges: 6,
    country: "CORE",
    status: "idle",
  },
  {
    id: "9",
    name: "Crypt0_Mancer",
    points: 6900,
    challenges: 5,
    country: "GLOBAL",
    status: "idle",
  },
  {
    id: "10",
    name: "SQL_Injector",
    points: 5500,
    challenges: 4,
    country: "ACADEMY",
    status: "idle",
  },
];

export default function App() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [isLive, setIsLive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [logs, setLogs] = useState([
    "[SYSTEM] Skill Merge Academy Link Established",
    "[SECURE] CTF Environment: ACTIVE",
  ]);
  const previousOrderRef = useRef(INITIAL_TEAMS.map((t) => t.id));

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 4));
  };

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setTeams((currentTeams) => {
        const randomIndex = Math.floor(Math.random() * currentTeams.length);
        const team = currentTeams[randomIndex];
        const pointGain = Math.floor(Math.random() * 250) + 100;

        const newTeams = currentTeams.map((t, idx) =>
          idx === randomIndex
            ? { ...t, points: t.points + pointGain, challenges: t.challenges + 1, status: "pwned" }
            : { ...t, status: "idle" }
        );

        const sorted = [...newTeams].sort((a, b) => b.points - a.points);

        if (soundEnabled) playCyberSound("point-gain");
        addLog(`BREACH: ${team.name} secured data block (+${pointGain})`);

        const currentOrder = sorted.map((t) => t.id);
        const hasRankShift = JSON.stringify(currentOrder) !== JSON.stringify(previousOrderRef.current);

        if (hasRankShift && soundEnabled) {
          playCyberSound("rank-up");
        }

        previousOrderRef.current = currentOrder;
        return sorted;
      });

      setTimeout(() => {
        setTeams((prev) => prev.map((t) => ({ ...t, status: "idle" })));
      }, 800);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive, soundEnabled]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080808] font-sans text-white selection:bg-[#4adeb3] selection:text-black">
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-20">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4adeb3] opacity-10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[#4adeb3] opacity-5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <header className="mb-16">
          <div className="flex flex-col items-start justify-between gap-8 border-l-2 border-[#4adeb3] py-2 pl-6 md:flex-row">
            <div className="space-y-1">
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">
                <div>
                  SKILL MERGE
                  <br />
                  HACKERS
                  <br />
                  ACADEMY
                </div>
                <div className="mx-2 h-8 w-[1px] bg-gray-700" />
                <div className="pt-2">GLOBAL DIVISION // ELITE TRAINING</div>
              </div>

              <h1 className="blackhat-font mt-4 text-6xl leading-none tracking-tighter md:text-8xl">
                SKILL MERGE
              </h1>
              <h2 className="blackhat-font text-4xl leading-none tracking-tight text-[#4adeb3] md:text-6xl">
                HACKERS ACADEMY
              </h2>
              <p className="blackhat-font mt-4 flex items-center gap-2 text-sm tracking-[0.3em] text-gray-400 opacity-80 md:text-lg">
                <Cpu size={16} /> RED TEAM ADVANCED TRAINING LAB
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-12 w-12 border transition-all ${
                  soundEnabled
                    ? "border-[#4adeb3] bg-[#4adeb3]/10 text-[#4adeb3]"
                    : "border-gray-700 text-gray-500 hover:border-gray-500"
                } flex items-center justify-center`}
                aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={`flex h-12 items-center gap-2 border px-8 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
                  isLive
                    ? "border-[#4adeb3] bg-[#4adeb3] text-black shadow-[0_0_20px_rgba(74,222,179,0.3)]"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {isLive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                {isLive ? "Live Feed" : "Paused"}
              </button>
            </div>
          </div>
        </header>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.03] p-4 md:col-span-3">
            <div className="flex items-center gap-6">
              <div className="flex shrink-0 items-center gap-2 border-r border-white/10 pr-6 text-[10px] font-bold uppercase tracking-widest text-[#4adeb3]">
                <Activity size={14} className="animate-pulse" /> Academy Logs
              </div>
              <div className="relative h-6 flex-grow overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={logs[0]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="font-mono text-xs italic text-gray-400"
                  >
                    {logs[0]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-sm bg-[#4adeb3] p-4 font-bold text-black">
            <div className="text-[10px] uppercase tracking-tighter opacity-70">Academy Honor Roll</div>
            <div className="text-xl tracking-tight">Q1 RANKINGS</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Candidate / Unit</div>
          <div className="col-span-2 text-center">Achievements</div>
          <div className="col-span-4 text-right">XP Points</div>
        </div>

        <div className="mt-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor: team.status === "pwned" ? "rgba(74,222,179,0.1)" : "rgba(255,255,255,0.02)",
                  borderColor: team.status === "pwned" ? "#4adeb3" : "rgba(255,255,255,0.08)",
                }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{
                  layout: { type: "spring", stiffness: 400, damping: 35 },
                  duration: 0.2,
                }}
                className="group relative grid grid-cols-12 items-center gap-4 rounded-sm border p-6 transition-all"
              >
                <div className="col-span-1 text-2xl font-black italic text-gray-600 transition-colors group-hover:text-[#4adeb3]">
                  {index + 1}
                </div>

                <div className="col-span-5 flex items-center gap-5">
                  <div
                    className={`h-12 w-12 border ${
                      index < 3
                        ? "border-[#4adeb3] bg-[#4adeb3]/5 text-[#4adeb3]"
                        : "border-white/10 text-gray-500"
                    } flex items-center justify-center`}
                  >
                    {index === 0 ? <Trophy size={20} /> : <Shield size={18} />}
                  </div>
                  <div>
                    <div className="text-xl font-bold uppercase tracking-tight transition-colors group-hover:text-white">
                      {team.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[9px] uppercase tracking-widest text-gray-500">
                      <Globe size={10} className="text-[#4adeb3]" /> Unit: {team.country} / Tier: S-Class
                    </div>
                  </div>
                </div>

                <div className="col-span-2 text-center">
                  <div className="text-2xl font-black">{team.challenges}</div>
                  <div className="text-[8px] font-bold uppercase tracking-widest opacity-40">Solved</div>
                </div>

                <div className="col-span-4 text-right">
                  <div className="text-4xl font-black tracking-tighter text-white">{team.points.toLocaleString()}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-[#4adeb3]">Academy XP</div>
                </div>

                {index < 3 && <div className="absolute bottom-0 left-0 top-0 w-1 bg-[#4adeb3]" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <footer className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 py-8 md:flex-row">
          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">
            <div className="flex items-center gap-2">
              <Lock size={12} />
              Academic Integrity: Active
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} />
              Network: Skill Merge Global
            </div>
          </div>
          <div className="blackhat-font text-[10px] tracking-[0.2em] opacity-40">
            © 2026 SKILL MERGE HACKERS ACADEMY. PREPARE FOR DEPLOYMENT.
          </div>
        </footer>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

            body {
              font-family: 'Inter', sans-serif;
              letter-spacing: -0.02em;
            }

            .blackhat-font {
              font-family: 'Inter', sans-serif;
              font-weight: 900;
              text-transform: uppercase;
            }

            h1.blackhat-font {
              transform: scaleY(0.95);
              letter-spacing: -0.05em;
            }
          `,
        }}
      />
    </div>
  );
}
