export enum CollapsibleDataTestIdType {
  COLLAPSIBLE = 'collapsible',
  ACTION = 'collapsible-action',
  INFO = 'collapsible-info',
  CARD = 'collapsible-card',
  TITLE_WRAPPER = 'collapsible-title-wrapper',
}
export function getCollapsibleDataTestId(dataTestid: CollapsibleDataTestIdType, identifier: string | undefined) {
  return `${identifier}-${dataTestid}`;
}

export enum AddMutationModalFieldTestIdType {
  ALTERATION = 'alteration',
  NAME = 'name',
  COMMENT = 'comment',
}

export function getAddMuationModalFieldDataTestId(
  dataTestId: AddMutationModalFieldTestIdType,
  alterationIndex: number,
  excludingIndex: number | undefined,
) {
  return `${dataTestId}-${alterationIndex}-${excludingIndex};`;
}

export function getTabDataTestId(index: number, prefix?: string) {
  if (prefix) {
    return `${prefix}-tab-${index}`;
  }
  return `${prefix}-tab-${index}`;
}
