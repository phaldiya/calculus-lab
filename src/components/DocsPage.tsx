import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  CalculatorIcon,
  CalculusLabIcon,
  CubeIcon,
  GraphIcon,
  IntegralIcon,
  ManipulateIcon,
  MatrixIcon,
  ParametricIcon,
  StatsIcon,
} from './shared/Icons';

const base = import.meta.env.BASE_URL;

const sections = [
  { id: 'overview', label: 'Overview', tooltip: 'Features, capabilities, and quick stats' },
  { id: 'scientific', label: 'Calculator', tooltip: 'Arithmetic, trig, logs, memory, and angle modes' },
  { id: 'graphing', label: 'Graphing', tooltip: 'Plot functions, custom points, zoom and pan' },
  { id: '3d-graphing', label: '3D Graphing', tooltip: '3D surface plots of z = f(x, y)' },
  { id: 'calculus', label: 'Calculus', tooltip: 'Derivatives, integrals, and limits' },
  { id: 'matrix', label: 'Matrix', tooltip: 'Add, multiply, invert, and transpose matrices' },
  { id: 'statistics', label: 'Statistics', tooltip: 'Descriptive stats, histograms, and regression' },
  { id: 'parametric', label: 'Parametric', tooltip: 'Parametric curves and polar plots' },
  { id: 'manipulate', label: 'Interact', tooltip: 'Interactive plots with parameter sliders' },
  { id: 'variables', label: 'Variables', tooltip: 'Custom variables, history, and URL navigation' },
  { id: 'responsive', label: 'Responsive', tooltip: 'Mobile, tablet, and desktop layouts' },
  { id: 'dark-mode', label: 'Dark Mode', tooltip: 'Toggle light/dark theme preference' },
  { id: 'shortcuts', label: 'Shortcuts', tooltip: 'Keyboard shortcuts for the calculator' },
  { id: 'keyboard', label: 'Tips', tooltip: 'Expression syntax, graph controls, and tech stack' },
  { id: 'accessibility', label: 'Accessibility', tooltip: 'WCAG 2.1 AAA compliance and assistive technology support' },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-indigo-600 text-sm dark:bg-slate-800 dark:text-indigo-400">
      {children}
    </code>
  );
}

function ExampleCard({ title, input, output }: { title: string; input: string; output: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="border-slate-200 border-b bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <span className="font-medium text-slate-500 text-xs dark:text-slate-400">{title}</span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 text-xs">Input:</span>
          <span className="font-mono text-slate-800 text-sm dark:text-slate-200">{input}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 text-xs">Output:</span>
          <span className="font-mono font-semibold text-indigo-600 text-sm dark:text-indigo-400">{output}</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 p-4 transition-colors hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-slate-800 text-sm dark:text-slate-200">{title}</h4>
        <p className="mt-0.5 text-slate-500 text-sm dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

const calculatorTabs = [
  'scientific',
  'graphing',
  '3d-graphing',
  'calculus',
  'matrix',
  'statistics',
  'parametric',
  'manipulate',
];

export default function DocsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const segment = location.pathname.replace(/^\/docs\/?/, '');
  const [activeSection, setActiveSection] = useState(segment || 'overview');
  const suppressSpy = useRef(false);
  const isUserNav = useRef(false);

  // Scroll to section on mount / path change (e.g. /#/docs/calculus)
  useEffect(() => {
    if (!segment) return;

    // Skip scroll when the URL change came from nav click or scroll-spy
    if (isUserNav.current) {
      isUserNav.current = false;
      return;
    }

    suppressSpy.current = true;

    // Use requestAnimationFrame to ensure DOM is rendered, then scroll
    requestAnimationFrame(() => {
      const el = document.getElementById(segment);
      if (el) {
        el.scrollIntoView({ behavior: 'instant' });
        setActiveSection(segment);
      }
      // Re-enable scroll-spy after scroll settles
      setTimeout(() => {
        suppressSpy.current = false;
      }, 500);
    });
  }, [segment]);

  // Scroll-spy with IntersectionObserver
  useEffect(() => {
    const navigateRef = navigate;
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressSpy.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            isUserNav.current = true;
            navigateRef(`/docs/${entry.target.id}`, { replace: true });
          }
        }
      },
      { rootMargin: '-20% 0px -75% 0px' },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [navigate]);

  const scrollTo = (id: string) => {
    suppressSpy.current = true;
    setActiveSection(id);
    isUserNav.current = true;
    navigate(`/docs/${id}`, { replace: true });
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      suppressSpy.current = false;
    }, 800);
  };

  const appRoute = calculatorTabs.includes(activeSection) ? `/${activeSection}` : '/scientific';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-slate-200 border-b bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <CalculusLabIcon className="h-8 w-8 rounded" />
            <h1 className="font-bold text-slate-800 text-xl dark:text-white">Calculus Lab</h1>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 text-xs dark:bg-indigo-900 dark:text-indigo-300">
              Docs
            </span>
          </div>
          <Link
            to={appRoute}
            className="rounded-lg bg-indigo-500 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-indigo-600"
          >
            Open App
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        {/* Side nav */}
        <nav aria-label="Documentation sections" className="hidden w-48 flex-shrink-0 lg:block">
          <div className="sticky top-24 flex flex-col gap-1">
            {sections.map((s) => (
              <div key={s.id} className="group relative">
                <button
                  type="button"
                  aria-current={activeSection === s.id ? 'true' : undefined}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    activeSection === s.id
                      ? 'bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-white text-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700">
                  {s.tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Overview */}
          <section id="overview" className="mb-16">
            <div className="mb-8">
              <h2 className="mb-3 font-bold text-3xl text-slate-800 dark:text-white">
                A powerful graphing calculator in your browser
              </h2>
              <p className="max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                Calculus Lab is a full-featured mathematical toolkit built with React. Plot functions, compute
                derivatives and integrals, perform matrix operations, and analyze statistical data — all in one place.
              </p>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
              <FeatureCard
                icon={<CalculatorIcon className="h-5 w-5" />}
                title="Scientific Calculator"
                description="Full-featured calculator with trig, log, powers, memory, factorial, and angle modes."
              />
              <FeatureCard
                icon={<GraphIcon className="h-5 w-5" />}
                title="Function Graphing"
                description="Plot multiple functions with auto-coloring, zoom, pan, and hover coordinates."
              />
              <FeatureCard
                icon={<CubeIcon className="h-5 w-5" />}
                title="3D Surface Plots"
                description="Visualize z = f(x, y) as interactive 3D surfaces with auto-assigned colors."
              />
              <FeatureCard
                icon={<IntegralIcon className="h-5 w-5" />}
                title="Calculus Operations"
                description="Symbolic derivatives, numerical integrals (Simpson's rule), and limit computation."
              />
              <FeatureCard
                icon={<MatrixIcon className="h-5 w-5" />}
                title="Matrix Calculator"
                description="Add, multiply, transpose, invert matrices, and compute determinants up to 5x5."
              />
              <FeatureCard
                icon={<StatsIcon className="h-5 w-5" />}
                title="Statistical Analysis"
                description="Descriptive statistics, histograms, linear and polynomial regression with R²."
              />
              <FeatureCard
                icon={<ParametricIcon className="h-5 w-5" />}
                title="Parametric & Polar"
                description="2D/3D parametric curves and polar plots with configurable parameter ranges."
              />
              <FeatureCard
                icon={<ManipulateIcon className="h-5 w-5" />}
                title="Interactive Manipulate"
                description="Dynamic plots with sliders to adjust equation parameters in real time."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-3 dark:bg-slate-900">
              <div className="text-center">
                <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">8</div>
                <div className="mt-1 text-slate-500 text-xs dark:text-slate-400">Calculator Modes</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">50+</div>
                <div className="mt-1 text-slate-500 text-xs dark:text-slate-400">Math Functions</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">0</div>
                <div className="mt-1 text-slate-500 text-xs dark:text-slate-400">Backend Required</div>
              </div>
            </div>
          </section>

          {/* Scientific Calculator */}
          <section id="scientific" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Scientific Calculator</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              A full-featured scientific calculator for everyday and advanced computations. Supports arithmetic,
              trigonometry, logarithms, powers, factorials, memory storage, and both radian and degree angle modes.
            </p>

            <img
              src={`${base}docs/scientific-tab.png`}
              alt="Scientific calculator"
              className="mb-6 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />

            <div className="space-y-4">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Arithmetic & Powers</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Basic" input="25 × 4 + 10" output="110" />
                  <ExampleCard title="Power" input="2^10" output="1024" />
                  <ExampleCard title="Square root" input="√(144)" output="12" />
                  <ExampleCard title="Reciprocal" input="1/(8)" output="0.125" />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Trigonometry</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Includes <CodeBlock>sin</CodeBlock>, <CodeBlock>cos</CodeBlock>, <CodeBlock>tan</CodeBlock> and their
                  inverses (<CodeBlock>sin⁻¹</CodeBlock>, <CodeBlock>cos⁻¹</CodeBlock>, <CodeBlock>tan⁻¹</CodeBlock>).
                </p>

                <div className="mb-4 rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                  <strong>RAD vs DEG:</strong> These buttons control how angles are interpreted by trig functions.{' '}
                  <CodeBlock>RAD</CodeBlock> treats input as radians (full circle = 2π), while{' '}
                  <CodeBlock>DEG</CodeBlock> treats input as degrees (full circle = 360°). The default is RAD. The
                  active mode is highlighted — click the other to switch.
                </div>

                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="sin(90) in DEG" input="sin(90) [DEG]" output="1" />
                  <ExampleCard title="sin(90) in RAD" input="sin(90) [RAD]" output="0.8939..." />
                  <ExampleCard title="cos(60) in DEG" input="cos(60) [DEG]" output="0.5" />
                  <ExampleCard title="cos(π/3) in RAD" input="cos(π/3) [RAD]" output="0.5" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Sine (radians)" input="sin(π)" output="0" />
                  <ExampleCard title="Inverse" input="sin⁻¹(1)" output="1.5707... (π/2)" />
                  <ExampleCard title="Tangent" input="tan(π/4)" output="1" />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Logarithms & Constants</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Natural log" input="ln(e)" output="1" />
                  <ExampleCard title="Log base 10" input="log(1000)" output="3" />
                  <ExampleCard title="Pi" input="π" output="3.1415926536" />
                  <ExampleCard title="Euler's number" input="e" output="2.7182818285" />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Memory & History</h3>
                <p className="mb-2 text-slate-500 dark:text-slate-400">
                  Use <CodeBlock>M+</CodeBlock>, <CodeBlock>M-</CodeBlock>, <CodeBlock>MR</CodeBlock>, and{' '}
                  <CodeBlock>MC</CodeBlock> to store and recall values. The <CodeBlock>Ans</CodeBlock> button inserts
                  the previous result. All calculations are logged in the shared History panel on the right sidebar.
                </p>
              </div>
            </div>
          </section>

          {/* Graphing */}
          <section id="graphing" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Graphing</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Plot mathematical functions instantly. Type an expression using standard math notation and hit{' '}
              <CodeBlock>Plot</CodeBlock> to see it rendered on an interactive Cartesian plane. Each equation gets a
              unique color automatically.
            </p>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Supported Expressions</h3>
            <img
              src={`${base}docs/graph-tab.png`}
              alt="Graphing tab showing multiple plotted equations"
              className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />
            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ExampleCard title="Trigonometric" input="sin(x)" output="Sine wave" />
              <ExampleCard title="Polynomial" input="x^3 - 2*x + 1" output="Cubic curve" />
              <ExampleCard title="Exponential" input="exp(-x^2)" output="Gaussian bell curve" />
              <ExampleCard title="Logarithmic" input="log(x)" output="Natural log curve" />
              <ExampleCard title="Square Root" input="sqrt(x)" output="Square root curve" />
              <ExampleCard title="Composite" input="sin(x) * exp(-x/5)" output="Damped sine wave" />
            </div>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Implicit Equations</h3>
            <p className="mb-3 text-slate-500 dark:text-slate-400">
              Enter equations with <CodeBlock>=</CodeBlock> to plot implicit curves. Both sides are evaluated over a 2D
              grid and the zero-contour is drawn. Implicit equations display a purple <CodeBlock>implicit</CodeBlock>{' '}
              badge in the equation list.
            </p>
            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ExampleCard title="Circle" input="x^2 + y^2 = 25" output="Circle of radius 5" />
              <ExampleCard title="Ellipse" input="x^2/9 + y^2/4 = 1" output="Ellipse" />
              <ExampleCard title="Hyperbola" input="x^2 - y^2 = 1" output="Hyperbolic curves" />
              <ExampleCard title="Lemniscate" input="(x^2+y^2)^2 = x^2-y^2" output="Figure-eight curve" />
            </div>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Inequality Regions</h3>
            <p className="mb-3 text-slate-500 dark:text-slate-400">
              Use <CodeBlock>&gt;</CodeBlock>, <CodeBlock>&lt;</CodeBlock>, <CodeBlock>&gt;=</CodeBlock>, or{' '}
              <CodeBlock>&lt;=</CodeBlock> to plot shaded inequality regions. The expression is rearranged automatically
              and the region satisfying the inequality is filled with a semi-transparent color. Inequality equations
              display an amber badge showing the operator.
            </p>
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ExampleCard title="Parabolic region" input="y > x^2" output="Shaded region above parabola" />
              <ExampleCard title="Disk" input="x^2 + y^2 < 25" output="Filled circle of radius 5" />
              <ExampleCard title="Half-plane" input="y >= 2*x + 1" output="Region above the line" />
              <ExampleCard title="Band" input="y <= sin(x) + 2" output="Region below shifted sine" />
            </div>
            <div className="mb-6 rounded-xl bg-amber-50 p-4 text-amber-700 text-sm dark:bg-amber-950 dark:text-amber-300">
              <strong>Note:</strong> Inequality plots use Plotly's contour constraint mode. You can overlay multiple
              inequalities to visualize feasible regions for systems of inequalities — each gets its own color with 30%
              opacity so overlapping areas are visible.
            </div>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Plotting Custom Points</h3>
            <img
              src={`${base}docs/custom-points.png`}
              alt="Custom points showing scatter, line, and both plot modes"
              className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />
            <p className="mb-4 text-slate-500 dark:text-slate-400">
              Click <CodeBlock>+ Plot custom points</CodeBlock> to enter (x, y) coordinate pairs manually. Choose
              between scatter, line, or both display modes. Points appear as an additional trace overlaid on the graph.
              Use <CodeBlock>Clear All</CodeBlock> to remove all equations and point datasets at once.
            </p>

            <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
              <strong>Tip:</strong> Use scroll to zoom, drag to pan. Hover over any curve to see exact (x, y)
              coordinates displayed in the top-right corner.
            </div>
          </section>

          {/* 3D Graphing */}
          <section id="3d-graphing" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">3D Graphing</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Plot 3D surfaces from <CodeBlock>z = f(x, y)</CodeBlock> expressions. Enter a two-variable function and
              explore the surface interactively with orbit, zoom, and pan controls. Each surface gets a unique color
              automatically, just like 2D graphing.
            </p>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Supported Expressions</h3>
            <img
              src={`${base}docs/3d-tab.png`}
              alt="3D graphing tab showing multiple surface plots"
              className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />
            <p className="mb-3 text-slate-500 dark:text-slate-400">
              Any expression using <CodeBlock>x</CodeBlock> and <CodeBlock>y</CodeBlock> as variables. Standard math
              functions work the same as in 2D graphing.
            </p>
            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ExampleCard title="Trigonometric" input="sin(x) * cos(y)" output="Ripple surface" />
              <ExampleCard title="Gaussian" input="exp(-(x^2 + y^2))" output="Bell-shaped peak" />
              <ExampleCard title="Saddle" input="x^2 - y^2" output="Hyperbolic paraboloid" />
              <ExampleCard title="Radial" input="sin(sqrt(x^2 + y^2))" output="Concentric rings" />
            </div>

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Controls</h3>
            <div className="mb-6 space-y-3">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="mb-1 font-medium text-slate-800 text-sm dark:text-slate-200">X/Y Range</h4>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  Set the minimum and maximum values for both X and Y axes. Default range is &minus;5 to 5 for both.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <h4 className="mb-1 font-medium text-slate-800 text-sm dark:text-slate-200">Grid Resolution</h4>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  Control the mesh density from 10 to 100 points per axis. Higher values produce smoother surfaces but
                  may be slower to render.
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
              <strong>Tip:</strong> Click and drag to orbit the 3D view. Scroll to zoom. You can plot multiple surfaces
              simultaneously and toggle their visibility individually.
            </div>
          </section>

          {/* Calculus */}
          <section id="calculus" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Calculus</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Perform symbolic differentiation, numerical integration, and limit computation. Results are visualized
              alongside the original function on the graph. Use <CodeBlock>Clear All</CodeBlock> to reset all inputs and
              results.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Derivatives</h3>
                <img
                  src={`${base}docs/calculus-tab.png`}
                  alt="Calculus tab showing derivative, integral, and limit computations"
                  className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Computes symbolic derivatives using math.js. Enter any expression and click
                  <CodeBlock>d/dx</CodeBlock> to get the derivative. The original function (solid line) and its
                  derivative (dashed line) are plotted together.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Power rule" input="x^3" output="3 * x ^ 2" />
                  <ExampleCard title="Trig" input="sin(x)" output="cos(x)" />
                  <ExampleCard title="Chain rule" input="sin(x^2)" output="2 * x * cos(x ^ 2)" />
                  <ExampleCard title="Product" input="x * cos(x)" output="cos(x) - x * sin(x)" />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Definite Integrals</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Computes definite integrals numerically using Simpson's rule with 1000 intervals. The shaded area
                  under the curve is visualized on the graph.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Polynomial" input="x^2 from 0 to 1" output="0.333333" />
                  <ExampleCard title="Trigonometric" input="sin(x) from 0 to pi" output="2.000000" />
                  <ExampleCard title="Exponential" input="exp(x) from 0 to 1" output="1.718282" />
                  <ExampleCard title="Gaussian" input="exp(-x^2) from -1 to 1" output="1.493648" />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Limits</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Evaluates limits numerically by approaching the target point from both sides. Handles indeterminate
                  forms like 0/0.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Classic" input="sin(x)/x as x -> 0" output="1.000000" />
                  <ExampleCard title="Indeterminate" input="(x^2-1)/(x-1) as x -> 1" output="2.000000" />
                </div>
              </div>
            </div>
          </section>

          {/* Matrix */}
          <section id="matrix" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Matrix Calculator</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Perform matrix operations on matrices up to 5x5. Resize matrices dynamically using the row/column
              selectors. Operations that only need one matrix (determinant, inverse, transpose) automatically hide
              Matrix B. Use <CodeBlock>Clear All</CodeBlock> to reset matrices and results to defaults.
            </p>

            <img
              src={`${base}docs/matrix-tab.png`}
              alt="Matrix tab showing determinant computation"
              className="mb-6 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />

            <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Operations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-slate-200 border-b dark:border-slate-700">
                    <th className="py-2 pr-4 font-medium text-slate-800 dark:text-white">Operation</th>
                    <th className="py-2 pr-4 font-medium text-slate-800 dark:text-white">Button</th>
                    <th className="py-2 font-medium text-slate-800 dark:text-white">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-500 dark:text-slate-400">
                  <tr className="border-slate-100 border-b dark:border-slate-800">
                    <td className="py-2 pr-4">Addition</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>A + B</CodeBlock>
                    </td>
                    <td className="py-2">Element-wise addition of two matrices of the same dimensions</td>
                  </tr>
                  <tr className="border-slate-100 border-b dark:border-slate-800">
                    <td className="py-2 pr-4">Subtraction</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>A - B</CodeBlock>
                    </td>
                    <td className="py-2">Element-wise subtraction</td>
                  </tr>
                  <tr className="border-slate-100 border-b dark:border-slate-800">
                    <td className="py-2 pr-4">Multiplication</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>A x B</CodeBlock>
                    </td>
                    <td className="py-2">Standard matrix multiplication (columns of A must equal rows of B)</td>
                  </tr>
                  <tr className="border-slate-100 border-b dark:border-slate-800">
                    <td className="py-2 pr-4">Determinant</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>det(A)</CodeBlock>
                    </td>
                    <td className="py-2">Computes the determinant of a square matrix</td>
                  </tr>
                  <tr className="border-slate-100 border-b dark:border-slate-800">
                    <td className="py-2 pr-4">Inverse</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>A^-1</CodeBlock>
                    </td>
                    <td className="py-2">Computes the inverse (errors on singular matrices)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Transpose</td>
                    <td className="py-2 pr-4">
                      <CodeBlock>A^T</CodeBlock>
                    </td>
                    <td className="py-2">Flips rows and columns</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ExampleCard title="Determinant" input="[[1,2],[3,4]]" output="-2.0000" />
              <ExampleCard title="Inverse check" input="det(A) != 0" output="Matrix is invertible" />
            </div>
          </section>

          {/* Statistics */}
          <section id="statistics" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Statistics</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Enter numerical data to instantly see descriptive statistics and a distribution histogram. Switch to X,Y
              pairs mode for regression analysis. Use <CodeBlock>Clear All</CodeBlock> to reset all data and results.
            </p>

            <img
              src={`${base}docs/stats-tab.png`}
              alt="Statistics tab showing descriptive stats and histogram"
              className="mb-6 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Descriptive Statistics</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Enter numbers separated by commas, spaces, or newlines. Statistics are computed automatically as you
                  type.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Mean', desc: 'Arithmetic average' },
                    { label: 'Median', desc: 'Middle value' },
                    { label: 'Mode', desc: 'Most frequent value(s)' },
                    { label: 'Std Dev', desc: 'Standard deviation' },
                    { label: 'Variance', desc: 'Squared deviation from mean' },
                    { label: 'Q1 / Q3', desc: 'First & third quartiles' },
                    { label: 'IQR', desc: 'Interquartile range' },
                    { label: 'Min / Max', desc: 'Data bounds' },
                    { label: 'Range', desc: 'Max minus Min' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                      <div className="font-medium text-slate-800 text-sm dark:text-slate-200">{s.label}</div>
                      <div className="mt-0.5 text-slate-400 text-xs">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Regression</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Click <CodeBlock>X,Y pairs</CodeBlock> to switch to coordinate input mode. Choose between linear or
                  polynomial regression (degree 2-4). The fitted curve is plotted over the scatter data with an R²
                  goodness-of-fit measure.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard
                    title="Linear"
                    input="(1,2),(2,4),(3,5),(4,8)"
                    output="y = 1.9000x + -0.1000 (R²=0.97)"
                  />
                  <ExampleCard title="Polynomial" input="Degree 2 fit" output="y = ax² + bx + c with R² score" />
                </div>
              </div>
            </div>
          </section>

          {/* Parametric & Polar */}
          <section id="parametric" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Parametric & Polar</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Plot parametric curves in 2D and 3D, or polar graphs. Switch between modes using the segmented toggle at
              the top of the input panel. Each mode provides context-sensitive input fields for the relevant expressions
              and parameter ranges.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">2D Parametric Curves</h3>
                <img
                  src={`${base}docs/parametric-tab.png`}
                  alt="Parametric tab showing 2D parametric curves"
                  className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Define curves with separate <CodeBlock>x(t)</CodeBlock> and <CodeBlock>y(t)</CodeBlock> expressions.
                  Set the parameter range with <CodeBlock>t min</CodeBlock>, <CodeBlock>t max</CodeBlock>, and the
                  number of sample points. The curve is drawn as a connected line in the Cartesian plane.
                </p>
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Circle" input="x(t) = cos(t), y(t) = sin(t)" output="Unit circle" />
                  <ExampleCard title="Lissajous" input="x(t) = sin(3t), y(t) = sin(2t)" output="Figure-eight knot" />
                  <ExampleCard title="Spiral" input="x(t) = t*cos(t), y(t) = t*sin(t)" output="Archimedean spiral" />
                  <ExampleCard title="Cycloid" input="x(t) = t - sin(t), y(t) = 1 - cos(t)" output="Rolling curve" />
                </div>
                <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                  <strong>Tip:</strong> The default range is <CodeBlock>t: 0 to 2π</CodeBlock> with 200 sample points.
                  Increase the point count for smoother curves or decrease it for faster rendering.
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">3D Parametric Curves</h3>
                <img
                  src={`${base}docs/parametric-3d-tab.png`}
                  alt="3D Parametric curves showing helix, trefoil knot, and toroidal spiral"
                  className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Add a third expression <CodeBlock>z(t)</CodeBlock> to plot curves in 3D space. The resulting curve is
                  rendered with Plotly's 3D scatter mode, supporting orbit, zoom, and pan interactions.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard
                    title="Helix"
                    input="x = cos(t), y = sin(t), z = t/5"
                    output="Spiral rising along z-axis"
                  />
                  <ExampleCard
                    title="Trefoil knot"
                    input="x = sin(t)+2sin(2t), y = cos(t)-2cos(2t), z = -sin(3t)"
                    output="3D knot"
                  />
                  <ExampleCard
                    title="Toroidal spiral"
                    input="x = (2+cos(5t))cos(t), y = (2+cos(5t))sin(t), z = sin(5t)"
                    output="Spiral on torus"
                  />
                  <ExampleCard
                    title="Conical helix"
                    input="x = t*cos(t), y = t*sin(t), z = t"
                    output="Expanding helix"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Polar Plots</h3>
                <img
                  src={`${base}docs/parametric-polar-tab.png`}
                  alt="Polar plots showing cardioid, rose, spiral, and lemniscate curves"
                  className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Enter a single <CodeBlock>r(θ)</CodeBlock> expression to plot in polar coordinates. The angle
                  parameter is <CodeBlock>theta</CodeBlock> in radians. Curves are rendered on a polar coordinate grid
                  with angular gridlines.
                </p>
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Cardioid" input="r(θ) = 1 + cos(theta)" output="Heart-shaped curve" />
                  <ExampleCard title="Rose" input="r(θ) = cos(3 * theta)" output="Three-petal rose" />
                  <ExampleCard title="Spiral" input="r(θ) = theta / (2*pi)" output="Archimedean spiral" />
                  <ExampleCard title="Lemniscate" input="r(θ) = sqrt(cos(2*theta))" output="Figure-eight" />
                </div>
                <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                  <strong>Tip:</strong> The default range is <CodeBlock>θ: 0 to 2π</CodeBlock>. For multi-loop curves
                  like spirals, increase the maximum to <CodeBlock>4π</CodeBlock> or <CodeBlock>6π</CodeBlock>. Polar
                  plots use Plotly's <CodeBlock>scatterpolar</CodeBlock> trace type with angles displayed in degrees.
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Equation Management</h3>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  Each plotted equation shows a colored badge indicating its type (2D, 3D, or Polar). Use the toggle
                  switch to show or hide individual curves. Click the <CodeBlock>×</CodeBlock> button to remove an
                  equation, or <CodeBlock>Clear All</CodeBlock> to reset everything. Multiple curves of the same or
                  different types can be plotted simultaneously.
                </p>
              </div>
            </div>
          </section>

          {/* Interactive Manipulate */}
          <section id="manipulate" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Interactive Manipulate</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Create dynamic visualizations where equation parameters are controlled by interactive sliders. Type an
              expression with named parameters (any letter except <CodeBlock>x</CodeBlock>, <CodeBlock>y</CodeBlock>,{' '}
              <CodeBlock>z</CodeBlock>, <CodeBlock>t</CodeBlock>) and sliders are created automatically.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Auto-Parameter Detection</h3>
                <img
                  src={`${base}docs/manipulate-tab.png`}
                  alt="Interactive manipulate tab with sliders controlling equation parameters"
                  className="mb-4 w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  When you plot an expression, the app analyzes it using the math.js AST to find undefined symbols that
                  aren't built-in variables or functions. For each detected parameter, a slider is created with sensible
                  defaults (<CodeBlock>-5</CodeBlock> to <CodeBlock>5</CodeBlock>, step <CodeBlock>0.1</CodeBlock>).
                </p>
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <ExampleCard title="Amplitude & frequency" input="a * sin(b * x)" output="Sliders for a and b" />
                  <ExampleCard title="Phase shift" input="sin(x + phi)" output="Slider for phi" />
                  <ExampleCard
                    title="Damped oscillation"
                    input="a * exp(-k * x) * cos(w * x)"
                    output="Sliders for a, k, w"
                  />
                  <ExampleCard
                    title="Polynomial coefficients"
                    input="a*x^3 + b*x^2 + c*x + d"
                    output="Sliders for a, b, c, d"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Slider Controls</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Sliders appear in two places: the sidebar <CodeBlock>Parameters</CodeBlock> panel (with configurable
                  min, max, and step) and the <CodeBlock>Slider Bar</CodeBlock> below the plot (for quick adjustment).
                  Moving a slider immediately re-renders the graph with the new parameter value.
                </p>
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="mb-1 font-medium text-slate-800 text-sm dark:text-slate-200">Configure Range</h4>
                    <p className="text-slate-500 text-sm dark:text-slate-400">
                      Each slider has editable min, max, and step fields in the sidebar. Change these to control the
                      parameter's range and precision. For example, set step to <CodeBlock>0.01</CodeBlock> for
                      fine-grained control.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="mb-1 font-medium text-slate-800 text-sm dark:text-slate-200">Manual Sliders</h4>
                    <p className="text-slate-500 text-sm dark:text-slate-400">
                      Add sliders manually by typing a name in the <CodeBlock>Add param</CodeBlock> field and clicking{' '}
                      <CodeBlock>Add</CodeBlock>. This is useful for pre-creating parameters before entering an
                      expression.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <h4 className="mb-1 font-medium text-slate-800 text-sm dark:text-slate-200">Performance</h4>
                    <p className="text-slate-500 text-sm dark:text-slate-400">
                      Slider updates are throttled with <CodeBlock>requestAnimationFrame</CodeBlock> to ensure smooth
                      interaction even with complex expressions. The graph re-renders at the display's refresh rate.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Axis Ranges & Grid</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Customize the X and Y axis ranges and grid resolution from the sidebar. The default range is{' '}
                  <CodeBlock>-10 to 10</CodeBlock> for both axes with a grid resolution of <CodeBlock>50</CodeBlock>{' '}
                  points. Higher resolution produces smoother curves at the cost of computation time.
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Variable Integration</h3>
                <p className="mb-3 text-slate-500 dark:text-slate-400">
                  Slider parameters integrate with the global Variables panel. If you define a variable{' '}
                  <CodeBlock>a = 5</CodeBlock> in the sidebar and also have a slider for <CodeBlock>a</CodeBlock>, the
                  slider value takes precedence. This lets you use sliders for dynamic parameters while keeping other
                  variables fixed.
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-4 text-indigo-700 text-sm dark:bg-indigo-950 dark:text-indigo-300">
                <strong>Example workflow:</strong> Type <CodeBlock>a * sin(b * x + c)</CodeBlock> and click Plot. Three
                sliders appear for <CodeBlock>a</CodeBlock> (amplitude), <CodeBlock>b</CodeBlock> (frequency), and{' '}
                <CodeBlock>c</CodeBlock> (phase). Drag each slider to explore how each parameter transforms the wave in
                real time. Use the sidebar to widen the slider range or adjust the step size for finer control.
              </div>
            </div>
          </section>

          {/* Variables */}
          <section id="variables" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Variables & History</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              The right sidebar provides two cross-cutting features available across all tabs.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-2 font-semibold text-base text-slate-800 dark:text-white">Custom Variables</h3>
                <p className="mb-3 text-slate-500 text-sm dark:text-slate-400">
                  Define reusable variables in the Variables panel. Set <CodeBlock>a = 3</CodeBlock> and then plot{' '}
                  <CodeBlock>a * sin(x)</CodeBlock>. Variables persist across sessions via localStorage.
                </p>
                <ExampleCard title="Variable usage" input="Set a=2, b=3 then plot a*x + b" output="Line y = 2x + 3" />
              </div>

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-2 font-semibold text-base text-slate-800 dark:text-white">Expression History</h3>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  Every computation across all tabs is logged in the History panel. See your past derivatives,
                  integrals, matrix operations, and regression results at a glance. Click <CodeBlock>Clear</CodeBlock>{' '}
                  to reset.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
                <h3 className="mb-2 font-semibold text-base text-slate-800 dark:text-white">URL-Based Navigation</h3>
                <p className="mb-3 text-slate-500 text-sm dark:text-slate-400">
                  Each calculator mode has its own URL, so you can bookmark or share a direct link. The active tab is
                  preserved on page reload.
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  {[
                    ['/scientific', 'Calculator'],
                    ['/graphing', 'Graphing'],
                    ['/3d-graphing', '3D Graphing'],
                    ['/calculus', 'Calculus'],
                    ['/matrix', 'Matrix'],
                    ['/statistics', 'Statistics'],
                    ['/parametric', 'Parametric'],
                    ['/manipulate', 'Interact'],
                    ['/docs', 'Documentation'],
                  ].map(([path, label]) => (
                    <div key={path} className="flex items-center gap-2">
                      <CodeBlock>{path}</CodeBlock>
                      <span className="text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Responsive Design */}
          <section id="responsive" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Responsive Design</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Calculus Lab adapts to any screen size. The layout adjusts across three breakpoints: mobile (&lt;768px),
              tablet (768px&ndash;1023px), and desktop (1024px+).
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Mobile (375px)</h3>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                  On phones the left sidebar collapses into a bottom tab bar for easy thumb navigation. The right panel
                  (variables &amp; history) is hidden and accessible via a slide-over drawer triggered by the panel icon
                  in the header. Inner panels stack vertically — inputs on top, plots below.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  <img
                    src={`${base}docs/mobile-scientific.png`}
                    alt="Mobile scientific calculator with bottom tab bar"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-graphing.png`}
                    alt="Mobile graphing view with stacked layout"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-3d.png`}
                    alt="Mobile 3D graphing view with stacked layout"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-calculus.png`}
                    alt="Mobile calculus view with stacked inputs"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-statistics.png`}
                    alt="Mobile statistics view with stacked layout"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-parametric.png`}
                    alt="Mobile parametric view with stacked layout"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-manipulate.png`}
                    alt="Mobile interactive manipulate view with sliders"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                  <img
                    src={`${base}docs/mobile-drawer.png`}
                    alt="Mobile slide-over drawer with variables and history"
                    className="rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                  />
                </div>
                <p className="mt-2 text-slate-400 text-xs">
                  Left to right: Calculator, Graphing, 3D, Calculus, Statistics, Parametric, Interact, Variables drawer
                </p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Tablet (768px)</h3>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                  On tablets the left sidebar reappears as the standard vertical navigation. The right panel stays
                  hidden behind the drawer toggle, giving full width to the main content and graph plots. Inner panels
                  switch to their horizontal side-by-side layout.
                </p>
                <img
                  src={`${base}docs/tablet-graphing.png`}
                  alt="Tablet graphing view with sidebar and horizontal layout"
                  className="w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-lg text-slate-800 dark:text-white">Desktop (1024px+)</h3>
                <p className="mb-4 text-slate-500 dark:text-slate-400">
                  On desktop both sidebars are available: left for navigation, right for variables and history. The
                  right panel can be toggled via the panel icon in the header &mdash; it defaults to open on wide
                  screens (1280px+) and collapsed on narrower desktops (1024&ndash;1279px).
                </p>
                <img
                  src={`${base}docs/desktop-graphing.png`}
                  alt="Desktop graphing view with all panels visible"
                  className="w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Breakpoint Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-slate-200 border-b dark:border-slate-700">
                        <th className="py-2 pr-4 font-medium text-slate-800 dark:text-white">Feature</th>
                        <th className="py-2 pr-4 font-medium text-slate-800 dark:text-white">Mobile</th>
                        <th className="py-2 pr-4 font-medium text-slate-800 dark:text-white">Tablet</th>
                        <th className="py-2 font-medium text-slate-800 dark:text-white">Desktop</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-500 dark:text-slate-400">
                      <tr className="border-slate-100 border-b dark:border-slate-800">
                        <td className="py-2 pr-4">Left navigation</td>
                        <td className="py-2 pr-4">Bottom tab bar</td>
                        <td className="py-2 pr-4">Vertical sidebar</td>
                        <td className="py-2">Vertical sidebar</td>
                      </tr>
                      <tr className="border-slate-100 border-b dark:border-slate-800">
                        <td className="py-2 pr-4">Right panel</td>
                        <td className="py-2 pr-4">Slide-over drawer</td>
                        <td className="py-2 pr-4">Slide-over drawer</td>
                        <td className="py-2">Toggleable sidebar</td>
                      </tr>
                      <tr className="border-slate-100 border-b dark:border-slate-800">
                        <td className="py-2 pr-4">Inner panels</td>
                        <td className="py-2 pr-4">Stacked vertically</td>
                        <td className="py-2 pr-4">Side by side</td>
                        <td className="py-2">Side by side</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4">Panel toggle</td>
                        <td className="py-2 pr-4">Visible</td>
                        <td className="py-2 pr-4">Visible</td>
                        <td className="py-2">Visible</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Dark Mode */}
          <section id="dark-mode" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Dark Mode</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Click the moon/sun icon in the top-right corner to toggle dark mode. The preference is saved automatically
              and persists between sessions.
            </p>

            <img
              src={`${base}docs/dark-mode.png`}
              alt="Calculus Lab in dark mode"
              className="w-full rounded-xl border border-slate-200 shadow-lg dark:border-slate-700"
            />
          </section>

          {/* Keyboard Shortcuts */}
          <section id="shortcuts" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Keyboard Shortcuts</h2>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              The scientific calculator supports full keyboard input. Just start typing — no need to click the on-screen
              buttons. Modifier keys (Ctrl, Cmd, Alt) are never intercepted so browser shortcuts keep working normally.
            </p>

            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
              <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Key Mappings</h3>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {[
                  ['0 – 9', 'Digit input'],
                  ['.', 'Decimal point'],
                  ['+ - * /', 'Arithmetic operators'],
                  ['%', 'Percent / modulo'],
                  ['( )', 'Parentheses'],
                  ['^', 'Exponent (xʸ)'],
                  ['!', 'Factorial'],
                  ['Enter / =', 'Evaluate expression'],
                  ['Backspace', 'Delete last character'],
                  ['Escape', 'All clear (AC)'],
                  ['Delete', 'Clear current entry (C)'],
                  ['p', 'Insert π'],
                  ['e', "Insert Euler's number"],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd className="flex-shrink-0 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-600 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {key}
                    </kbd>
                    <span className="text-slate-500 dark:text-slate-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tips */}
          <section id="keyboard" className="mb-16">
            <h2 className="mb-2 font-bold text-2xl text-slate-800 dark:text-white">Tips & Reference</h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Expression Syntax</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  {[
                    ['Addition', 'x + 1'],
                    ['Subtraction', 'x - 1'],
                    ['Multiplication', '2 * x'],
                    ['Division', 'x / 2'],
                    ['Exponent', 'x ^ 2'],
                    ['Parentheses', '(x + 1) ^ 2'],
                    ['Sine', 'sin(x)'],
                    ['Cosine', 'cos(x)'],
                    ['Tangent', 'tan(x)'],
                    ['Arc sine', 'asin(x)'],
                    ['Arc cosine', 'acos(x)'],
                    ['Arc tangent', 'atan(x)'],
                    ['Exponential', 'exp(x)'],
                    ['Natural log', 'log(x)'],
                    ['Log base 10', 'log10(x)'],
                    ['Square root', 'sqrt(x)'],
                    ['Absolute value', 'abs(x)'],
                    ['Floor', 'floor(x)'],
                    ['Ceiling', 'ceil(x)'],
                    ['Pi constant', 'pi'],
                    ["Euler's number", 'e'],
                  ].map(([name, expr]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{name}</span>
                      <CodeBlock>{expr}</CodeBlock>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Graph Interactions</h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {[
                    ['Scroll wheel', 'Zoom in/out'],
                    ['Click + drag', 'Pan the view'],
                    ['Hover on curve', 'See (x, y) coordinates'],
                    ['Double-click', 'Reset zoom to default'],
                    ['Color toggle', 'Show/hide individual equations'],
                    ['X button', 'Remove an equation'],
                  ].map(([action, desc]) => (
                    <div key={action} className="flex items-center gap-3">
                      <kbd className="flex-shrink-0 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-slate-600 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {action}
                      </kbd>
                      <span className="text-slate-500 dark:text-slate-400">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Plotly.js', 'math.js'].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Accessibility */}
          <section id="accessibility" className="mb-16">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-bold text-2xl text-slate-800 dark:text-white">Accessibility</h2>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-semibold text-green-700 text-xs dark:bg-green-900 dark:text-green-300">
                WCAG 2.1 AAA
              </span>
            </div>
            <p className="mb-6 text-slate-500 dark:text-slate-400">
              Calculus Lab is designed and tested for WCAG 2.1 Level AAA compliance. Every interactive element is
              keyboard-reachable, properly labeled, and announced by screen readers.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Features</h3>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  {[
                    [
                      'Skip Navigation',
                      'Press Tab on page load to reveal a "Skip to content" link that bypasses the header and sidebar.',
                    ],
                    [
                      'Landmark Regions',
                      'Semantic <main>, <nav>, <aside>, and role attributes let screen readers jump between sections.',
                    ],
                    [
                      'Live Regions',
                      'Calculator results, errors, and computation outputs use aria-live to announce changes automatically.',
                    ],
                    [
                      'Focus Management',
                      'The mobile drawer traps focus and closes on Escape. All interactive elements have visible focus indicators.',
                    ],
                    [
                      'Form Labels',
                      'Every input, select, and textarea has an accessible name via aria-label or associated <label>.',
                    ],
                    [
                      'Color Contrast',
                      'All text meets a 7:1 contrast ratio against its background for AAA compliance.',
                    ],
                    [
                      'Keyboard Support',
                      'Full keyboard navigation for the scientific calculator, tab switching, drawer toggle, and all form controls.',
                    ],
                    [
                      'Dialog Semantics',
                      'The mobile drawer is announced as a dialog with aria-modal and a labeled title.',
                    ],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex flex-col gap-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{title}</span>
                      <span className="text-slate-500 dark:text-slate-400">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-900">
                <h3 className="mb-3 font-semibold text-base text-slate-800 dark:text-white">Standards & Testing</h3>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {[
                    ['WCAG 2.1 AAA', 'Full conformance with all Level A, AA, and AAA success criteria'],
                    [
                      'ARIA Roles',
                      'Correct use of role, aria-label, aria-live, aria-pressed, aria-expanded, and aria-selected',
                    ],
                    ['Biome Linting', 'All a11y lint rules enforced at error level to prevent regressions'],
                    ['Screen Readers', 'Tested with VoiceOver (macOS) for proper announcements and navigation'],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-lg bg-white p-3 dark:bg-slate-800">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{title}</div>
                      <div className="mt-0.5 text-slate-400 text-xs">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-slate-200 border-t pt-8 pb-12 text-center text-slate-400 text-sm dark:border-slate-800">
            Built with React, TypeScript, and Plotly.js
          </footer>
        </main>
      </div>
    </div>
  );
}
