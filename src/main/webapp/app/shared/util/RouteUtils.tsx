import { ENTITY_ACTION, ENTITY_ACTION_PATH, ENTITY_BASE_PATHS, ENTITY_TYPE } from 'app/config/constants';

export const getEntityActionRoute = (entityType: ENTITY_TYPE, entityAction: ENTITY_ACTION, entityId?: number | string) => {
  let actionRouteSuffix = ENTITY_ACTION_PATH[entityAction];
  if (entityAction !== ENTITY_ACTION.CREATE) {
    actionRouteSuffix = `/${entityId}${actionRouteSuffix}`;
  }
  return `${ENTITY_BASE_PATHS[entityType]}${actionRouteSuffix}`;
};
