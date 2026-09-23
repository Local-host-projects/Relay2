export function fmt(n) {
  return '₦' + Math.round(n).toLocaleString('en-NG')
}
