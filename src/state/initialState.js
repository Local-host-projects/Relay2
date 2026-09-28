export function initialState() {
  return {
    available: 18200,

    // ── Distinct accounts (identity + auth only) ──
    // These hold *credentials* for signing in as each identity — separate
    // from `business` below, which stays the dashboard's actual data record
    // (unverified/verified status, roster, etc.) so PayerDashboard and
    // AdminBoard don't need to change. `payer` here starts null — there's no
    // business identity to sign in as until someone actually registers one
    // through the separate Payer auth flow.
    accounts: {
      personal: {
        phone: '0803 123 4567',
        relayId: 'B-0421',
        pinSet: true,
        name: 'Bello',
        // A personal account can *opt in* to also act as a Liquidity Provider —
        // intentionally the SAME account, not a separate identity, per the
        // "regular users can double as LPs" rule. Payers, by contrast, are a
        // fully separate registered account — that distinction is the point.
        isLP: false,
        lpSettings: { minDiscount: 2, maxDiscount: 8 }, // % — set on the LP-mode toggle screen
      },
      payer: null, // becomes { businessEmail, phone, pin } once registered via the Payer auth flow
    },

    // ── Session ──
    // Which identity is currently signed in. Only one at a time — switching
    // identity means signing out and re-authenticating as that identity, not
    // flipping a `role` field on one shared session.
    //   type: null | 'personal' | 'payer' | 'admin'
    session: { type: null },

    business: { name: '', rc: '', type: 'employer', verified: false },
    workers: [
      { id: 'w1', name: 'Adaeze O.', phone: '0803 111 2222', email: 'adaeze@example.com', salary: 250000 },
      { id: 'w2', name: 'Chidi M.', phone: '0803 333 4444', email: 'chidi@example.com', salary: 180000 },
    ],
    escrows: [],
    requests: [
      { id: 'rq1', kind: 'trusted', issuerType: 'employer', issuerName: 'Aethercode Ltd', to: 'Adaeze O.', phone: '0803 111 2222', email: 'adaeze@example.com', amount: 250000, settlement: 'Sept 30', note: 'Sept salary', status: 'pending', created: 'now' },
    ],
    lpPortfolio: [],
    notifications: [
      { id: 'n1', text: 'Promise #8472 verified — ₦5,000 spendable now', time: 'now', kind: 'promise', promiseId: 'p-8472', accepted: false },
      { id: 'n2', text: 'Salary promise verified — settles Sept 30', time: '2h', kind: 'promise', promiseId: 'p-salary', accepted: true },
    ],
    promises: [
      {
        id: 'p-salary',
        amount: 25000,
        remaining: 25000,
        from: 'Employer — Aethercode Ltd',
        to: 'You',
        label: 'Salary',
        settlement: 'Settles Sept 30',
        status: 'verified',
        spendable: true,
        health: 'healthy',
        kind: 'trusted',
        pendingAccept: false,
      },
      {
        id: 'p-8472',
        amount: 5000,
        remaining: 5000,
        from: 'A',
        to: 'You',
        label: 'From A',
        settlement: 'Network is down — settling when it returns',
        status: 'verified',
        spendable: true,
        health: 'healthy',
        kind: 'in-transit',
        chain: { root: 'A', edges: [] },
        pendingAccept: false,
      },
      {
        id: 'p-refund',
        amount: 2000,
        remaining: 2000,
        from: 'Merchant refund',
        to: 'You',
        label: 'Refund',
        settlement: 'Settles tomorrow',
        status: 'verified',
        spendable: true,
        health: 'attention',
        kind: 'escrow',
        pendingAccept: true,
      },
    ],
    transactions: [],
    externalBids: [],
    payerPromises: [
      { id: 'pp1', amount: 150000, to: 'B', settlement: 'Sept 30', status: 'verified', kind: 'trusted' },
      { id: 'pp2', amount: 80000, to: 'C', settlement: 'Sept 28', status: 'verified', kind: 'in-transit' },
    ],
  }
}
