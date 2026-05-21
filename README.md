# StopWatch & Timer (React + TypeScript + Vite)

A clean, responsive **Stopwatch + Countdown Timer** built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **lucide-react**.

## Features

- **Stopwatch**
  - Start / Pause / Resume / Reset
  - Displays time as `MM:SS:CS` (and includes hours when needed)
  - Smooth circular progress ring

- **Timer**
  - Set duration using Hours / Minutes / Seconds inputs
  - Start / Pause / Reset
  - Countdown with circular progress ring
  - Color changes as the timer approaches 20% / 50% remaining

## Tech Stack

- React (v19)
- TypeScript
- Vite
- Tailwind CSS
- lucide-react (icons)

## Getting Started

```bash
pnpm install
pnpm dev
```

Then open the URL shown in the terminal.

## Available Scripts

- `pnpm dev` – start development server
- `pnpm build` – typecheck + production build
- `pnpm lint` – run ESLint
- `pnpm preview` – preview the production build

## How It Works

- **Stopwatch** uses `setInterval` (10ms tick) and calculates elapsed time from `Date.now()`.
- **Timer** computes an end timestamp (`Date.now() + duration`) and updates remaining time on an interval.
- Both modes render the time in the center and use an SVG circle for the progress ring.

## Notes

- Timer duration is clamped to valid input ranges (Hours `0-99`, Minutes/Seconds `0-59`).
- If timer input is `0`, the app shows an error message and disables the Start button.

