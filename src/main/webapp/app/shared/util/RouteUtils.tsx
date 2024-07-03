import { ENTITY_ACTION, ENTITY_ACTION_PATH, ENTITY_INFO, ENTITY_TYPE } from 'app/config/constants/constants';

export const getEntityActionRoute = (entityType: ENTITY_TYPE, entityAction: ENTITY_ACTION, entityId?: number | string): string | null => {
  let actionRouteSuffix = ENTITY_ACTION_PATH[entityAction];
  if (entityAction !== ENTITY_ACTION.ADD) {
    actionRouteSuffix = `/${entityId}${actionRouteSuffix}`;
  }
  if (ENTITY_INFO[entityType] && ENTITY_INFO[entityType].pageRoute) {
    return `${ENTITY_INFO[entityType].pageRoute}${actionRouteSuffix}`;
  }
  return null;
};

export const getEntityResourcePath = (entityType: ENTITY_TYPE) => {
  return `api${ENTITY_INFO[entityType].resourcePath}`;
};
