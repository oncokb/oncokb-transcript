export enum CollapsibleDataTestIdType {
  COLLAPSIBLE = 'collapsible',
  ACTION = 'collapsible-action',
  INFO = 'collapsible-info',
  CARD = 'collapsible-card',
  TITLE_WRAPPER = 'collapsible-title-wrapper',
}
export function getCollapsibleDataTestId(dataTestid: CollapsibleDataTestIdType, identifier: string) {
  return `${identifier}-${dataTestid}`;
}
