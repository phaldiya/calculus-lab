# Calculus Lab

[![Deploy to GitHub Pages](https://github.com/phaldiya/calculus-lab/actions/workflows/deploy.yml/badge.svg)](https://github.com/phaldiya/calculus-lab/actions/workflows/deploy.yml) [![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://phaldiya.github.io/calculus-lab/) [![Coverage](https://img.shields.io/badge/coverage-70%25-yellowgreen)](https://github.com/phaldiya/calculus-lab) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/) [![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/) [![Bun](https://img.shields.io/badge/Bun-runtime-f9f1e1?logo=bun)](https://bun.sh/)

A full-featured scientific graphing calculator built with React, TypeScript, and Plotly.js. Runs entirely in the browser — no backend required.

## Features

### Scientific Calculator (iOS-inspired)
- Standard arithmetic (+, −, ×, ÷, %, mod)
- Trigonometric functions (sin, cos, tan) with Deg/Rad toggle
- Inverse trig (sin⁻¹, cos⁻¹, tan⁻¹) via **2nd** toggle
- Hyperbolic functions (sinh, cosh, tanh) and inverses
- Logarithms (ln, log₁₀, log₂ via 2nd)
- Powers (x², x³, xʸ, 10ˣ, eˣ, 2ˣ)
- Roots (²√x, ³√x, ʸ√x)
- Factorial, reciprocal, random number
- Memory storage (mc, mr, m+, m−)
- **2nd function toggle** — swaps buttons to alternate functions
- Calculation history panel (click clock icon in header)
- Constants: π, e
- Keyboard shortcuts for all operations

### Unified Graph Tab
All graphing features in a single tab with **auto-detection** — just type an expression and the correct plot type is selected automatically:

- **2D Functions:** `sin(x)`, `x^2 + 1`, `exp(-x^2)`, etc.
- **Implicit equations:** `x^2 + y^2 = 25` — auto-detected by `=` sign
- **Inequality regions:** `y > x^2` — semi-transparent shading
- **3D Surfaces:** `sin(x) * cos(y)` — auto-detected when both x and y are used
- **Parametric 2D:** `cos(t); sin(t)` — semicolons separate components
- **Parametric 3D:** `cos(t); sin(t); t/10` — three semicolon-separated components
- **Polar:** `1 + cos(theta)` — auto-detected by theta variable
- **Interactive sliders:** Parameters like `a`, `b` auto-create sliders
- **Split view:** 2D and 3D equations coexist on the same page
- **Square grid:** 1:1 aspect ratio with centered axes
- Plot custom (x, y) coordinate pairs as scatter, line, or both
- Interactive zoom (scroll), pan (drag), and hover coordinates

### Calculus
- **Derivatives:** Symbolic differentiation via math.js (e.g., `x^3` → `3 * x ^ 2`)
- **Definite Integrals:** Numerical integration using Simpson's rule
- **Limits:** Numerical limit computation with indeterminate form handling
- Color-coded sections with visual overlay of function, derivative, integral area, and limit point

### Matrix Calculator
- Matrix operations: add, subtract, multiply, determinant, inverse, transpose
- Dynamic matrix resizing up to 5×5
- Error handling for singular matrices and dimension mismatches

### Statistics
- **Descriptive stats:** mean, median, mode, std dev, variance, min, max, Q1, Q3, IQR
- **Histogram** visualization
- **Linear & polynomial regression** with R² and fitted curve overlay

### Cross-Cutting
- **5 tabs:** Calc, Graph, Calculus, Matrix, Stats
- URL-based routing (`/scientific`, `/graph`, `/calculus`, `/matrix`, `/statistics`) — survives page reload
- Old routes (`/graphing`, `/3d-graphing`, `/parametric`, `/manipulate`) redirect to `/graph`
- Dark mode with persistent preference
- History panel (default closed, click clock icon to open)
- LocalStorage persistence with automatic migration from old state format
- Error boundaries per tab

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Plotly.js | Interactive graphing |
| math.js | Expression parsing, calculus, matrix ops |
| React Router | Client-side routing |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3.8+ (or Node.js 18+)

### Install & Run

```bash
bun install
bun dev
```

The app runs at **http://localhost:5000**. Documentation is at **/docs**.

### Setup Git Hooks

```bash
bun run setup-hooks
```

This installs **pre-commit** (lint + smoke tests) and **pre-push** (full test suite + E2E) hooks.

### Build for Production

```bash
bun run build
```

## Project Structure

```
src/
├── main.tsx / App.tsx / index.css
├── types/                      # TypeScript types & Plotly declarations
├── lib/                        # Engines: expression parser, calculus, matrix, statistics
│   └── expressionClassifier.ts # Auto-detects expression type (2D, 3D, polar, etc.)
├── context/AppContext.tsx       # React Context + useReducer
└── components/
    ├── DocsPage.tsx            # /docs documentation page
    ├── layout/                 # Header, Sidebar
    ├── scientific/             # iOS-style scientific calculator with 2nd toggle
    ├── graph/                  # Unified graph: 2D, 3D, parametric, polar, sliders
    ├── calculus/               # Derivatives, integrals, limits
    ├── matrix/                 # Matrix operations
    ├── statistics/             # Stats & regression
    └── shared/                 # History, ErrorBoundary, Icons, KaTeX
```

## Chrome Extension (Side Panel)

Calculus Lab can also run as a Chrome Extension in the browser's side panel.

### Build & Load

```bash
bun run extension:icons     # generate PNG icons from favicon.svg
bun run build:extension     # build to dist-extension/
```

1. Open `chrome://extensions` and enable **Developer mode**
2. Click **Load unpacked** and select the `dist-extension/` directory
3. Click the Calculus Lab icon in the toolbar to open the side panel

### Package for Chrome Web Store

```bash
bun run extension:zip       # produces calculus-lab-extension.zip
```

## Quick Verification

| Feature | Test | Expected |
|---|---|---|
| Calculator | `sin(π)` | `0` |
| Calculator | `sinh(1)` | `1.1752...` |
| Calculator | 2nd → `sin⁻¹(1)` | `1.5707...` |
| Graph | Plot `sin(x)` | Sine wave (2D auto-detected) |
| Graph | Plot `sin(x)*cos(y)` | 3D surface (auto-detected) |
| Graph | Plot `cos(t); sin(t)` | Unit circle (parametric auto-detected) |
| Graph | Plot `1+cos(theta)` | Cardioid (polar auto-detected) |
| Graph | Plot `a*sin(x)` | Slider for `a` auto-created |
| Graph | Plot `x^2+y^2=25` | Circle (implicit auto-detected) |
| Graph | Plot `y > x^2` | Shaded region (inequality auto-detected) |
| Calculus | d/dx `x^3` | `3 * x ^ 2` |
| Calculus | ∫ `x^2` from 0 to 1 | `0.333333` |
| Matrix | `det([[1,2],[3,4]])` | `-2.0000` |
| Stats | `1,2,...,10` | Mean = 5.5 |
