import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import React from 'react';
import { Link } from 'react-router-dom';

const EntityPageLink: React.FunctionComponent<{
  entityType: ENTITY_TYPE;
  entityAction: ENTITY_ACTION;
  entityId?: number | string;
}> = props => {
  return <Link to={getEntityActionRoute(props.entityType, props.entityAction, props.entityId)}>{props.children}</Link>;
};
export default EntityPageLink;
