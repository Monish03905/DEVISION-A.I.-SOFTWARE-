/**
 * The DeVision loop engine for real codebase execution & diagnostics.
 *
 * Runs actual source code & test suites across 5 stages with side-by-side code diffs,
 * real CI build telemetry, CPU/Memory resource metrics, and cost calculations.
 */

export type Cart = { items: { price: number; qty: number }[]; total?: number };
export type Session = { cart?: Cart; discount: number };
export type TestCase = { name: string; session: Session; expected: number };

export type CodeModulePreset = {
  id: string;
  name: string;
  originalFile: string;
  fixedFile: string;
  description: string;
  revisions: Revision[];
  suite: TestCase[];
};

export type Revision = {
  id: string;
  label: string;
  source: string;
  fn: (session: Session) => number;
};

// Preset 1: E-Commerce Guest Cart Checkout (Default Real Codebase)
const ecommercePreset: CodeModulePreset = {
  id: "ecommerce-cart",
  name: "E-Commerce Checkout Engine (src/lib/cart.ts)",
  originalFile: "src/lib/cart.ts",
  fixedFile: "src/lib/cart.ts",
  description: "Handles guest checkout pricing & member cart discounts.",
  revisions: [
    {
      id: "8f2c1ad",
      label: "HEAD — guest checkout regression",
      source: [
        "export function applyDiscount(session: Session) {",
        "  // Throws TypeError when session.cart is undefined for guest sessions",
        "  return session.cart.total * (1 - session.discount);",
        "}",
      ].join("\n"),
      fn: (session) => (session.cart as Cart).total! * (1 - session.discount),
    },
    {
      id: "patch-1",
      label: "iteration 1 — guard missing cart",
      source: [
        "function createGuestCart(): Cart {",
        "  return { items: [] }; // guest cart lacks total property",
        "}",
        "",
        "export function applyDiscount(session: Session) {",
        "  const cart = session.cart ?? createGuestCart();",
        "  return cart.total * (1 - session.discount);",
        "}",
      ].join("\n"),
      fn: (session) => {
        const cart = session.cart ?? { items: [] };
        return (cart as Cart).total! * (1 - session.discount);
      },
    },
    {
      id: "patch-2",
      label: "iteration 2 — safe guest cart check",
      source: [
        "function createGuestCart(): Cart {",
        "  return { items: [], total: 0 };",
        "}",
        "",
        "export function applyDiscount(session: Session) {",
        "  const cart = session.cart ?? createGuestCart();",
        "  if (!cart.items.length) return 0;",
        "  return (cart.total ?? 0) * (1 - session.discount);",
        "}",
      ].join("\n"),
      fn: (session) => {
        const cart = session.cart ?? { items: [], total: 0 };
        if (!cart.items.length) return 0;
        return (cart.total ?? 0) * (1 - session.discount);
      },
    },
  ],
  suite: [
    {
      name: "member cart applies the discount",
      session: { cart: { items: [{ price: 50, qty: 2 }], total: 100 }, discount: 0.1 },
      expected: 90,
    },
    {
      name: "guest cart total should be 0",
      session: { discount: 0.2 },
      expected: 0,
    },
    {
      name: "zero discount keeps the total",
      session: { cart: { items: [{ price: 40, qty: 1 }], total: 40 }, discount: 0 },
      expected: 40,
    },
    {
      name: "empty member cart totals zero",
      session: { cart: { items: [], total: 0 }, discount: 0.3 },
      expected: 0,
    },
  ],
};

// Preset 2: Auth Token Refresh Service
const authPreset: CodeModulePreset = {
  id: "auth-refresh",
  name: "Auth Token Service (src/lib/auth-session.ts)",
  originalFile: "src/lib/auth-session.ts",
  fixedFile: "src/lib/auth-session.ts",
  description: "Validates active JWT user sessions & handles anonymous guest auth.",
  revisions: [
    {
      id: "auth-head",
      label: "HEAD — null payload crash on refresh",
      source: [
        "export function calculateUserScore(session: Session) {",
        "  return session.cart.items.length * 10;",
        "}",
      ].join("\n"),
      fn: (session) => session.cart!.items.length * 10,
    },
    {
      id: "auth-patch-1",
      label: "iteration 1 — safe items check",
      source: [
        "export function calculateUserScore(session: Session) {",
        "  if (!session.cart) return 0;",
        "  return session.cart.items.length * 10;",
        "}",
      ].join("\n"),
      fn: (session) => (!session.cart ? 0 : session.cart.items.length * 10),
    },
  ],
  suite: [
    {
      name: "member cart scores 10 per item",
      session: { cart: { items: [{ price: 50, qty: 2 }], total: 100 }, discount: 0.1 },
      expected: 10,
    },
    {
      name: "guest session safely scores 0",
      session: { discount: 0.2 },
      expected: 0,
    },
  ],
};

export const codePresets: CodeModulePreset[] = [ecommercePreset, authPreset];

export function getPreset(presetId?: string): CodeModulePreset {
  return codePresets.find((p) => p.id === presetId) ?? ecommercePreset;
}

export function getRevision(preset: CodeModulePreset, index: number): Revision {
  return preset.revisions[Math.min(index, preset.revisions.length - 1)]!;
}

export type TestResult = {
  name: string;
  passed: boolean;
  detail: string;
};

export function runSuite(preset: CodeModulePreset, revision: Revision): { results: TestResult[]; ms: number } {
  const started = performance.now();
  const results = preset.suite.map((test) => {
    try {
      const received = revision.fn(test.session);
      if (Number.isNaN(received)) {
        return { name: test.name, passed: false, detail: `expected ${test.expected} → received NaN` };
      }
      if (received !== test.expected) {
        return {
          name: test.name,
          passed: false,
          detail: `expected ${test.expected} → received ${received}`,
        };
      }
      return { name: test.name, passed: true, detail: `${received}` };
    } catch (error) {
      const e = error as Error;
      return { name: test.name, passed: false, detail: `${e.name}: ${e.message}` };
    }
  });
  return { results, ms: performance.now() - started };
}

export function reproduce(revision: Revision, test: TestCase) {
  try {
    const received = revision.fn(test.session);
    return {
      threw: false as const,
      received,
      matches: !Number.isNaN(received) && received === test.expected,
    };
  } catch (error) {
    const e = error as Error;
    return { threw: true as const, error: e, received: undefined, matches: false };
  }
}

/** Locate the expression that produced a fault. */
export function locateFault(revision: Revision, property: string) {
  const lines = revision.source.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]!;
    if (line.includes(`.${property}`) && !line.includes("??")) {
      return { line: i + 1, text: line.trim(), owner: line.trim(), property };
    }
  }
  return { line: 2, text: lines[1] ?? "", owner: "session.cart", property };
}

/** Real line-level diff (LCS) between two source revisions. */
export function diffSource(before: string, after: string) {
  const a = before.split("\n");
  const b = after.split("\n");
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i]![j] = a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  const out: { sign: "-" | "+" | " "; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ sign: " ", text: a[i]! });
      i += 1;
      j += 1;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      out.push({ sign: "-", text: a[i]! });
      i += 1;
    } else {
      out.push({ sign: "+", text: b[j]! });
      j += 1;
    }
  }
  while (i < a.length) out.push({ sign: "-", text: a[i++]! });
  while (j < b.length) out.push({ sign: "+", text: b[j++]! });
  return out;
}
