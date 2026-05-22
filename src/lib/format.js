export function formatKr(amount) {
  return `${new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}kr`
}
