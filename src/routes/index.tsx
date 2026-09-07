import { createFileRoute, Link } from "@tanstack/react-router";

import { LoopConsole } from "@/components/devision/LoopConsole";
import officeKit from "@/assets/office-kit.jpg";
import phoneSurface from "@/assets/phone-surface.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeVision — AI Software Engineer That Verifies Its Own Fixes" },
      {
        name: "description",
        content:
          "DeVision runs on-device open-source AI to see an issue, understand your project, fix the code, run the tests and verify the fix actually works. Phone as the surface, Office Kit as the compute.",
      },
      { property: "og:title", content: "DeVision — AI Software Engineer" },
      {
        property: "og:description",
        content:
          "A closed loop instead of another coding chatbot: See → Understand → Fix → Test → Verify, on your own hardware.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "DeVision",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Android, Linux",
          description:
            "On-device AI software engineer that diagnoses, fixes, tests and verifies code changes in a closed loop.",
        }),
      },
    ],
  }),
  component: Index,
});

const ticker = [
  "LOOP 0x921A CLOSED IN 34S",
  "2 ITERATIONS",
  "149 TESTS GREEN",
  "0 KB LEFT THE BUILDING",
  "MODEL: OPEN-SOURCE, ON-DEVICE",
  "OFFICE KIT LINK: 14MS",
];

function RackHeader({
  index,
  label,
  title,
  intro,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="label-micro">
          RACK {index} / {label}
        </p>
        <h2 className="mt-4 font-mono text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          {title}
        </h2>
      </div>
      {intro ? <p className="max-w-[52ch] text-sm text-muted-foreground">{intro}</p> : null}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <span className="font-mono text-lg font-extrabold tracking-tighter">
              DE<span className="text-accent">V</span>ISION
            </span>
            <nav className="hidden gap-6 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground md:flex">
              <a href="#loop" className="transition-colors hover:text-accent">
                Loop
              </a>
              <a href="#hardware" className="transition-colors hover:text-accent">
                Hardware
              </a>
              <a href="#difference" className="transition-colors hover:text-accent">
                The issue
              </a>
              <a href="#architecture" className="transition-colors hover:text-accent">
                Architecture
              </a>
              <Link to="/dashboard" className="transition-colors hover:text-accent">
                Dashboard
              </Link>
              <Link to="/runs" className="transition-colors hover:text-accent">
                Runs
              </Link>
              <Link to="/planner" className="transition-colors hover:text-accent">
                Planner
              </Link>
            </nav>
          </div>
          <a
            href="#loop"
            className="rounded-sm bg-primary px-4 py-1.5 font-mono text-[11px] font-bold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            RUN_THE_LOOP
          </a>
        </div>
      </header>

      {/* RACK 00 — hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 border border-accent/25 bg-accent/10 px-2 py-1">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
                Phase 01 — Developer Tools
              </span>
            </span>
            <h1 className="text-balance font-mono text-4xl font-extrabold leading-[0.95] tracking-tight lg:text-6xl">
              AN AI ENGINEER THAT
              <br />
              PROVES THE FIX WORKS.
            </h1>
            <p className="max-w-[50ch] text-pretty text-lg text-muted-foreground">
              DeVision uses on-device, open-source AI to understand an issue, retrieve real project
              context, find the root cause, write the fix, run the tests in your development
              environment, and report whether the failure is actually gone.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#loop"
                className="inline-flex h-12 items-center rounded-sm bg-accent px-8 font-mono text-sm font-bold text-accent-foreground transition-all hover:brightness-110"
              >
                INSPECT_A_REAL_LOOP
              </a>
              <a
                href="#difference"
                className="inline-flex h-12 items-center border border-border-strong px-6 font-mono text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                SEE_THE_REAL_BUG
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden border border-border bg-surface shadow-rack">
            <div className="flex h-8 items-center gap-1.5 border-b border-border bg-background/60 px-4">
              <span className="size-2 rounded-full bg-surface-2" />
              <span className="size-2 rounded-full bg-surface-2" />
              <span className="size-2 rounded-full bg-surface-2" />
              <span className="ml-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                diagnostic_session.log
              </span>
            </div>
            <div className="space-y-3 p-6 font-mono text-xs">
              <div className="flex gap-4">
                <span className="text-muted-foreground/60">09:41:02</span>
                <span className="text-accent">[LINK]</span>
                <span>Pairing phone with DeVision Office Kit…</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground/60">09:41:07</span>
                <span className="text-fault">[FAULT]</span>
                <span className="text-foreground/80">Checkout crashes for guest sessions.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground/60">09:41:12</span>
                <span className="text-signal">[CAUSE]</span>
                <span className="text-foreground/80">applyDiscount() assumes a cart exists.</span>
              </div>
              <div className="pt-3">
                <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Patch verification</span>
                  <span className="text-accent">running</span>
                </div>
                <div className="relative h-1 overflow-hidden bg-surface-2">
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-accent/30" />
                  <div className="scan-line absolute inset-y-0 left-0 w-1/5 bg-accent" />
                </div>
              </div>
              <div className="mt-4 border border-accent/25 bg-accent/5 p-4">
                <div className="text-fault">- return session.cart.total * (1 - discount);</div>
                <div className="text-accent">+ const cart = session.cart ?? createGuestCart();</div>
                <div className="text-accent">+ if (!cart.items.length) return 0;</div>
              </div>
              <div className="flex gap-4 pt-2">
                <span className="text-muted-foreground/60">09:41:36</span>
                <span className="text-accent">[DONE]</span>
                <span>149 passed — crash no longer reproducible.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ticker rail */}
      <div className="overflow-hidden border-b border-border bg-surface py-3">
        <div className="ticker-track flex w-max gap-12 pr-12">
          {[...ticker, ...ticker].map((item, i) => (
            <span
              key={i}
              className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* RACK 01 — the loop */}
      <section id="loop" className="rack">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <RackHeader
            index="01"
            label="Diagnostic flow"
            title="SEE → UNDERSTAND → FIX → TEST → VERIFY"
            intro="Step through an actual run. Every stage feeds the next, and a failed test sends the loop back instead of handing you an unverified answer."
          />
          <div className="mt-12 border border-border shadow-rack">
            <LoopConsole />
          </div>
        </div>
      </section>

      {/* RACK 02 — hardware */}
      <section id="hardware" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <RackHeader
            index="02"
            label="Two surfaces"
            title="AN IQOO PHONE AND A LAPTOP THAT RUNS THE TESTS"
            intro="The iQOO phone is the interaction surface: camera, voice and the on-device model. The laptop is the Office Kit — it holds the checkout codebase, the terminal and the test environment where the guest-cart crash actually happens."
          />
          <div className="mt-12 grid gap-px border border-border bg-border lg:grid-cols-2">
            <article className="space-y-6 bg-background p-8 lg:p-12">
              <img
                src={phoneSurface}
                alt="An iQOO phone in one hand showing DeVision's diagnostic log in green monospace text"
                width={800}
                height={1000}
                loading="lazy"
                className="aspect-[4/5] w-full border border-border object-cover"
              />
              <p className="label-micro">iQOO smartphone — interaction surface</p>
              <h3 className="font-mono text-lg font-bold">
                Point the camera at the crash, approve the fix with your thumb
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Photograph the red stack trace on the laptop screen, or just say “checkout is
                crashing for guests”. The on-device model reads the frame, names{" "}
                <code className="text-accent">applyDiscount()</code> as the suspect and streams the
                proposed diff, the test result and the final verdict back to the phone. Nothing is
                written to the project until you approve it, and inference never leaves the handset.
              </p>
              <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                <li>Camera — capture the failing trace off the laptop screen</li>
                <li>Voice — describe the bug in one sentence, hands off the keyboard</li>
                <li>On-device AI — open-source coding model, no cloud round trip</li>
              </ul>
            </article>
            <article className="space-y-6 bg-background p-8 lg:p-12">
              <img
                src={officeKit}
                alt="Developer laptop running the DeVision Office Kit with a green port indicator"
                width={800}
                height={1000}
                loading="lazy"
                className="aspect-[4/5] w-full border border-border object-cover"
              />
              <p className="label-micro">Developer laptop — Office Kit</p>
              <h3 className="font-mono text-lg font-bold">
                Where the guest session is reproduced for real
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The Office Kit runs the checkout project, the terminal and the test suite. It replays
                a guest request with{" "}
                <code className="text-accent">session.cart = null</code>, applies each candidate
                patch in a scratch working tree, and runs the four cart tests. The phone is only
                allowed to claim a fix once this machine agrees.
              </p>
              <ul className="space-y-2 font-mono text-xs text-muted-foreground">
                <li>Local codebase — src/lib/cart.ts and its tests, on disk</li>
                <li>Terminal — the same commands you would type yourself</li>
                <li>Test environment — guest, logged-in, empty-cart and zero-discount cases</li>
              </ul>
            </article>
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Phone and laptop pair over the local network — the codebase stays on your machine.
          </p>
        </div>
      </section>

      {/* RACK 03 — the real issue */}
      <section id="difference" className="rack">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <RackHeader
            index="03"
            label="The issue"
            title="CHECKOUT CRASHES FOR EVERY GUEST SESSION"
            intro="applyDiscount() assumes session.cart exists and computes the discount from session.cart.total. Guests have no cart yet — session.cart is null — so checkout throws before the order is ever priced."
          />

          <div className="mt-12 grid gap-px border border-border bg-border lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-6 bg-background p-8 lg:p-12">
              <p className="label-micro">Reported symptom</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A signed-in customer can apply a discount and check out normally. A guest — someone
                who never added an item while logged in — hits the same button and the request dies.
                The user sees a failed checkout with no explanation; the log shows a type error deep
                inside pricing, not in the code the guest touched.
              </p>
              <div className="border border-fault/30 bg-fault/5 p-5 font-mono text-xs">
                <p className="text-fault">
                  TypeError: Cannot read properties of null (reading &apos;total&apos;)
                </p>
                <p className="mt-2 text-muted-foreground">
                  at applyDiscount (src/lib/cart.ts:42)
                </p>
                <p className="text-muted-foreground">at checkout (src/routes/checkout.ts:18)</p>
              </div>
              <div className="border border-border bg-surface p-5 font-mono text-xs leading-relaxed">
                <p className="text-muted-foreground">// src/lib/cart.ts</p>
                <p className="mt-2 text-foreground/80">
                  function applyDiscount(session, discount) {"{"}
                </p>
                <p className="text-fault">
                  &nbsp;&nbsp;return session.cart.total * (1 - discount);
                </p>
                <p className="text-foreground/80">{"}"}</p>
                <p className="mt-3 text-muted-foreground">
                  // session.cart is null for guests → throws
                </p>
              </div>
            </div>

            <div className="space-y-6 bg-surface p-8 lg:p-12">
              <p className="label-micro">Why this one is worth a loop</p>
              <ul className="space-y-4 font-mono text-sm">
                {[
                  "It only appears on one path — guest sessions — so it survives a passing test run",
                  "The error surfaces in pricing, three frames away from the real cause",
                  "A plausible-looking patch can hide it instead of fixing it (?. returns undefined, then NaN)",
                  "Only re-running the guest request proves the crash is gone",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-signal">[!]</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-6">
                <p className="label-micro">What DeVision must produce</p>
                <div className="mt-4 border border-accent/25 bg-accent/5 p-5 font-mono text-xs">
                  <div className="text-fault">- return session.cart.total * (1 - discount);</div>
                  <div className="text-accent">
                    + const cart = session.cart ?? createGuestCart();
                  </div>
                  <div className="text-accent">+ if (!cart.items.length) return 0;</div>
                  <div className="text-accent">+ return cart.total * (1 - discount);</div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  A guest gets a real empty cart, an empty cart prices at zero instead of throwing,
                  and the signed-in path keeps its old result. The loop only reports success after
                  the guest request and all four cart tests pass.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-px grid gap-px border border-t-0 border-border bg-border md:grid-cols-2">
            <div className="space-y-6 bg-background p-8 lg:p-12">
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Asking a chatbot
              </h3>
              <ul className="space-y-4 font-mono text-sm">
                {[
                  "You paste the stack trace and retype what cart.ts looks like",
                  "It suggests session.cart?.total — the crash goes away, the total becomes NaN",
                  "You apply the patch and run the guest case yourself",
                  "If it still breaks, you start the conversation over",
                  "Your checkout source is uploaded to somebody else's cloud",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="text-fault">[x]</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 bg-surface p-8 lg:p-12">
              <h3 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-accent">
                DeVision loop
              </h3>
              <ul className="space-y-4 font-mono text-sm">
                {[
                  "Replays the guest request until it reproduces the null-cart throw",
                  "Reads cart.ts and its tests, and points at line 42 as the cause",
                  "Patches guest carts, runs all four cart cases on the laptop",
                  "Rejects the NaN patch and iterates instead of reporting a false green",
                  "Open-source model on the iQOO phone — nothing uploaded",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-accent">[+]</span>
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>


      {/* RACK 04 — architecture */}
      <section id="architecture" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <RackHeader
            index="04"
            label="Architecture"
            title="FOUR MODULES, TRACED THROUGH THIS ONE BUG"
            intro="Each module is replaceable, and each one has a concrete job on the guest-checkout crash. The loop controller is the part that makes DeVision more than a prompt."
          />
          <div className="mt-12 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: "01",
                name: "Sensor",
                body: "On the laptop: replays the guest checkout request and captures the real throw — TypeError on session.cart, frame src/lib/cart.ts:42.",
                on: "Reproduces the null cart",
              },
              {
                id: "02",
                name: "Retriever",
                body: "Local index over the project: pulls applyDiscount(), the four cart tests and the commit that introduced the assumption — nothing else.",
                on: "Fetches cart.ts + its tests",
              },
              {
                id: "03",
                name: "Reasoner",
                body: "Open-source model on the iQOO NPU: states that guests have no cart yet, and writes a patch that creates one instead of guarding with ?.",
                on: "Names line 42 as the cause",
              },
              {
                id: "04",
                name: "Loop controller",
                body: "Applies the patch, runs the guest case and the full suite, rejects a patch that returns NaN, and iterates until the crash is unreproducible.",
                on: "Refuses a false green",
              },
            ].map((mod) => (
              <article key={mod.id} className="space-y-4 bg-background p-8">
                <p className="label-micro">MOD {mod.id}</p>
                <h3 className="font-mono text-base font-bold">{mod.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{mod.body}</p>
                <p className="border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  {mod.on}
                </p>
              </article>
            ))}
          </div>


          <div className="mt-px grid gap-px border border-t-0 border-border bg-border sm:grid-cols-3">
            {[
              { label: "Median loop time", value: "34s" },
              { label: "Verified fix rate", value: "72%" },
              { label: "Code sent to cloud", value: "0 KB" },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface p-8">
                <p className="label-micro">{stat.label}</p>
                <p className="mt-3 font-mono text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[70ch] font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Figures above are Phase 01 prototype targets, not audited benchmarks.
          </p>
        </div>
      </section>

      {/* RACK 05 — close */}
      <section className="rack">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label-micro">Rack 05 / Next</p>
            <h2 className="mt-4 max-w-[28ch] text-balance font-mono text-2xl font-bold tracking-tight lg:text-4xl">
              Give it a failing test and let it come back with proof.
            </h2>
          </div>
          <a
            href="#loop"
            className="inline-flex h-12 items-center rounded-sm bg-accent px-8 font-mono text-sm font-bold text-accent-foreground transition-all hover:brightness-110"
          >
            START_A_LOOP
          </a>
        </div>
      </section>

      <footer className="px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            DeVision — Phase 01 submission / Developer Tools
          </span>
          <div className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <a href="#loop" className="hover:text-accent">
              Loop
            </a>
            <a href="#architecture" className="hover:text-accent">
              Architecture
            </a>
            <a href="#difference" className="hover:text-accent">
              The issue
            </a>
            <Link to="/dashboard" className="hover:text-accent">
              Dashboard
            </Link>
            <Link to="/runs" className="hover:text-accent">
              Runs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
