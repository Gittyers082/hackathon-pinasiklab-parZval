/** 1420 -> "₱1,420.00". Tabular figures are applied in CSS (`tabular-nums`). */
export const peso = (n: number) =>
  '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
