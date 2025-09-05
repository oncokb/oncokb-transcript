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

export enum AddMutationModalDataTestIdType {
  ALTERATION_BADGE_NAME = 'alteration-badge-name',
  ALTERATION_BADGE_DELETE = 'alteration-badge-delete',
  MUTATION_DETAILS = 'mutation-details',
}

export function getAddMutationModalDataTestId(dataTestid: AddMutationModalDataTestIdType, identifier?: string) {
  return `add-mutation-modal-${identifier}-${dataTestid}`;
}
