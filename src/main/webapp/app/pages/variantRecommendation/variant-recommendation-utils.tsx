export function inputFilterMethod(filter, row) {
  if (!filter.value) return true;
  return String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase());
}
export function numberFilterMethod(filter, row) {
  const [minValue, maxValue] = filter.value;
  if (!minValue && !maxValue) return true;
  return (!minValue || Number(row[filter.id]) >= Number(minValue)) && (!maxValue || Number(row[filter.id]) <= Number(maxValue));
}

export function silderFilterMethod(filter, row) {
  const [minValue, maxValue] = filter.value;
  return row[filter.id] >= Number(minValue) && row[filter.id] <= Number(maxValue);
}
