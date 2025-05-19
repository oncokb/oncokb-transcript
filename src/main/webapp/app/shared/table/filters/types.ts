export enum FilterTypes {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
}

export interface IOperator {
  id: string;
  label: string;
}

export interface StringOperator extends IOperator {
  id: 'contains' | 'not_contains' | 'equals' | 'starts_with' | 'ends_with';
}

export interface NumberOperator extends IOperator {
  id: 'equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'between';
}

export interface DateOperator extends IOperator {
  id: 'equals' | 'before' | 'after' | 'between';
}

interface IBaseFilter {
  id: string;
  field: string;
  active: boolean;
  getFilterFn: () => ((value: any) => boolean) | null;
}

export interface IStringFilter extends IBaseFilter {
  type: FilterTypes.STRING;
  operator: StringOperator['id'];
  value: string;
}

export interface INumberFilter extends IBaseFilter {
  type: FilterTypes.NUMBER;
  operator: NumberOperator['id'];
  value: number | [number, number]; // Single value or range for 'between'
}

export interface IDateFilter extends IBaseFilter {
  type: FilterTypes.DATE;
  operator: DateOperator['id'];
  value: string | [string, string]; // ISO date string or range
}

export type IFilter = IStringFilter | INumberFilter | IDateFilter;

export const STRING_OPERATORS: { [key in StringOperator['id']]: StringOperator } = {
  contains: { id: 'contains', label: 'Contains' },
  not_contains: { id: 'not_contains', label: 'Does not contain' },
  equals: { id: 'equals', label: 'Equals' },
  starts_with: { id: 'starts_with', label: 'Starts with' },
  ends_with: { id: 'ends_with', label: 'Ends with' },
};

export const applyStringOperator = (itemString: string, filterString: string, stringOperator: StringOperator) => {
  const stringValue = itemString.toLowerCase();
  const filterValue = filterString.toLowerCase();

  switch (stringOperator.id) {
    case 'contains':
      return stringValue.includes(filterValue);
    case 'not_contains':
      return !stringValue.includes(filterValue);
    case 'equals':
      return stringValue === filterValue;
    case 'starts_with':
      return stringValue.startsWith(filterValue);
    case 'ends_with':
      return stringValue.endsWith(filterValue);
    default:
      return true;
  }
};

export const NUMBER_OPERATORS: { [key in NumberOperator['id']]: NumberOperator } = {
  between: { id: 'between', label: 'Between' },
  equals: { id: 'equals', label: 'Equals' },
  greater_than: { id: 'greater_than', label: 'Greater than' },
  less_than: { id: 'less_than', label: 'Less than' },
  greater_equal: { id: 'greater_equal', label: 'Greater than or equal' },
  less_equal: { id: 'less_equal', label: 'Less than or equal' },
};

export const applyNumberOperator = (num: number, range: [number | null, number | null], numberOperator: NumberOperator) => {
  const [start, end] = range;

  switch (numberOperator.id) {
    case 'equals':
      return start !== null && num === start;
    case 'greater_than':
      return start !== null && num > start;
    case 'less_than':
      return start !== null && num < start;
    case 'greater_equal':
      return start !== null && num >= start;
    case 'less_equal':
      return start !== null && num <= start;
    case 'between':
      return start !== null && end !== null && num >= start && num <= end;
    default:
      return true;
  }
};
