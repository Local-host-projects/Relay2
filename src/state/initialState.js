export function initialState() {
  return {
    available: 18200,
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
        chain: { root: 'A', edges: [] },
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
      },
    ],
    transactions: [],
    payerPromises: [
      { id: 'pp1', amount: 150000, to: 'B', settlement: 'Sept 30', status: 'verified' },
      { id: 'pp2', amount: 80000, to: 'C', settlement: 'Sept 28', status: 'verified' },
    ],
  }
}
