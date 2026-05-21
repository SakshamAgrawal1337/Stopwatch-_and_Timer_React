import { useEffect, useMemo, useRef, useState } from "react";

import {Timer, Clock3, Play, Pause, RotateCcw,} from "lucide-react";

type Mode = "stopwatch" | "timer";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatStopwatch(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}:${String(
      centiseconds
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}:${String(centiseconds).padStart(2, "0")}`;
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export function App() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  // Stopwatch
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchStarted, setStopwatchStarted] = useState(false);
  const stopwatchIntervalRef = useRef<number | null>(null);
  const stopwatchStartRef = useRef(0);
  const [timerEnded, setTimerEnded] = useState(false);
  // Timer
  const [timerInputHours, setTimerInputHours] = useState(0);
  const [timerInputMinutes, setTimerInputMinutes] = useState(1);
  const [timerInputSeconds, setTimerInputSeconds] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(60);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  const timerEndTimeRef = useRef(0);
  const timerInputTotalSeconds = useMemo(() => {
    return (
      clamp(timerInputHours, 0, 99) * 3600 +
      clamp(timerInputMinutes, 0, 59) * 60 +
      clamp(timerInputSeconds, 0, 59)
    );
  }, [timerInputHours, timerInputMinutes, timerInputSeconds]);

  // Cleanup
  const clearStopwatchInterval = () => {
    if (stopwatchIntervalRef.current !== null) {
      clearInterval(stopwatchIntervalRef.current);
      stopwatchIntervalRef.current = null;
    }
  };

  const clearTimerInterval = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearStopwatchInterval();
      clearTimerInterval();
    };
  }, []);

  // Stopwatch
  const startStopwatch = () => {
    if (stopwatchIntervalRef.current !== null) return;

    setStopwatchRunning(true);
    setStopwatchStarted(true);

    stopwatchStartRef.current = Date.now() - stopwatchMs;

    stopwatchIntervalRef.current = window.setInterval(() => {
      setStopwatchMs(Date.now() - stopwatchStartRef.current);
    }, 10);
  };

  const pauseStopwatch = () => {
    clearStopwatchInterval();
    setStopwatchRunning(false);
  };

  const resetStopwatch = () => {
    clearStopwatchInterval();

    setStopwatchMs(0);

    setStopwatchRunning(false);

    setStopwatchStarted(false);

    stopwatchStartRef.current = 0;
  };

  // Timer
  const startTimer = () => {
    if (timerIsRunning) return;
    setTimerEnded(false);

    if (timerTotalSeconds <= 0) return;

    timerEndTimeRef.current = Date.now() + timerTotalSeconds * 1000;

    setTimerIsRunning(true);

    clearTimerInterval();

    timerIntervalRef.current = window.setInterval(() => {
      const remainingMs = timerEndTimeRef.current - Date.now();

      const remainingSeconds = Math.ceil(remainingMs / 1000);

      if (remainingSeconds <= 0) {
        setTimerTotalSeconds(0);
        setTimerIsRunning(false);
        setTimerEnded(true); 
        clearTimerInterval();

        return;
      }

      setTimerTotalSeconds(remainingSeconds);
    }, 100);
  };

  const pauseTimer = () => {
    if (!timerIsRunning) return;

    clearTimerInterval();

    setTimerIsRunning(false);

    const remainingMs = timerEndTimeRef.current - Date.now();

    const remainingSeconds = Math.ceil(remainingMs / 1000);

    setTimerTotalSeconds(Math.max(0, remainingSeconds));
  };

  const resetTimer = () => {
    clearTimerInterval();

    setTimerIsRunning(false);

    setTimerTotalSeconds(timerInputTotalSeconds);
  };

  useEffect(() => {
    if (mode === "timer") {
      setTimerTotalSeconds(timerInputTotalSeconds);
    }
  }, [mode, timerInputTotalSeconds]);

  // Ring
  const radius = 125;

  const circumference = 2 * Math.PI * radius;

  const stopwatchProgress =
    ((stopwatchMs % 60000) / 60000) * circumference;

  const timerProgress =
    timerInputTotalSeconds > 0
      ? (timerTotalSeconds / timerInputTotalSeconds) * circumference
      : 0;

  const progress =
    mode === "stopwatch"
      ? circumference - stopwatchProgress
      : circumference - timerProgress;

  const display =
    mode === "stopwatch"
      ? formatStopwatch(stopwatchMs)
      : formatCountdown(timerTotalSeconds);

  const isLongText =
    mode === "stopwatch" && stopwatchMs >= 3600000;

  const timerColor =
    timerTotalSeconds <= timerInputTotalSeconds * 0.2
      ? "#ef4444"
      : timerTotalSeconds <= timerInputTotalSeconds * 0.5
      ? "#facc15"
      : "#22d3ee";

return (
  <div className="relative min-h-[100svh] overflow-hidden bg-gradient-to-br from-[#050816] via-[#0b1120] to-black text-white">

    {/* Animated Background Blobs */}
<div className="absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />

<div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-purple-500/20 blur-3xl animate-pulse" />

<div className="absolute top-[40%] left-[50%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
    {/* Background Glow */}
    <div
      className="absolute left-1/2 top-1/2 h-[300px] w-[300px] sm:h-[400px] sm:w-[400px]
        md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl " />

    <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-6 sm:py-10">
      <div
        className="
          w-full
          max-w-sm
          sm:max-w-md
          md:max-w-lg
          lg:max-w-xl
          rounded-[32px]
          border border-white/10
          bg-white/5
          p-5
          sm:p-6
          md:p-8
          lg:p-10
          shadow-2xl
          backdrop-blur-2xl
        "
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Timer size={26} className="text-cyan-400" />

            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-zinc-500">
              Chai Timer
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setMode("stopwatch")}
              className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                mode === "stopwatch"
                  ? "bg-cyan-400 text-black"
                  : "text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                Stopwatch
              </div>
            </button>

            <button
              onClick={() => setMode("timer")}
              className={`rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                mode === "timer"
                  ? "bg-cyan-400 text-black"
                  : "text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Timer size={16} />
                Timer
              </div>
            </button>
          </div>
        </div>

        {/* Circle */}
        <div className="relative flex items-center justify-center">
          {/* Animated Glow */}
          <div
            className={`
              absolute rounded-full blur-3xl transition-all duration-500
              h-[220px] w-[220px]
              sm:h-[280px] sm:w-[280px]
              md:h-[340px] md:w-[340px]
              ${
                mode === "stopwatch"
                  ? "bg-cyan-500/20"
                  : "bg-orange-500/20"
              }
              ${
                stopwatchRunning || timerIsRunning
                  ? "animate-pulse"
                  : ""
              }
            `}
          />

          {/* SVG */}
          <svg
            viewBox="0 0 320 320"
            className="
              h-[220px] w-[220px]
              sm:h-[260px] sm:w-[260px]
              md:h-[320px] md:w-[320px]
              -rotate-90
            "
          >
            {/* Background Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="14"
              fill="transparent"
            />

            {/* Progress Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke={mode === "stopwatch" ? "#22d3ee" : timerEnded ? "#ef4444" : timerColor}
              strokeWidth="14"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className="
                transition-all
                duration-100
                ease-linear
                drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]
              "
            />
          </svg>

          {/* Center Content */}
          <div
            className="
              absolute inset-0
              flex flex-col items-center justify-center
              text-center
            "
          >
            <p
              className="
                mb-2
                text-[10px]
                sm:text-xs
                uppercase
                tracking-[0.35em]
                text-zinc-500
              "
            >
              {mode === "stopwatch"
                ? stopwatchRunning
                  ? "RUNNING"
                  : stopwatchStarted
                  ? "PAUSED"
                  : "READY"
                : timerIsRunning
                ? "RUNNING"
                : "READY"}
            </p>

            <div
              className={`font-mono font-medium leading-none tracking-tight transition-all duration-300 text-center
                ${
                  isLongText
                    ? "text-[1.3rem] sm:text-[1.7rem] md:text-[1.8rem]"
                    : "text-[2rem] sm:text-[2.1rem] md:text-[2.7rem]"
                }
              `}
            >
              {display}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {mode === "timer" && timerInputTotalSeconds <= 0 && (
          <div className="mt-5 text-center text-sm font-medium text-red-400">
            Please set a valid timer duration.
          </div>
        )}

        {/* Timer Inputs */}
        {mode === "timer" && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={99}
                value={timerInputHours}
                onChange={(e) =>
                  setTimerInputHours(Number(e.target.value))
                }
                className="
                  w-16 sm:w-20 md:w-24
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-3 py-3
                  text-center
                  text-lg sm:text-xl md:text-2xl
                  outline-none
                  backdrop-blur-xl
                  focus:border-cyan-400
                "
              />

              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Hrs
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={59}
                value={timerInputMinutes}
                onChange={(e) =>
                  setTimerInputMinutes(Number(e.target.value))
                }
                className="
                  w-16 sm:w-20 md:w-24
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-3 py-3
                  text-center
                  text-lg sm:text-xl md:text-2xl
                  outline-none
                  backdrop-blur-xl
                  focus:border-cyan-400
                "
              />

              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Min
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <input
                type="number"
                min={0}
                max={59}
                value={timerInputSeconds}
                onChange={(e) =>
                  setTimerInputSeconds(Number(e.target.value))
                }
                className="
                  w-16 sm:w-20 md:w-24
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-3 py-3
                  text-center
                  text-lg sm:text-xl md:text-2xl
                  outline-none
                  backdrop-blur-xl
                  focus:border-cyan-400
                "
              />

              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Sec
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {mode === "stopwatch" ? (
            <>
              {!stopwatchStarted ? (
                <button
                  onClick={startStopwatch}
                  className="
                    rounded-2xl
                    bg-cyan-400
                    px-5 sm:px-6 md:px-8
                    py-2.5 md:py-3
                    font-semibold
                    text-black
                    transition-all
                    hover:scale-105
                    active:scale-95
                  "
                >
                  <div className="flex items-center gap-2">
                    <Play size={18} />
                    Start
                  </div>
                </button>
              ) : stopwatchRunning ? (
                <>
                  <button
                    onClick={pauseStopwatch}
                    className="
                      rounded-2xl
                      bg-yellow-400
                      px-5 sm:px-6 md:px-8
                      py-2.5 md:py-3
                      font-semibold
                      text-black
                      transition-all
                      hover:scale-105
                      active:scale-95
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Pause size={18} />
                      Pause
                    </div>
                  </button>

                  <button
                    onClick={resetStopwatch}
                    className="
                      group
                      rounded-2xl
                      border border-white/10
                      bg-white/5
                      px-5 sm:px-6 md:px-8
                      py-2.5 md:py-3
                      font-semibold
                      transition-all
                      hover:scale-105
                      active:scale-95
                    "
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw
                        size={18}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                      Reset
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startStopwatch}
                    className="
                      rounded-2xl
                      bg-cyan-400
                      px-5 sm:px-6 md:px-8
                      py-2.5 md:py-3
                      font-semibold
                      text-black
                      transition-all
                      hover:scale-105
                      active:scale-95
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Play size={18} />
                      Resume
                    </div>
                  </button>

                  <button
                    onClick={resetStopwatch}
                    className="
                      group
                      rounded-2xl
                      border border-white/10
                      bg-white/5
                      px-5 sm:px-6 md:px-8
                      py-2.5 md:py-3
                      font-semibold
                      transition-all
                      hover:scale-105
                      active:scale-95
                    "
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw
                        size={18}
                        className="transition-transform duration-300 group-hover:rotate-180"
                      />
                      Reset
                    </div>
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {timerIsRunning ? (
                <button
                  onClick={pauseTimer}
                  className="
                    rounded-2xl
                    bg-yellow-400
                    px-5 sm:px-6 md:px-8
                    py-2.5 md:py-3
                    font-semibold
                    text-black
                    transition-all
                    hover:scale-105
                    active:scale-95
                  "
                >
                  <div className="flex items-center gap-2">
                    <Pause size={18} />
                    Pause
                  </div>
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  disabled={timerInputTotalSeconds <= 0}
                  className="
                    rounded-2xl
                    bg-cyan-400
                    px-5 sm:px-6 md:px-8
                    py-2.5 md:py-3
                    font-semibold
                    text-black
                    transition-all
                    hover:scale-105
                    active:scale-95
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <div className="flex items-center gap-2">
                    <Play size={18} />
                    Start
                  </div>
                </button>
              )}

              <button
                onClick={resetTimer}
                className="
                  group
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-5 sm:px-6 md:px-8
                  py-2.5 md:py-3
                  font-semibold
                  transition-all
                  hover:scale-105
                  active:scale-95
                "
              >
                <div className="flex items-center gap-2">
                  <RotateCcw
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                  Reset
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);
}