export function formatPercentage(value: number) {
  if (value < 1e-4 && value > 0) {
    let formatted = (value * 1000).toFixed(2);
    formatted = formatted.replace(/\.?0+$/, '');
    if (formatted.endsWith('.')) {
      formatted = formatted.slice(0, -1);
    }
    return `${formatted}‰`;
  } else {
    let formatted = (value * 100).toFixed(2);
    formatted = formatted.replace(/\.?0+$/, '');
    if (formatted.endsWith('.')) {
      formatted = formatted.slice(0, -1);
    }
    return `${formatted}%`;
  }
}

export default formatPercentage;
