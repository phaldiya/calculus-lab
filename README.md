# Calculus Lab

A full-featured scientific graphing calculator built with React, TypeScript, and Plotly.js. Runs entirely in the browser — no backend required.

## Features

### Scientific Calculator
- Standard arithmetic (+, -, ×, ÷, %, mod)
- Trigonometric functions (sin, cos, tan) with RAD/DEG modes
- Inverse trig (asin, acos, atan)
- Logarithms (ln, log base 10)
- Powers (x², x³, xʸ, 10ˣ, eˣ), square root, reciprocal
- Factorial, absolute value
- Memory storage (MC, MR, M+, M-)
- Calculation history via shared History panel
- Constants: π, e

### Function Graphing
- Plot multiple functions simultaneously with automatic color assignment
- Standard math expressions: `sin(x)`, `x^2 + 1`, `exp(-x^2)`, etc.
- Implicit equations: `x^2 + y^2 = 25`, `x^2/9 + y^2/4 = 1`
- Inequality regions: `y > x^2`, `x^2 + y^2 < 25` with semi-transparent shading
- Interactive zoom (scroll), pan (drag), and hover coordinates
- Toggle visibility or remove individual equations
- Plot custom (x, y) coordinate pairs as scatter, line, or both
- Custom variables usable in expressions

### 3D Graphing
- Plot 3D surface equations as interactive surfaces (e.g., `sin(x) * cos(y)`)
- Multiple surfaces with automatic color assignment and toggle visibility
- Adjustable X/Y range and grid resolution controls
- Interactive rotate, zoom, and pan via Plotly 3D scene

### Calculus
- **Derivatives:** Symbolic differentiation via math.js (e.g., `x^3` → `3 * x ^ 2`)
- **Definite Integrals:** Numerical integration using Simpson's rule
- **Limits:** Numerical limit computation with indeterminate form handling
- Color-coded sections: indigo (derivatives), emerald (integrals), amber (limits)
- Visual overlay of original function, derivative, integral area, and limit point — each trace color-matched to its section

### Matrix Calculator
- Matrix operations: add, subtract, multiply, determinant, inverse, transpose
- Dynamic matrix resizing up to 5×5
- Error handling for singular matrices and dimension mismatches

### Statistics
- **Descriptive stats:** mean, median, mode, std dev, variance, min, max, Q1, Q3, IQR
- **Histogram** visualization
- **Linear & polynomial regression** with R² and fitted curve overlay

### Parametric & Polar
- **2D Parametric Curves:** plot x(t), y(t) with configurable parameter range and point count
- **3D Parametric Curves:** plot x(t), y(t), z(t) in interactive 3D space (helix, trefoil knot, toroidal spiral)
- **Polar Plots:** plot r(θ) on a polar coordinate grid (cardioid, rose, spiral, lemniscate)
- Mode toggle to switch between 2D Parametric, 3D Parametric, and Polar

### Interactive Manipulate
- Dynamic plots with sliders to adjust equation parameters in real time
- Auto-parameter detection: enter `a * sin(b * x)` and sliders for `a` and `b` are created automatically
- Configurable slider range, step size, and manual slider creation
- Supports standard 2D, implicit, and 3D surface plot types
- Slider variables integrate with global custom variables

### Cross-Cutting
- URL-based routing per tab (`/scientific`, `/graphing`, `/3d-graphing`, `/calculus`, `/matrix`, `/statistics`, `/parametric`, `/manipulate`) — survives page reload
- Dark mode with persistent preference
- Custom variables panel
- Expression history across all tabs
- LocalStorage persistence
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
├── context/AppContext.tsx       # React Context + useReducer
└── components/
    ├── DocsPage.tsx            # /docs documentation page
    ├── layout/                 # Header, Sidebar, TabPanel
    ├── scientific/             # Scientific calculator
    ├── graphing/               # Function plotting
    ├── threeDGraphing/         # 3D surface plotting
    ├── calculus/               # Derivatives, integrals, limits
    ├── matrix/                 # Matrix operations
    ├── statistics/             # Stats & regression
    ├── parametric/             # Parametric & polar curves
    ├── manipulate/             # Interactive manipulate with sliders
    └── shared/                 # History, Variables, ErrorBoundary
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
| Calculator | `2^10` | `1024` |
| Graph | Plot `sin(x)` | Sine wave |
| 3D Graph | Plot `sin(x) * cos(y)` | 3D surface |
| Calculus | d/dx `x^3` | `3 * x ^ 2` |
| Calculus | ∫ `x^2` from 0 to 1 | `0.333333` |
| Calculus | lim `sin(x)/x` at 0 | `1.000000` |
| Graph | Plot `y > x^2` | Shaded region above parabola |
| Parametric | Plot `x=cos(t), y=sin(t)` | Unit circle |
| Polar | Plot `r=1+cos(theta)` | Cardioid |
| Manipulate | Plot `a*sin(b*x)` | Sliders for a and b |
| Matrix | `det([[1,2],[3,4]])` | `-2.0000` |
| Stats | `1,2,...,10` | Mean = 5.5 |
